import express from "express";
import { chatCompletion } from "../lib/groq.js";
import { getPersonaPrompt } from "../lib/personas.js";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      session_id,
      messages,
      goal,
      profile,
      analysis,
      lang,
    } = req.body;

    const personaPrompt = getPersonaPrompt(goal);

    const context = `
You are continuing an existing TRIOFIT coaching session.

The user has ALREADY completed their perception analysis.

USER GOAL:
${goal || "unknown"}

PROFILE:
${JSON.stringify(profile || {})}

PERCEPTION ANALYSIS:
${JSON.stringify(analysis || {})}

Conversation rules:

- Continue naturally from the analysis.
- Never restart the consultation.
- Never ask for information already known.
- If clothing is NOT the user's biggest obstacle, say so honestly.
- If behaviour matters more than clothing, coach behaviour.
- If communication matters more, coach communication.
- If confidence matters more, coach confidence.
- If clothing remains the limiting factor, explain WHY before recommending clothes.
- Be practical.
- Challenge bad assumptions.
- Never flatter.
- Never invent facts.
- Speak like a world-class consultant whose reputation depends on accuracy.
`;

    const reply = await chatCompletion(
      messages,
      personaPrompt + "\n\n" + context,
      2,
      lang || "en"
    );

    await supabase.from("messages").insert({
      session_id,
      sender: "admin",
      message: reply,
      message_type: "text",
    });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      reply: "AI error",
    });
  }
});

export default router;
