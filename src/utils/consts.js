import dotenv from "dotenv";
dotenv.config();

export const SECRETS = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT || 5000,
};

if (!SECRETS.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined");
}
if (!SECRETS.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}
if (!SECRETS.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}
