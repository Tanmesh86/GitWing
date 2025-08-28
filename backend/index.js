require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
}));

// Middleware to handle both JSON and form-urlencoded (GitHub may send either)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Mongo
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Updated Schema
const prSchema = new mongoose.Schema({
  action: String,
  number: Number,
  title: String,
  user: String,
  created_at: Date,
  updated_at: Date,
  state: String,
  base_branch: String,
  head_branch: String,
  additions: Number,
  deletions: Number,
  changed_files: Number
});

const PullRequest = mongoose.model("PullRequest", prSchema);

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  const event = req.headers["x-github-event"];
  console.log(`Received GitHub event: ${event}`);

  // Parse payload if GitHub sends as form-urlencoded
  let body = req.body;
  if (typeof req.body.payload === "string") {
    try {
      body = JSON.parse(req.body.payload);
    } catch (err) {
      console.error("❌ Failed to parse payload:", err);
      return res.status(400).send("Invalid payload format");
    }
  }

  console.log("Parsed body:", JSON.stringify(body, null, 2));

  try {
    if (event === "pull_request" && body.pull_request) {
      const pr = body.pull_request;

      const prData = {
        action: body.action || '',
        number: pr.number || 0,
        title: pr.title || '',
        user: pr.user?.login || '',
        created_at: pr.created_at ? new Date(pr.created_at) : null,
        updated_at: pr.updated_at ? new Date(pr.updated_at) : null,
        state: pr.state || '',
        base_branch: pr.base?.ref || '',
        head_branch: pr.head?.ref || '',
        additions: pr.additions || 0,
        deletions: pr.deletions || 0,
        changed_files: pr.changed_files || 0
      };

      await PullRequest.findOneAndUpdate(
        { number: prData.number },
        prData,
        { upsert: true, new: true }
      );
      console.log("💾 PR Data Saved:", prData);

    } else if (event === "push") {
      const commits = body.commits || [];
      console.log(`Push event with ${commits.length} commits`);
      commits.forEach(c => console.log(`Commit ${c.id}: ${c.message}`));

    } else {
      console.log("⚠️ Received unsupported event or missing data");
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error processing webhook:", err);
    res.status(500).send("Internal Server Error");
  }
});

// API to fetch stored PR reviews
app.get("/reviews", async (req, res) => {
  try {
    const prs = await PullRequest.find().sort({ updated_at: -1 });
    res.json(prs);
  } catch (err) {
    console.error("❌ Error fetching PRs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
