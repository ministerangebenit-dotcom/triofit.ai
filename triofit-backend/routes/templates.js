import express from "express";
import { supabase } from "../lib/supabase.js";
import { chatCompletion } from "../lib/groq.js";
import { scoreFromTemplate, finalScore } from "../lib/scoring.js";

const router = express.Router();

const AUTO_SEND_THRESHOLD = 70;

router.get("/templates", async (req, res) => {
  try {
    const { occasion, gender } = req.query;
    let query = supabase.from("outfit_templates").select("*");
    if (occasion) query = query.eq("occasion", occasion);
    if (gender) query = query.eq("gender", gender);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/templates", async (req, res) => {
  try {
    const {
      description, occasion, gender, style_tag, image_url,
      base_confidence, base_authority, base_trust, base_approachability, base_style_fit,
    } = req.body;

    const { data, error } = await supabase
      .from("outfit_templates")
      .insert({
        description, occasion, gender, style_tag, image_url,
        base_confidence, base_authority, base_trust, base_approachability, base_style_fit,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function deliverTemplate(session_id, template, wasOverride = false, aiSuggestedId = null, aiConfidence = null, profile = null, wasAutoSent = false) {
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

    if (!profile) return res.status(400).json({ error: "Missing profile" });

    const { data: templates, error } = await supabase
      .from("outfit_templates")
      .select("*")
      .eq("occasion", profile.occasion)
      .or(`gender.eq.${profile.gender},gender.is.null`);

    if (error) return res.status(500).json({ error: error.message });
    if (!templates || templates.length === 0) {
      return res.json({ suggestion: null, message: "No matching templates found — add one in the admin panel." });
    }

    const templateList = templates.map((t, i) => `${i}: ${t.description} (style: ${t.style_tag})`).join("\n");
    const prompt = `User style preference: "${profile.style}". Occasion: "${profile.occasion}".

Available outfit templates:
${templateList}

Reply in exactly this format:
INDEX: [number]
CONFIDENCE: [0-100, how well this matches]`;

    const raw = await chatCompletion([{ role: "user", text: prompt }]);
    const idx = parseInt(raw.match(/INDEX:\s*(\d+)/)?.[1] ?? "0", 10);
    const confidence = parseInt(raw.match(/CONFIDENCE:\s*(\d+)/)?.[1] ?? "70", 10);
    const chosen = templates[idx] || templates[0];

    if (confidence >= AUTO_SEND_THRESHOLD) {
      const result = await deliverTemplate(session_id, chosen, false, chosen.id, confidence, profile, true);
      return res.json({ suggestion: chosen, confidence, autoSent: true, ...result });
    }

    await supabase.from("admin_flags").upsert(
      {
        session_id,
        needs_image: true,
        suggested_template_id: chosen.id,
        suggestion_reason: `Matched to "${profile.style}" style for ${profile.occasion}`,
        ai_confidence: confidence,
        resolved: false,
        flagged_at: new Date().toISOString(),
      },
      { onConflict: "session_id" }
    );

    res.json({ suggestion: chosen, confidence, autoSent: false, allTemplates: templates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Suggestion failed" });
  }
});

router.post("/templates/send", async (req, res) => {
  try {
    const { session_id } = req.body;

    const { data: flag, error: fErr } = await supabase
      .from("admin_flags")
      .select("*")
      .eq("session_id", session_id)
      .single();

    if (fErr || !flag?.suggested_template_id) return res.status(404).json({ error: "No suggestion on file" });

    const { data: template, error: tErr } = await supabase
      .from("outfit_templates")
      .select("*")
      .eq("id", flag.suggested_template_id)
      .single();

    if (tErr) return res.status(404).json({ error: "Template not found" });

    const result = await deliverTemplate(session_id, template, false, template.id, flag.ai_confidence, null, false);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/templates/override", async (req, res) => {
  try {
    const { session_id, template_id } = req.body;

    const { data: flag } = await supabase
      .from("admin_flags")
      .select("*")
      .eq("session_id", session_id)
      .single();

    const { data: template, error: tErr } = await supabase
      .from("outfit_templates")
      .select("*")
      .eq("id", template_id)
      .single();

    if (tErr) return res.status(404).json({ error: "Template not found" });

    const result = await deliverTemplate(session_id, template, true, flag?.suggested_template_id, flag?.ai_confidence, null, false);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/admin/pending", async (req, res) => {
  const { data, error } = await supabase
    .from("admin_flags")
    .select("*, sessions(name, style, occasion, goal, gender), outfit_templates(description, image_url)")
    .eq("resolved", false)
    .eq("needs_image", true)
    .order("flagged_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get("/admin/corrections", async (req, res) => {
  const { data, error } = await supabase
    .from("template_corrections")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return res.status(500).json({ error: error.message });

  const total = data.length;
  const overrides = data.filter((c) => c.was_override).length;
  const autoSent = data.filter((c) => c.was_auto_sent).length;
  const accuracy = total > 0 ? Math.round(((total - overrides) / total) * 100) : null;

  res.json({ corrections: data, stats: { total, overrides, autoSent, accuracy } });
});

export default router;
