import express from "express";
import { chatCompletion } from "../lib/groq.js";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

// POST /api/chat
router.post("/", async (req, res) => {
  try {
    const { session_id, message, profile, goal } = req.body;

    const messages = [
      {
        role: "system",
        content: `You are a styling assistant. Goal: ${goal}`,
      },
      {
        role: "user",
        content: message,
      },
    ];

    const reply = await chatCompletion(messages);

    await supabase.from("messages").insert({
      session_id,
      sender: "admin",
      message: reply,
      message_type: "text",
    });

    res.json({
      reply,
      profile: {
        ...profile,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "AI error" });
  }
});

export default router;
