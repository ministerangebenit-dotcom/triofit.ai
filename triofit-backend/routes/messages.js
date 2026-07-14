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

router.get("/messages/:sessionId", async (req, res) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", req.params.sessionId)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

async function getLastOutfitContext(session_id) {
  const { data: lastImageMsg } = await supabase
    .from("messages")
    .select("message, image_url, created_at")
    .eq("session_id", session_id)
    .eq("message_type", "image")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lastImageMsg) return "";

  const { data: correction } = await supabase
    .from("template_corrections")
    .select("human_chosen_id")
    .eq("session_id", session_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let scores = null;
  if (correction?.human_chosen_id) {
    const { data: template } = await supabase
      .from("outfit_templates")
      .select("base_confidence, base_authority, base_trust, base_approachability, base_style_fit, style_tag, occasion")
      .eq("id", correction.human_chosen_id)
      .maybeSingle();
    scores = template;
  }

  return `
The stylist already recommended this specific outfit to the user:
Description: ${lastImageMsg.message}
${scores ? `Style: ${scores.style_tag}, for: ${scores.occasion}` : ""}

If the user asks to change, adjust, or improve this recommendation ("make it more affordable", "I don't like the color", "something warmer"), modify THIS specific outfit — do not invent a completely unrelated new one unless they clearly ask for a different direction entirely.`;
}

router.post("/chat", async (req, res) => {
  try {
    const { session_id, profile, messages, lang, goal } = req.body;

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
    const outfitContext = await getLastOutfitContext(session_id);
    const systemPrompt = getPersonaPrompt(effectiveGoal) + (outfitContext ? "\n\n" + outfitContext : "");

    const reply = await chatCompletion(messages, systemPrompt, 2, lang || "en");

    await supabase.from("messages").insert({
      session_id,
      sender: "admin",
      message: reply,
      message_type: "text",
    });

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
