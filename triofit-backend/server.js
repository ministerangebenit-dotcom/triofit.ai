import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import sessionRoutes from "./routes/session.js";
import messageRoutes from "./routes/messages.js";
import analysisRoutes from "./routes/analysis.js";
import templateRoutes from "./routes/templates.js";
import chatRoutes from "./routes/chat.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        origin.endsWith(".pages.dev") ||
        origin === "http://localhost:5173" ||
        origin === "https://triofit-ai.pages.dev"
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

// routes
app.use("/api", sessionRoutes);
app.use("/api", messageRoutes);
app.use("/api", analysisRoutes);
app.use("/api", templateRoutes);

// ✅ NEW CLEAN CHAT ROUTE
app.use("/api/chat", chatRoutes);

// health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(process.env.PORT || 3001, () => {
  console.log("Triofit backend running on port", process.env.PORT || 3001);
});
