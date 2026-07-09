import express from "express";
import { chatCompletion } from "../lib/groq.js";
import { scoreProfile } from "../lib/scoring.js";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

router.post("/extract", async (req, res) => {
  try {
    const { situation, goal, lang } = req.body;

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

    const raw = await chatCompletion([{ role: "user", text: prompt }], undefined, 2, lang || "en");

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
    const { session_id, profile, goal, situation, lang } = req.body;

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

    const raw = await chatCompletion([{ role: "user", text: prompt }], undefined, 2, lang || "en");

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

    await supabase.from("messages").insert({
      session_id,
      sender: "admin",
      message_type: "analysis",
      message: JSON.stringify(analysis),
    });

    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

router.post("/refine-questions", async (req, res) => {
  try {
    const { situation, goal, profile, lang } = req.body;

    const prompt = `Situation: "${situation}". Goal: "${goal}". Profile so far: ${JSON.stringify(profile)}.

Generate exactly 2 short, targeted follow-up questions that would meaningfully improve an outfit recommendation for this specific person and situation. Each question needs 3-4 short multiple choice options.

Reply in exactly this format:
Q1: [question text]
O1: [option]|[option]|[option]
Q2: [question text]
O2: [option]|[option]|[option]`;

    const raw = await chatCompletion([{ role: "user", text: prompt }], undefined, 2, lang || "en");

    const q1 = raw.match(/Q1:\s*(.+)/)?.[1]?.trim() || "What's the dress code?";
    const o1 = raw.match(/O1:\s*(.+)/)?.[1]?.trim().split("|").map((s) => s.trim()) || ["Formal", "Business casual", "Casual"];
    const q2 = raw.match(/Q2:\s*(.+)/)?.[1]?.trim() || "Any colors you want to avoid?";
    const o2 = raw.match(/O2:\s*(.+)/)?.[1]?.trim().split("|").map((s) => s.trim()) || ["No preference", "Avoid bright colors", "Avoid dark colors"];

    res.json({
      questions: [
        { key: "detail1", q: q1, options: o1 },
        { key: "detail2", q: q2, options: o2 },
      ],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate refinement questions" });
  }
});

router.post("/quick-advice", async (req, res) => {
  try {
    const { situation, goal, lang } = req.body;

    const prompt = `Situation: "${situation}". Goal: "${goal}". They've chosen not to change their outfit.

Give 3 short, concrete, non-clothing actions that would still improve how they're perceived in this situation. No preamble, just the 3 items, each under 15 words.

Reply in exactly this format:
TIP1: [tip]
TIP2: [tip]
TIP3: [tip]`;

    const raw = await chatCompletion([{ role: "user", text: prompt }], undefined, 2, lang || "en");

    const tips = [
      raw.match(/TIP1:\s*(.+)/)?.[1]?.trim(),
      raw.match(/TIP2:\s*(.+)/)?.[1]?.trim(),
      raw.match(/TIP3:\s*(.+)/)?.[1]?.trim(),
    ].filter(Boolean);

    res.json({ tips: tips.length ? tips : ["Arrive early.", "Keep it simple.", "Make eye contact."] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate advice" });
  }
});

export default router;
