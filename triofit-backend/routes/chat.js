import express from "express";
import { chatCompletion } from "../lib/groq.js";
import { getPersonaPrompt } from "../lib/personas.js";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      session_id,
      messages = [],
      goal,
      lang = "en",
    } = req.body;

    // Load session
    const { data: session } = await supabase
      .from("sessions")
      .select("goal, situation, profile")
      .eq("session_id", session_id)
      .single();

    // Load previous perception analysis
    const { data: analysisRow } = await supabase
      .from("messages")
      .select("message")
      .eq("session_id", session_id)
      .eq("message_type", "analysis")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let previousAnalysis = "";

    if (analysisRow?.message) {
      try {
        const parsed = JSON.parse(analysisRow.message);

        previousAnalysis = `
Previous perception analysis:

Impression:
${parsed.impression}

Reasons:
${(parsed.reasons || []).join("\n")}

Strengths:
${parsed.traits?.strong?.join(", ") || ""}

Caution:
${parsed.traits?.caution?.join(", ") || ""}

Prediction:
${parsed.prediction}
`;
      } catch {}
    }

    const personaPrompt = getPersonaPrompt(goal || session?.goal);

    const context = `
You are continuing an existing coaching conversation.

Never restart.

Never introduce yourself.

Never repeat the perception analysis unless asked.

Everything below is already known.

USER GOAL:
${goal || session?.goal || "Unknown"}

USER SITUATION:
${session?.situation || "Unknown"}

USER PROFILE:
${JSON.stringify(session?.profile || {}, null, 2)}

${previousAnalysis}

Conversation rules:

- Continue naturally from the previous analysis.
- Assume the user has already read the perception report.
- If they ask "why?" explain your reasoning.
- If they ask for advice, adapt it to this specific person.
- Clothing is only one variable.
- If behaviour, confidence, communication, etiquette or preparation matter more, say so.
- When recommending clothing, explain WHY it changes perception.
- Never ask for information you already know.
- Avoid generic advice.
- Speak with confidence but never certainty.
`;

    const reply = await chatCompletion(
      [
        {
          role: "user",
          text: context,
        },
        ...messages,
      ],
      personaPrompt,
      2,
      lang
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
      reply: "Sorry, something went wrong. Please try again.",
    });
  }
});

export default router;
