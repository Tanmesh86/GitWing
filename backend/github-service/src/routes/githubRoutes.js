import express from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import {
  fetchUserRepos,
  fetchAllRepoPRs,
  fetchPRDetailsWithFiles
} from "../services/githubService.js";

const router = express.Router();

// ------------------ AUTH MIDDLEWARE ------------------
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const jwtToken = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    if (!decoded.githubAccessToken) {
      return res.status(401).json({ error: "GitHub access token missing in JWT" });
    }
    req.githubToken = decoded.githubAccessToken;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid JWT token" });
  }
}

// ------------------ GET USER PROFILE ------------------
router.get("/profile", authenticate, async (req, res) => {
  try {
    const response = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${req.githubToken}` }
    });

    const profile = {
      login: response.data.login,
      name: response.data.name,
      avatar_url: response.data.avatar_url,
      bio: response.data.bio,
      followers: response.data.followers,
      following: response.data.following,
      public_repos: response.data.public_repos,
      html_url: response.data.html_url,
      company: response.data.company,
      location: response.data.location
    };

    return res.json(profile);
  } catch (err) {
    console.error("Error fetching profile:", err.message || err);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ------------------ GET USER REPOS ------------------
router.get("/repos", authenticate, async (req, res) => {
  try {
    const repos = await fetchUserRepos(req.githubToken);
    return res.json(repos);
  } catch (err) {
    console.error("Error fetching repos:", err.message || err);
    return res.status(500).json({ error: "Failed to fetch repos" });
  }
});

// ------------------ GET ALL PRs FOR A REPO ------------------
router.get("/repos/:owner/:repo/pulls", authenticate, async (req, res) => {
  const { owner, repo } = req.params;
  try {
    let prs = await fetchAllRepoPRs(req.githubToken, owner, repo);
    prs = prs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return res.json(prs);
  } catch (err) {
    console.error("Error fetching PRs:", err.message || err);
    return res.status(500).json({ error: "Failed to fetch pull requests" });
  }
});

// ------------------ GET DETAILED PR DATA ------------------
router.get("/repos/:owner/:repo/pulls/:number/details", authenticate, async (req, res) => {
  const { owner, repo, number } = req.params;

  if (!number) {
    return res.status(400).json({ error: "Pull request number is required" });
  }

  try {
    const prData = await fetchPRDetailsWithFiles(req.githubToken, owner, repo, number);
    return res.json(prData);
  } catch (err) {
    console.error("Error fetching PR details:", err.message || err);
    return res.status(500).json({ error: "Failed to fetch PR details" });
  }
});

// ------------------ ANALYZE PR (Rule Engine Integration) ------------------
router.get("/repos/:owner/:repo/pulls/:number/analyze", authenticate, async (req, res) => {
  const { owner, repo, number } = req.params;

  if (!number) {
    return res.status(400).json({ error: "Pull request number is required" });
  }

  try {
    // 1. Get full PR data (including files + patches + content)
    const prData = await fetchPRDetailsWithFiles(req.githubToken, owner, repo, number);

    // 2. Send it to Rule Engine Service
    const analysisResponse = await axios.post(
      "https://rule-engine-v2ay.onrender.com/analyze",
      prData
    );

    // 3. Return the FULL rule engine response
    return res.json({
      prId: number,
      repo: `${owner}/${repo}`,
      details: prData.details,
      files: prData.files,               // send back the files too (for debugging)
      analysis: analysisResponse.data    // don’t trim, keep full response
    });
  } catch (err) {
    console.error("Error analyzing PR:", err.response?.data || err.message || err);
    return res.status(500).json({ error: "Failed to analyze PR" });
  }
});




export default router;

