import express from "express";
import { supabase } from "../lib/supabase.js";
import { chatCompletion } from "../lib/groq.js";

const router = express.Router();

// Save message
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

// Get messages
router.get("/messages/:sessionId", async (req, res) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", req.params.sessionId)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});


// CHAT (IMPROVED — no form logic, natural conversation + extraction optional)
router.post("/chat", async (req, res) => {
  try {
    const { session_id, messages } = req.body;

    const systemPrompt = {
      role: "system",
      content: `
You are Triofit AI.

You talk naturally like a stylist assistant.

You do NOT force forms or questionnaires.

You extract user info silently when possible:
- name
- goal (fitness, style, etc.)
- preferences
- body type hints
- clothing needs

When appropriate, respond conversationally AND embed structured JSON at the END like:

<DATA>{
  "name": "",
  "goal": "",
  "style": "",
  "budget": ""
}</DATA>

If nothing is clear, do NOT output JSON.

Be natural first. Extraction is secondary.
      `,
    };

    const fullMessages = [systemPrompt, ...messages];

    const reply = await chatCompletion(fullMessages);

    await supabase.from("messages").insert({
      session_id,
      sender: "ai",
      message: reply,
      message_type: "text",
    });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "AI error" });
  }
});

export default router;
