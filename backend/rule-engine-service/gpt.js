// gpt.js
import { spawn } from "child_process";

export function runLocalSummarizer(prompt) {
  return new Promise((resolve, reject) => {
const py = spawn("python", ["./summarizer.py"]);

    let output = "";
    let error = "";

    py.stdout.on("data", (data) => {
      output += data.toString();
    });

    py.stderr.on("data", (data) => {
      error += data.toString();
    });

    py.on("close", (code) => {
      if (code !== 0 || error) return reject(new Error(error || `Python exited with code ${code}`));
      resolve(output.trim()); // return raw AI text
    });

    // Send input prompt to Python
    py.stdin.write(JSON.stringify({ text: prompt }));
    py.stdin.end();
  });
}
