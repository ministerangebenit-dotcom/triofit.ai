import express from "express";
import { supabase } from "../lib/supabase.js";
import { chatCompletion } from "../lib/groq.js";

const router = express.Router();

router.post("/messages", async (req, res) => {
  const { session_id, sender, message, message_type, image_url } = req.body;
  const { data, error } = await supabase
    .from("messages")
    .insert({ session_id, sender, message, message_type: message_type || "text", image_url })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get("/messages/:sessionId", async (req, res) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", req.params.sessionId)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/chat", async (req, res) => {
  try {
    const { session_id, profile, messages } = req.body;

    const reply = await chatCompletion(messages);

    await supabase.from("messages").insert({
      session_id,
      sender: "admin",
      message: reply,
      message_type: "text",
    });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Error connecting to AI." });
  }
});

export default router;
