// backend/services/github/githubApiClient.js
import axios from "axios";

export default function githubApiClient(accessToken) {
  return axios.create({
    baseURL: "https://api.github.com",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json"
    }
  });
}
