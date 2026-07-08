import express from "express";
import { chatCompletion } from "../lib/groq.js";
import { scoreProfile } from "../lib/scoring.js";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

router.post("/extract", async (req, res) => {
  try {
    const { situation, goal } = req.body;

    const prompt = `A person is using a perception-coaching app. Their goal: "${goal}". They described their situation in their own words:

"${situation}"

Extract the following as best you can infer. If gender genuinely cannot be inferred from what they wrote, write "unclear" for gender only — but you MUST pick the closest matching OCCASION from the fixed list below, never invent your own phrase.

OCCASION must be exactly one of these five, verbatim:
- A professional interview
- An evening out
- A wedding
- Everyday office wear
- A casual event

GENDER: [Male/Female/unclear]
AGE_RANGE: [18-24/25-34/35-44/45+/unclear]
STYLE: [one short phrase describing their natural style, e.g. "Classic & elegant"]
OCCASION: [must exactly match one of the five options above]
SUMMARY: [one sentence restating their situation back to them, in second person]`;

    const raw = await chatCompletion([{ role: "user", text: prompt }]);

    const extract = (label) => {
      const match = raw.match(new RegExp(`${label}:\\s*(.+)`));
      return match ? match[1].trim() : "unclear";
    };

    res.json({
      gender: extract("GENDER"),
      age: extract("AGE_RANGE"),
      style: extract("STYLE"),
      occasion: extract("OCCASION"),
      summary: extract("SUMMARY"),
      situation,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Extraction failed" });
  }
});

router.post("/analysis", async (req, res) => {
  try {
    const { session_id, profile, goal, situation } = req.body;

    const prompt = `Person's situation, in their own words: "${situation}"
Their goal: "${goal}"
Inferred profile: ${JSON.stringify(profile)}.

Write a perception analysis in this exact format, no extra text. Address the person directly as "you" throughout — never refer to them as "the user" or in third person.

IMPRESSION: [2 sentences on how you come across, based strictly on what you said, addressed directly to the person as "you"]
REASON1: [one specific thing from your own words that supports this, addressed as "you"]
REASON2: [another specific thing from your own words, addressed as "you"]
STRONG1: [one word trait]
STRONG2: [one word trait]
CAUTION1: [one short cautionary trait]
PREDICTION: [1-2 sentences estimating the likelihood your goal is achieved with your current approach, addressed as "you", framed as an estimate not certainty]`;

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
