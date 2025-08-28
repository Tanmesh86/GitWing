import React from "react";

const CommitList = ({ commits }) => {
  return (
    <div>
      {commits.length === 0 ? (
        <p>No commits found</p>
      ) : (
        <ul>
          {commits.map((commit) => (
            <li key={commit.commitId}>
              <a href={commit.url} target="_blank" rel="noopener noreferrer">
                {commit.message}
              </a> — {commit.author} ({new Date(commit.timestamp).toLocaleString()})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommitList;
