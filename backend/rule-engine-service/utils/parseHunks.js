// utils/parseHunks.js
/**
 * Parse a git patch string into line-level changes
 * @param {string} patch - GitHub PR file patch (diff)
 * @returns {Array} List of { lineNumber, line }
 */
function parseHunks(patch) {
    const lines = patch.split("\n");
    const results = [];
  
    let currentLineNumber = 0;
  
    lines.forEach(line => {
      if (line.startsWith("@@")) {
        // Example: @@ -1,6 +1,7 @@
        const match = /@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
        if (match) {
          currentLineNumber = parseInt(match[1], 10) - 1;
        }
      } else if (line.startsWith("+") && !line.startsWith("+++")) {
        currentLineNumber++;
        results.push({
          lineNumber: currentLineNumber,
          line: line.substring(1), // remove '+'
        });
      } else if (!line.startsWith("-")) {
        currentLineNumber++;
      }
    });
  
    return results;
  }
  
  module.exports = { parseHunks };
  