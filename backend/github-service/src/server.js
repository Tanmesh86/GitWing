import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import githubRoutes from "./routes/githubRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/github", githubRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ GitHub Service running on port ${PORT}`);
});
