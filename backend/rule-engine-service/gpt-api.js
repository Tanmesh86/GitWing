// gpt-api.js
import fetch from "node-fetch"; // Node 18+ has global fetch, remove this if using Node 18+
import dotenv from "dotenv";
dotenv.config();

const HF_API_TOKEN = process.env.HF_API_TOKEN; // Add your Hugging Face token to .env
const MODEL_URL = "https://api-inference.huggingface.co/models/your-username/phi3"; // Replace with your deployed Phi-3 model

export async function runCloudSummarizer(prompt) {
  try {
    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Hugging Face API error: ${errText}`);
    }

    const data = await response.json();

    // The generated text might be in different fields depending on model
    // Most often: data[0].generated_text
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text.trim();
    }

    // Fallback: return raw JSON string
    return JSON.stringify(data);
  } catch (err) {
    console.error("❌ Cloud summarizer error:", err.message);
    throw err;
  }
}
