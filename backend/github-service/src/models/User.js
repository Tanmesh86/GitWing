// src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  githubId: {
    type: String,
    required: true,
    unique: true
  },
  login: {
    type: String,
    required: true
  },
  displayName: String,
  email: String,
  avatarUrl: String,
  accessToken: String, // encrypted token stored
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
