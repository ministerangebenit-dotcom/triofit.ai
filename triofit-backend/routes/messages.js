import express from "express";
import { supabase } from "../lib/supabase.js";
import { chatCompletion } from "../lib/groq.js";

const router = express.Router();

// Save message (safe version)
router.post("/", async (req, res) => {
  try {
    const { session_id, sender, message, message_type, image_url } = req.body;

    const { data, error } = await supabase
      .from("messages")
      .insert({
        session_id,
        sender,
        message,
        message_type: message_type || "text",
        image_url: image_url || null,
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Message insert error:", err);
    res.status(500).json({ error: "Failed to save message" });
  }
});

// Get messages
router.get("/:sessionId", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", req.params.sessionId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// CHAT (FIXED + SAFE)
router.post("/chat", async (req, res) => {
  try {
    const { session_id, messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    let reply;

    try {
      reply = await chatCompletion(messages);
    } catch (aiErr) {
      console.error("Groq error:", aiErr);
      reply = "I'm having trouble thinking right now. Try again in a moment.";
    }

    await supabase.from("messages").insert({
      session_id,
      sender: "admin",
      message: reply,
      message_type: "text",
    });

    res.json({ reply });
  } catch (err) {
    console.error("Chat route error:", err);
    res.status(500).json({ reply: "Server error." });
  }
});

export default router;
