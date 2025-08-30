import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import { Server as SocketIOServer } from "socket.io";

import authRoutes from "./routes/auth.js";
import ticketRoutes from "./routes/tickets.js";
import kbRoutes from "./routes/knowledgeBase.js";
import aiActionRoutes from "./routes/aiActions.js";

import { authenticateJWT } from "./middleware/auth.js";
import { initSocketAIProcessing } from "./agents/aiProcessor.js";
import { SECRETS } from "./utils/consts.js";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"],
  },
});

const PORT = SECRETS.PORT;

console.log("Connecting to MongoDB...");
await mongoose
  .connect(SECRETS.MONGODB_URI, {})
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/health", (req, res) => {
  res.json({ message: "OK" });
});
app.use("/auth", authRoutes);
app.use("/tickets", authenticateJWT, ticketRoutes(io));
app.use("/knowledge-base", kbRoutes);
app.use("/ai-actions", authenticateJWT, aiActionRoutes);

initSocketAIProcessing(io);

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Server error" });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
