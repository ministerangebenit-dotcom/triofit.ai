import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";

import sessionRoutes from "./routes/session.js";
import messageRoutes from "./routes/messages.js";
import analysisRoutes from "./routes/analysis.js";
import templateRoutes from "./routes/templates.js";
import analyticsRoutes from "./routes/analytics.js";
import { supabase } from "./lib/supabase.js";   // adjust path if yours is different

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// ── CORS ──
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin.endsWith(".pages.dev") ||
        origin === "http://localhost:5173" ||
        origin === "http://localhost:3000" ||
        origin === "https://triofit-ai.pages.dev" ||
        origin.startsWith("file://")     // allows your local admin.html
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

// ── ROUTES ──
app.use("/api", sessionRoutes);
app.use("/api", messageRoutes);
app.use("/api", analysisRoutes);
app.use("/api", templateRoutes);
app.use("/api", analyticsRoutes);

// ── IMAGE UPLOAD (for chat via admin panel) ──
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file" });

    const path = `chat-images/${Date.now()}_${file.originalname}`;
    const { error: uploadError } = await supabase.storage
      .from("chat-images")
      .upload(path, file.buffer, { contentType: file.mimetype });

    if (uploadError) return res.status(500).json({ error: uploadError.message });

    const { data: urlData } = supabase.storage.from("chat-images").getPublicUrl(path);
    res.json({ url: urlData.publicUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.listen(process.env.PORT || 3001, () => {
  console.log("Triofit backend running on port", process.env.PORT || 3001);
});
