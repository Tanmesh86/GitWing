// rule-engine.js (Java-aware Structural & Semantic Checks)

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
      out.push({
        type: "context",
        line: raw.startsWith(" ") ? raw.slice(1) : raw,
        lineNumber: newLine
      });
    }
  }
  return out;
}

/**
 * Lightweight Java-aware scanners
 */

// Extract declared types (class/interface/enum) from a line
const typeDeclRe =
  /\b(?:public|protected|private|abstract|final|static\s+)*\b(class|interface|enum)\s+([A-Za-z_][A-Za-z0-9_]*)\b/;

// Extract Java method declaration names (very forgiving)
const javaMethodRe =
  /\b(?:public|protected|private)?\s*(?:static\s+)?[A-Za-z0-9_<>\[\]]+\s+([A-Za-z_][A-Za-z0-9_]*)\s*\([^;{]*\)\s*\{/;

// Detect constructor calls and generic uses:  new Edge(…),  List<Edge>
const constructorUseRe = /\bnew\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/g;
const genericUseRe = /<\s*([A-Za-z_][A-Za-z0-9_]*)\s*>/g;

/**
 * Scan diff for structure & symbol changes/uses
 */
function javaStructuralAndSymbolScan(lines) {
  const removedTypes = new Set();
  const addedTypes = new Set();

  // Count braces delta introduced by the patch (if != 0, structure likely broken)
  let braceDelta = 0;

  // Usage counts for any symbol mentioned in added OR context (resulting file view)
  // Using added+context (not only added) makes us catch references that remain after a removal.
  const usageCounts = new Map();

  // Track obviously non-Java insertions (stray text) and console.log in .java
  const addedNonJavaText = [];
  const addedConsoleLog = [];

  for (const entry of lines) {
    const text = entry.line;

    if (entry.type === "added" || entry.type === "removed") {
      braceDelta += (text.match(/{/g) || []).length;
      braceDelta -= (text.match(/}/g) || []).length;
    }

    // Declarations
    const decl = typeDeclRe.exec(text);
    if (decl) {
      const name = decl[2];
      if (entry.type === "removed") removedTypes.add(name);
      if (entry.type === "added") addedTypes.add(name);
    }

    // Usages (look at added + context, i.e., what likely remains visible)
    if (entry.type !== "removed") {
      // constructor uses
      let m1;
      while ((m1 = constructorUseRe.exec(text)) !== null) {
        const name = m1[1];
        usageCounts.set(name, (usageCounts.get(name) || 0) + 1);
      }
      // generics
      let m2;
      while ((m2 = genericUseRe.exec(text)) !== null) {
        const name = m2[1];
        usageCounts.set(name, (usageCounts.get(name) || 0) + 1);
      }
    }

    // Non-Java inserts (very simple heuristic: added line with plain sentence not in comment/string)
    if (entry.type === "added") {
      const trimmed = text.trim();
      const looksLikePlainText =
        /^[A-Za-z].* [A-Za-z].*$/.test(trimmed) && // words & spaces
        !/;|\{|\}|\(|\)|\/\/|\/\*|\*\/|package\s|import\s|class\s|interface\s|enum\s/.test(trimmed);
      if (looksLikePlainText) {
        addedNonJavaText.push({ lineNumber: entry.lineNumber, text: trimmed });
      }
      if (/console\.log\s*\(/.test(text)) {
        addedConsoleLog.push({ lineNumber: entry.lineNumber, text });
      }
    }
  }

  return {
    removedTypes,
    addedTypes,
    usageCounts,
    braceDelta,
    addedNonJavaText,
    addedConsoleLog,
  };
}

/**
 * Detect functions & classes with span using brace counting.
 * We classify entity as "class" or "function".
 */
function detectEntities(lines) {
  const entities = [];
  let current = null;
  let braceCount = 0;

  lines.forEach((entry) => {
    const text = entry.line;

    // Start of class?
    const typeDecl = typeDeclRe.exec(text);
    if (typeDecl) {
      if (current) entities.push(current);
      current = {
        entity: "class",
        name: typeDecl[2],
        start: entry.lineNumber,
        end: entry.lineNumber,
        lines: [entry],
      };
      braceCount =
        (text.match(/{/g) || []).length - (text.match(/}/g) || []).length;
      return;
    }

    // Start of method?
    const methDecl = javaMethodRe.exec(text);
    if (methDecl) {
      if (current) entities.push(current);
      current = {
        entity: "function",
        name: methDecl[1],
        start: entry.lineNumber,
        end: entry.lineNumber,
        lines: [entry],
      };
      braceCount =
        (text.match(/{/g) || []).length - (text.match(/}/g) || []).length;
      return;
    }

    // Body continuation
    if (current) {
      current.lines.push(entry);
      braceCount +=
        (text.match(/{/g) || []).length - (text.match(/}/g) || []).length;
      current.end = entry.lineNumber;
      if (braceCount <= 0) {
        entities.push(current);
        current = null;
        braceCount = 0;
      }
    }
  });

  if (current) entities.push(current);
  return entities;
}

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

    // --- Java-aware structural & semantic scan
    const scan = javaStructuralAndSymbolScan(lines);

    // Brace mismatch (introduced by this diff)
    if (scan.braceDelta !== 0) {
      results.push({
        type: "unbalanced_braces",
        severity: "critical",
        file: filename,
        message: "Brace mismatch introduced by changes (missing { or }).",
      });
    }

    // Removed type still used (e.g., Edge)
    for (const t of scan.removedTypes) {
      const count = scan.usageCounts.get(t) || 0;
      if (count > 0) {
        results.push({
          type: "removed_type_still_used",
          severity: "critical",
          file: filename,
          message: `Type '${t}' was removed but is still referenced (${count} occurrence${count > 1 ? "s" : ""}).`,
        });
      } else {
        // still noteworthy
        results.push({
          type: "type_removed",
          severity: "warning",
          file: filename,
          message: `Type '${t}' was removed in this file.`,
        });
      }
    }

    // Language mismatch / stray text (esp. for .java files)
    if (ext === "java") {
      for (const row of scan.addedConsoleLog) {
        results.push({
          type: "non_java_syntax",
          severity: "critical",
          file: filename,
          line: row.lineNumber,
          message: "Non-Java construct detected: console.log in .java file.",
        });
      }
      for (const row of scan.addedNonJavaText) {
        results.push({
          type: "stray_text_added",
          severity: "warning",
          file: filename,
          line: row.lineNumber,
          message: `Stray non-Java text added: "${row.text.slice(0, 80)}"`,
        });
      }
    }

    // Generic forbidden/security patterns (keep your existing ones)
    const forbiddenPatterns = [
      { re: /console\.log\(/, type: "console_log", severity: ext === "java" ? "critical" : "info", message: ext === "java" ? "console.log is invalid in Java source." : "Avoid console.log in production." },
      { re: /\bdebugger\b/, type: "debugger_statement", severity: "warning", message: "Remove debugger statements." },
      { re: /\b(TODO|FIXME)\b/, type: "todo_comment", severity: "info", message: "Found TODO/FIXME, resolve or link ticket." },
      { re: /eval\(/, type: "eval_usage", severity: "critical", message: "Avoid using eval(); security risk." },
    ];

    lines.forEach((entry) => {
      if (entry.type !== "added" && entry.type !== "removed") return;
      const text = entry.line;
      forbiddenPatterns.forEach((p) => {
        if (p.re.test(text)) {
          results.push({
            type: p.type,
            severity: p.severity,
            file: filename,
            line: entry.lineNumber,
            message: p.message,
          });
        }
      });
    });

    // Entity summaries (classes & functions)
    const entities = detectEntities(lines);
    entities.forEach((e) => {
      const addedLines = e.lines.filter((l) => l.type === "added").length;
      const removedLines = e.lines.filter((l) => l.type === "removed").length;

      results.push({
        type: e.entity === "class" ? "class_summary" : "function_summary",
        severity: "safe",
        file: filename,
        [e.entity]: e.name,
        startLine: e.start,
        endLine: e.end,
        addedLines,
        removedLines,
        impact: `${e.entity[0].toUpperCase() + e.entity.slice(1)} modified`,
      });
    });
  });

  // PR-level: (optional) large PR, etc. Add back if you want totals.
  // const totalChanges = prData.files.reduce((s, f) => s + (f.changes || 0), 0);
  // if (totalChanges > 1000) results.push({ type: "large_pr", severity: "warning", message: `PR has ${totalChanges} changes; consider splitting.` });

  return results.length ? results : [];
}


export { analyzePR };
