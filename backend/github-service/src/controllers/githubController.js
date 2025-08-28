import { fetchUserRepos, fetchRepoPulls } from "../services/githubService.js";

export const getUserRepos = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: "No access token provided" });
    }

    const repos = await fetchUserRepos(token);
    res.json(repos);
  } catch (error) {
    console.error("Error fetching user repos:", error.message);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
};

export const getRepoPRs = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No access token provided" });
    }

    const { owner, repo } = req.params;
    const pulls = await fetchRepoPulls(token, owner, repo);
    res.json(pulls);
  } catch (error) {
    console.error("Error fetching pull requests:", error.message);
    res.status(500).json({ error: "Failed to fetch pull requests" });
  }
};
