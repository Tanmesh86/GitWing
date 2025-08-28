// src/utils/cryptoUtil.js
import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = crypto.scryptSync(process.env.CRYPTO_SECRET || "default_secret_key", "salt", 32);
const iv = Buffer.alloc(16, 0); // Initialization vector (should be random for production)

export function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
