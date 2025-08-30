import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
const client = new MongoClient(process.env.MONGO_URI);

async function connectDB() {
  try {
    await client.connect();
    db = client.db(process.env.DB_NAME || "portfolio");
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}
connectDB();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER, // must be a verified sender
    pass: process.env.SMTP_PASS, // app password or token
  },
});

// Send feedback email
async function sendFeedbackEmail({ name, email, message }) {
  const mailOptions = {
    from: process.env.SMTP_USER, // verified sender
    to: process.env.RECEIVER_EMAIL, // your inbox
    subject: `New Feedback from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong><br/>${message}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log("Feedback email sent!");
}

// POST /api/feedback
app.post("/api/feedback", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ error: "All fields are required" });

    const feedbackCollection = db.collection("feedbacks");
    const newFeedback = { name, email, message, createdAt: new Date() };
    const result = await feedbackCollection.insertOne(newFeedback);

    // Send email (async)
    sendFeedbackEmail(newFeedback).catch(console.error);

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedbackId: result.insertedId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "Feedback Service running ✅" });
});


// GET /api/feedbacks
app.get("/api/feedbacks", async (req, res) => {
  try {
    const feedbackCollection = db.collection("feedbacks");
    const feedbacks = await feedbackCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch feedbacks" });
  }
});

app.listen(PORT, () => {
  console.log(`Feedback service running on port ${PORT}`);
});
