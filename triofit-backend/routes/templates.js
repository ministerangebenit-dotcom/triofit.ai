import express from "express";
import { supabase } from "../lib/supabase.js";
import { chatCompletion } from "../lib/groq.js";
import { scoreFromTemplate, finalScore } from "../lib/scoring.js";

const router = express.Router();

const AUTO_SEND_THRESHOLD = 70;

router.get("/templates", async (req, res) => {
  const { occasion, gender } = req.query;
  let query = supabase.from("outfit_templates").select("*");
  if (occasion) query = query.eq("occasion", occasion);
  if (gender) query = query.eq("gender", gender);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/templates", async (req, res) => {
  const { description, occasion, gender, style_tag, image_url, base_confidence, base_authority, base_trust, base_approachability, base_style_fit } = req.body;
  const { data, error } = await supabase
    .from("outfit_templates")
    .insert({ description, occasion, gender, style_tag, image_url, base_confidence, base_authority, base_trust, base_approachability, base_style_fit })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

async function deliverTemplate(session_id, template, wasOverride, aiSuggestedId, aiConfidence, profile, wasAutoSent = false) {
  const { data: msg, error: mErr } = await supabase
    .from("messages")
    .insert({
      session_id,
      sender: "admin",
      message: template.description,
      message_type: "image",
      image_url: template.image_url,
    })
    .select()
    .single();

  if (mErr) throw new Error(mErr.message);

  await supabase.from("template_corrections").insert({
    session_id,
    profile_snapshot: profile || null,
    ai_suggested_id: aiSuggestedId || template.id,
    ai_confidence: aiConfidence || null,
    human_chosen_id: template.id,
    was_override: wasOverride,
    was_auto_sent: wasAutoSent,
  });

  await supabase.from("admin_flags").update({ resolved: true }).eq("session_id", session_id);

  const traits = scoreFromTemplate(template);
  const score = finalScore(traits);

  const channel = supabase.channel("score-" + session_id);
  await channel.subscribe();
  await channel.send({
    type: "broadcast",
    event: "outfit_score",
    payload: { blueprint: traits, finalScore: score, outfitText: template.description, imageUrl: template.image_url },
  });
  await supabase.removeChannel(channel);

  return { message: msg, blueprint: traits, finalScore: score };
}

router.post("/templates/suggest", async (req, res) => {
  try {
    const { session_id, profile } = req.body;

    const { data: templates, error } = await supabase
      .from("outfit_templates")
      .select("*")
      .eq("occasion", profile.occasion)
      .or(`gender.eq.${profile.gender},gender.is.null`);

    if (error) return res.status(500).json({ error: error.message });
    if (!templates || templates.length === 0) {
      return res.json({ suggestion: null, message: "No matching templates found — add one
