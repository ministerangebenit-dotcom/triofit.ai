import express from "express";
import { supabase } from "../lib/supabase.js";
import { chatCompletion } from "../lib/groq.js";

const router = express.Router();

/**
 * Save message (user or admin)
 */
router.post("/messages", async (req, res) => {
  const { session_id, sender, message, message_type, image_url } = req.body;

  const { data, error } = await supabase
    .from("messages")
    .insert({
      session_id,
      sender,
      message,
      message_type: message_type || "text",
      image_url,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

/**
 * Get messages for session
 */
router.get("/messages/:sessionId", async (req, res) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", req.params.sessionId)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

/**
 * CHAT ENDPOINT (MAIN AI FLOW)
 * Frontend should call: /api/chat
 */
router.post("/chat", async (req, res) => {
  try {
    const { session_id, messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages must be an array" });
    }

    const reply = await chatCompletion(messages);

    await supabase.from("messages").insert({
      session_id,
      sender: "admin",
      message: reply,
      message_type: "text",
    });

    return res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ reply: "Error connecting to AI." });
  }
});

export default router;
