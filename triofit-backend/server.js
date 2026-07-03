import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import sessionRoutes from "./routes/session.js";
import messageRoutes from "./routes/messages.js";
import analysisRoutes from "./routes/analysis.js";
import templateRoutes from "./routes/templates.js";

dotenv.config();

const app = express();

// IMPORTANT: make CORS stable for Cloudflare + Railway
app.use(
  cors({
    origin: "*", // TEMP: stabilize first, restrict later
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// health check (Railway monitoring)
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// API routes
app.use("/api/session", sessionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/templates", templateRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Triofit backend running on port", PORT);
});
