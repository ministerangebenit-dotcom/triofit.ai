import express from "express";
import { supabase } from "../lib/supabase.js";
import { chatCompletion } from "../lib/groq.js";
import { getPersonaPrompt } from "../lib/personas.js";

const router = express.Router();

const FREE_CHAT_LIMIT = 20;
const PRO_CHAT_LIMIT = 150;

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

router.get("/history/:sessionId", async (req, res) => {
  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("session_id", req.params.sessionId)
    .single();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", req.params.sessionId)
    .order("created_at", { ascending: true });

  res.json({ session: session || null, messages: messages || [] });
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
    const { session_id, profile, messages, lang, goal } = req.body;

    // Save the last user message to the database BEFORE calling Groq
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      await supabase.from("messages").insert({
        session_id,
        sender: "user",
        message: lastUserMessage.text,
        message_type: "text",
      });
    }

    // Get session for rate limiting
    const { data: session } = await supabase
      .from("sessions")
      .select("is_pro, chat_message_count, chat_message_date, goal")
      .eq("session_id", session_id)
      .single();

    const today = new Date().toISOString().slice(0, 10);
    const isToday = session?.chat_message_date === today;
    const currentCount = isToday ? (session?.chat_message_count || 0) : 0;
    const limit = session?.is_pro ? PRO_CHAT_LIMIT : FREE_CHAT_LIMIT;

    if (currentCount >= limit) {
      return res.status(429).json({ limitReached: true, limit });
    }

    const effectiveGoal = goal || session?.goal || "authority";
    const reply = await chatCompletion(messages, getPersonaPrompt(effectiveGoal), 2, lang || "en");

    // Save the AI reply
    await supabase.from("messages").insert({
      session_id,
      sender: "admin",
      message: reply,
      message_type: "text",
    });

    // Update rate limit counter
    const newCount = isToday ? currentCount + 1 : 1;
    await supabase
      .from("sessions")
      .update({ chat_message_count: newCount, chat_message_date: today })
      .eq("session_id", session_id);

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Error connecting to AI." });
  }
});

export default router;
