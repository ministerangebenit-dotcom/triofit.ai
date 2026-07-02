import express from "express";
import { chatCompletion } from "../lib/groq.js";
import { scoreProfile } from "../lib/scoring.js";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

router.post("/analysis", async (req, res) => {
  try {
    const { session_id, profile, goal } = req.body;

    const prompt = `Profile: ${JSON.stringify(profile)}. Goal: ${goal}.

Write a short perception analysis in this exact format, no extra text:
IMPRESSION: [2 sentences on how this person likely comes across, based on their answers]
REASON1: [one specific thing from their profile that supports this]
REASON2: [another specific thing from their profile]
STRONG1: [one word trait]
STRONG2: [one word trait]
CAUTION1: [one short cautionary trait]
PREDICTION: [1-2 sentences estimating how well their current instinct will land for their stated goal, framed as an estimate not certainty]`;

    const raw = await chatCompletion([{ role: "user", text: prompt }]);

    const extract = (label) => {
      const match = raw.match(new RegExp(`${label}:\\s*(.+)`));
      return match ? match[1].trim() : "";
    };

    const analysis = {
      impression: extract("IMPRESSION"),
      reasons: [extract("REASON1"), extract("REASON2")].filter(Boolean),
      traits: {
        strong: [extract("STRONG1"), extract("STRONG2")].filter(Boolean),
        caution: [extract("CAUTION1")].filter(Boolean),
      },
      prediction: extract("PREDICTION"),
      blueprint: scoreProfile(profile),
    };

    await supabase.from("sessions").update({ stage: "analysis" }).eq("session_id", session_id);

    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

export default router;
