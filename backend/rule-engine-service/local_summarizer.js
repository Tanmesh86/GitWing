import { spawn } from "child_process";

export async function runLocalSummarizer(text) {
  return new Promise((resolve, reject) => {
    const py = spawn("python", ["summarizer.py"]);
    let output = "";
    let error = "";

    py.stdout.on("data", (data) => output += data.toString());
    py.stderr.on("data", (data) => error += data.toString());

    py.on("close", (code) => {
      if (code !== 0 || error) {
        return reject(new Error(error || "Python process failed"));
      }
      try {
        const parsed = JSON.parse(output);
        resolve(parsed.summary);
      } catch (err) {
        reject(err);
      }
    });

    py.stdin.write(JSON.stringify({ text }));
    py.stdin.end();
  });
}
