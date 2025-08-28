import githubApiClient from "./githubApiClient.js";

/**
 * Fetch authenticated user's public repositories
 */
export const fetchUserRepos = async (token) => {
  const client = githubApiClient(token);
  const response = await client.get("/user/repos", { params: { visibility: "public" } });
  return response.data;
};

/**
 * Fetch all pull requests for a given repository (open, closed, merged)
 */
export const fetchAllRepoPRs = async (token, owner, repo) => {
  const client = githubApiClient(token);
  const response = await client.get(`/repos/${owner}/${repo}/pulls`, { params: { state: "all" } });

  return response.data.map(pr => ({
    ...pr,
    status: pr.merged_at ? "merged" : pr.state
  }));
};

/**
 * Fetch commits for a given PR
 */
export const fetchPRCommits = async (token, owner, repo, number) => {
  const client = githubApiClient(token);
  const response = await client.get(`/repos/${owner}/${repo}/pulls/${number}/commits`);
  return response.data;
};

/**
 * Fetch files for a given PR (with patch)
 */
export const fetchPRFiles = async (token, owner, repo, number) => {
  const client = githubApiClient(token);
  const response = await client.get(`/repos/${owner}/${repo}/pulls/${number}/files`);

  return response.data.map(f => ({
    filename: f.filename,
    status: f.status,
    additions: f.additions,
    deletions: f.deletions,
    changes: f.changes,
    patch: f.patch || "",
    sha: f.sha, // store sha for fetching full content
  }));
};

/**
 * Fetch full file content for a given file path and ref (PR head SHA)
 */
export const fetchFileContent = async (token, owner, repo, path, ref) => {
  const client = githubApiClient(token);
  try {
    const response = await client.get(`/repos/${owner}/${repo}/contents/${path}`, { params: { ref } });
    const content = Buffer.from(response.data.content, "base64").toString("utf-8");
    return content.split("\n"); // return array of lines
  } catch (err) {
    console.error(`Error fetching content for ${path}:`, err.response?.data || err.message);
    return [];
  }
};

/**
 * Fetch PR files with their full content
 */
export const fetchPRFilesWithContent = async (token, owner, repo, number, headSha) => {
  const files = await fetchPRFiles(token, owner, repo, number);
  
  const filesWithContent = await Promise.all(
    files.map(async (f) => {
      const fullContent = await fetchFileContent(token, owner, repo, f.filename, headSha);
      return { ...f, fullContent };
    })
  );

  return filesWithContent;
};

/**
 * Fetch pull request details along with all files including their full content
 */
export const fetchPRDetailsWithFiles = async (token, owner, repo, number) => {
  const client = githubApiClient(token);

  // Fetch PR details
  const prResponse = await client.get(`/repos/${owner}/${repo}/pulls/${number}`);
  const prData = prResponse.data;

  // Fetch files + full content using PR head SHA
  const filesWithContent = await fetchPRFilesWithContent(token, owner, repo, number, prData.head.sha);

  return {
    details: {
      number: prData.number,
      title: prData.title,
      state: prData.state,
      merged_at: prData.merged_at,
      user: prData.user,
      body: prData.body,
    },
    files: filesWithContent
  };
};


/**
 * Fetch authenticated user's profile
 */
export const fetchUserProfile = async (token) => {
  const client = githubApiClient(token);
  const response = await client.get("/user");
  return {
    login: response.data.login,
    name: response.data.name,
    avatar_url: response.data.avatar_url,
    bio: response.data.bio,
    public_repos: response.data.public_repos,
    followers: response.data.followers,
    following: response.data.following,
    html_url: response.data.html_url,
  };
};


