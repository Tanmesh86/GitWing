// server.js
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { analyzePR } from "./rule-engine.js";

dotenv.config(); // must be at top

const app = express();
app.use(bodyParser.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Rule Engine Service running ✅" });
});

// Analyze Pull Request
app.post("/analyze", async (req, res) => {
  try {
    const prData = req.body;
    if (!prData || !prData.files) {
      return res.status(400).json({ error: "Invalid PR data format" });
    }

    // Step 1: Run rule-based analysis
    const findings = analyzePR(prData);
    const actionableFindings = findings.filter(f => f.severity !== "safe");

    // Step 2: Convert findings to human-readable lines
    const actionableFindingsText = actionableFindings.length
      ? actionableFindings.map(f => {
          const filePart = f.file ? `File: ${f.file}` : "";
          const linePart = f.line ? `Line: ${f.line}` : "";
          const fnPart = f.function ? `Function: ${f.function}` : "";
          return `- [${f.severity}] ${f.message} ${filePart} ${linePart} ${fnPart}`.trim();
        }).join("\n")
      : "No notable issues detected.";

    // Step 3: Build a simple summary (without AI)
    const summary = actionableFindings.length > 0
      ? `${actionableFindings.length} potential issues found`
      : "No issues detected ✅";

    // Step 4: Respond back
    res.json({
      summary,
      findings,
      details: actionableFindingsText, // keep raw formatted findings for UI
    });

  } catch (err) {
    console.error("❌ Error analyzing PR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Rule Engine Service running on port ${PORT}`);
});
