// ai-summary.js
import { runLocalFlanT5 } from "./gpt.js"; // your Flan-T5 fetch wrapper

export async function generateAISummary(prData) {
  if (!prData || !prData.analysis) return "❌ Invalid PR data.";

  // Collect findings
  const findingsText = prData.analysis
    .map(f => `- ${f.humanMessage}`)
    .join("\n");

  // Compose prompt for the model
  const prompt = `
You are a professional software reviewer. 
Summarize this PR of4 lines in a clear, concise, and human-readable manner, highlighting:
- Key changes made
- Potential issues or risks
- Impact on functionality
- Recommendations for reviewer or next steps

PR Title: "${prData.details.title}"
Repository: "${prData.repo}"
Number of files changed: ${prData.files.length}

Detailed findings:
${findingsText}

Please generate a well-structured summary, suitable for sending to a team or including in a PR review note.
`;

  // Call local Flan-T5
  const summary = await runLocalFlanT5(prompt);

  // Optionally, trim and return
  return summary?.trim() || "❌ AI summary could not be generated.";
}

// Quick test
if (process.argv[2] === "test") {
  (async () => {
    const fakePR = {
      details: { title: "Add new logging feature" },
      repo: "example/repo",
      files: [{ filename: "logger.js" }],
      analysis: [
        { humanMessage: 'In "logger.js" line 12, avoid console.log in production.' },
        { humanMessage: 'Function "logMessage" (5-20): 5 additions, 0 deletions. No notable issues.' }
      ]
    };

    const summary = await generateAISummary(fakePR);
    console.log("📝 AI Summary:\n", summary);
  })();
}
