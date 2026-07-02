import express from "express";
import { supabase } from "../lib/supabase.js";
import { chatCompletion } from "../lib/groq.js";
import { scoreFromTemplate, finalScore } from "../lib/scoring.js";

const router = express.Router();

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
      return res.json({ suggestion: null, message: "No matching templates found — add one in the admin panel." });
    }

    const templateList = templates.map((t, i) => `${i}: ${t.description} (style: ${t.style_tag})`).join("\n");
    const prompt = `User style preference: "${profile.style}". Occasion: "${profile.occasion}".

Available outfit templates:
${templateList}

Reply with ONLY the number of the best matching template, nothing else.`;

    const raw = await chatCompletion([{ role: "user", text: prompt }]);
    const idx = parseInt(raw.match(/\d+/)?.[0] ?? "0", 10);
    const chosen = templates[idx] || templates[0];

    await supabase.from("admin_flags").upsert(
      {
        session_id,
        needs_image: true,
        suggested_template_id: chosen.id,
        suggestion_reason: `Matched to "${profile.style}" style for ${profile.occasion}`,
        resolved: false,
        flagged_at: new Date().toISOString(),
      },
      { onConflict: "session_id" }
    );

    res.json({ suggestion: chosen });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Suggestion failed" });
  }
});

router.post("/templates/send", async (req, res) => {
  const { session_id, template_id } = req.body;

  const { data: template, error: tErr } = await supabase
    .from("outfit_templates")
    .select("*")
    .eq("id", template_id)
    .single();

  if (tErr) return res.status(404).json({ error: "Template not found" });

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

  if (mErr) return res.status(500).json({ error: mErr.message });

  const traits = scoreFromTemplate(template);
  const score = finalScore(traits);

  await supabase.from("admin_flags").update({ resolved: true }).eq("session_id", session_id);

  res.json({ message: msg, blueprint: traits, finalScore: score });
});

router.get("/admin/pending", async (req, res) => {
  const { data, error } = await supabase
    .from("admin_flags")
    .select("*, sessions(name, style, occasion, goal), outfit_templates(description, image_url)")
    .eq("resolved", false)
    .eq("needs_image", true)
    .order("flagged_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
