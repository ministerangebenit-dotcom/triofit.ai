import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import sessionRoutes from "./routes/session.js";
import messageRoutes from "./routes/messages.js";
import analysisRoutes from "./routes/analysis.js";
import templateRoutes from "./routes/templates.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://triofit-ai.pages.dev",
      "https://*.triofit-ai.pages.dev",
    ],
    credentials: true,
  })
);

app.use(express.json());

// ✅ CLEAN ROUTES
app.use("/api/chat", messageRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/templates", templateRoutes);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("Triofit backend running on port", PORT);
});
