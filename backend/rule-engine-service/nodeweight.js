// rule-engine.js
// Tree-based Java-aware PR analyzer

const typeDeclRe =
  /\b(?:public|protected|private|abstract|final|static\s+)*\b(class|interface|enum)\s+([A-Za-z_][A-Za-z0-9_]*)\b/;
const javaMethodRe =
  /\b(?:public|protected|private)?\s*(?:static\s+)?[A-Za-z0-9_<>\[\]]+\s+([A-Za-z_][A-Za-z0-9_]*)\s*\([^;{]*\)\s*\{/;
const constructorUseRe = /\bnew\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
const genericUseRe = /<\s*([A-Za-z_][A-Za-z0-9_]*)\s*>/g;

// Parse diff patch into line entries
function parsePatch(patch) {
  if (!patch || typeof patch !== "string") return [];
  const lines = patch.split("\n");
  let oldLine = 0, newLine = 0;
  const out = [];

  for (const raw of lines) {
    if (raw.startsWith("@@")) {
      const m = /@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(raw);
      if (m) {
        oldLine = parseInt(m[1], 10) - 1;
        newLine = parseInt(m[2], 10) - 1;
      }
      continue;
    }

    if (raw.startsWith("+")) {
      newLine++;
      out.push({ type: "added", line: raw.slice(1), lineNumber: newLine });
    } else if (raw.startsWith("-")) {
      oldLine++;
      out.push({ type: "removed", line: raw.slice(1), lineNumber: oldLine });
    } else {
      oldLine++;
      newLine++;
      out.push({ type: "context", line: raw.startsWith(" ") ? raw.slice(1) : raw, lineNumber: newLine });
    }
  }
  return out;
}

// Node class for tree
class Node {
  constructor(type, name, startLine) {
    this.type = type; // "class" | "method" | "root"
    this.name = name;
    this.startLine = startLine;
    this.endLine = startLine;
    this.addedLines = 0;
    this.removedLines = 0;
    this.usageCounts = new Map();
    this.children = [];
    this.forbiddenPatterns = [];
  }
}

// Build entity tree
function buildEntityTree(lines) {
  const root = new Node("root", "PRRoot", 0);
  let stack = [root];
  let braceCountStack = [0];

  lines.forEach((entry) => {
    const text = entry.line;

    const typeDecl = typeDeclRe.exec(text);
    const methDecl = javaMethodRe.exec(text);

    if (typeDecl) {
      const node = new Node("class", typeDecl[2], entry.lineNumber);
      stack[stack.length - 1].children.push(node);
      stack.push(node);
      braceCountStack.push(0);
    } else if (methDecl) {
      const node = new Node("method", methDecl[1], entry.lineNumber);
      stack[stack.length - 1].children.push(node);
      stack.push(node);
      braceCountStack.push(0);
    }

    // Update brace count
    const openBraces = (text.match(/{/g) || []).length;
    const closeBraces = (text.match(/}/g) || []).length;
    braceCountStack[braceCountStack.length - 1] += openBraces - closeBraces;

    // Track added/removed lines
    if (entry.type === "added") stack[stack.length - 1].addedLines++;
    if (entry.type === "removed") stack[stack.length - 1].removedLines++;

    // Track usage of constructors / generics
    let m;
    if (entry.type !== "removed") {
      while ((m = constructorUseRe.exec(text)) !== null) {
        const name = m[1];
        stack[stack.length - 1].usageCounts.set(name, (stack[stack.length - 1].usageCounts.get(name) || 0) + 1);
      }
      while ((m = genericUseRe.exec(text)) !== null) {
        const name = m[1];
        stack[stack.length - 1].usageCounts.set(name, (stack[stack.length - 1].usageCounts.get(name) || 0) + 1);
      }
    }

    // Forbidden patterns
    const forbiddenPatterns = [
      { re: /console\.log\(/, type: "console_log", severity: "critical", message: "console.log in Java?" },
      { re: /\bdebugger\b/, type: "debugger_statement", severity: "warning", message: "Remove debugger statements." },
      { re: /\b(TODO|FIXME)\b/, type: "todo_comment", severity: "info", message: "Found TODO/FIXME." },
      { re: /eval\(/, type: "eval_usage", severity: "critical", message: "Avoid eval(); security risk." },
    ];
    forbiddenPatterns.forEach((p) => {
      if (p.re.test(text)) stack[stack.length - 1].forbiddenPatterns.push({ ...p, line: entry.lineNumber, text });
    });

    // Pop nodes when scope ends
    while (braceCountStack[braceCountStack.length - 1] <= 0 && stack.length > 1) {
      const finished = stack.pop();
      finished.endLine = entry.lineNumber;
      braceCountStack.pop();
    }
  });

  return root;
}

// Traverse tree and generate output
function traverseTree(node, results = []) {
  if (node.type !== "root") {
    results.push({
      type: node.type,
      name: node.name,
      startLine: node.startLine,
      endLine: node.endLine,
      addedLines: node.addedLines,
      removedLines: node.removedLines,
      forbiddenPatterns: node.forbiddenPatterns,
      usageCounts: Array.from(node.usageCounts.entries()).map(([k, v]) => ({ name: k, count: v })),
    });
  }
  node.children.forEach((child) => traverseTree(child, results));
  return results;
}

// Analyze PR
function analyzePR(prData) {
  const results = [];

  if (!prData || !Array.isArray(prData.files)) {
    return [{ type: "error", message: "Invalid PR payload: missing files array" }];
  }

  prData.files.forEach((file) => {
    const filename = file?.filename || "(unknown file)";
    const ext = (filename.split(".").pop() || "").toLowerCase();
    const changes = Number(file?.changes || 0);

    if (changes > 500) {
      results.push({
        type: "large_change",
        severity: "warning",
        file: filename,
        message: `File has ${changes} total changes; consider splitting into smaller PRs.`,
      });
    }

    if (!file?.patch) return;

    const lines = parsePatch(file.patch);

    // Build entity tree
    const rootNode = buildEntityTree(lines);
    const entitySummaries = traverseTree(rootNode);

    // Detect brace mismatch globally
    const totalBraceDelta = lines.reduce((delta, l) => delta + ((l.line.match(/{/g) || []).length - (l.line.match(/}/g) || []).length), 0);
    if (totalBraceDelta !== 0) {
      results.push({
        type: "unbalanced_braces",
        severity: "critical",
        file: filename,
        message: "Brace mismatch detected.",
      });
    }

    // Detect removed types still used (simple heuristic)
    const removedTypes = lines.filter((l) => l.type === "removed").map((l) => {
      const decl = typeDeclRe.exec(l.line);
      return decl ? decl[2] : null;
    }).filter(Boolean);

    removedTypes.forEach((t) => {
      const count = entitySummaries.reduce((sum, e) => sum + (e.usageCounts.find(u => u.name === t)?.count || 0), 0);
      if (count > 0) {
        results.push({
          type: "removed_type_still_used",
          severity: "critical",
          file: filename,
          message: `Type '${t}' was removed but is still referenced (${count} times).`,
        });
      } else {
        results.push({
          type: "type_removed",
          severity: "warning",
          file: filename,
          message: `Type '${t}' removed in this file.`,
        });
      }
    });

    results.push(...entitySummaries.map((e) => ({ ...e, file: filename })));
  });

  return results.length ? results : [];
}

export { analyzePR };
