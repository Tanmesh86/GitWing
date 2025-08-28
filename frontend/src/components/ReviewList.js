import React from "react";

function ReviewList({ reviews }) {
  if (!reviews.length) {
    return <p>No reviews yet.</p>;
  }

  return (
    <ul>
      {reviews.map((r) => (
        <li key={r.number} style={{ marginBottom: "15px" }}>
          <strong>PR #{r.number}: {r.title}</strong><br />
          <small>
            By: {r.user} | State: {r.state} | Action: {r.action}
          </small><br />
          <small>
            Branches: <strong>{r.head_branch}</strong> → <strong>{r.base_branch}</strong>
          </small><br />
          <small>
            Additions: {r.additions} | Deletions: {r.deletions} | Changed files: {r.changed_files}
          </small><br />
          <small>
            Created at: {new Date(r.created_at).toLocaleString()}
          </small><br />
          <small>
            Updated at: {new Date(r.updated_at).toLocaleString()}
          </small>
        </li>
      ))}
    </ul>
  );
}

export default ReviewList;
