import express from "express";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

router.get("/analytics/overview", async (req, res) => {
  const { data: sessions, error: sErr } = await supabase.from("sessions").select("*");
  const { data: corrections, error: cErr } = await supabase.from("template_corrections").select("*");
  const { data: flags, error: fErr } = await supabase.from("admin_flags").select("*");

  if (sErr || cErr || fErr) return res.status(500).json({ error: "Failed to load analytics" });

  const totalSessions = sessions.length;

  const goalCounts = {};
  const occasionCounts = {};
  const genderCounts = {};
  const styleCounts = {};

  sessions.forEach((s) => {
    if (s.goal) goalCounts[s.goal] = (goalCounts[s.goal] || 0) + 1;
    if (s.occasion) occasionCounts[s.occasion] = (occasionCounts[s.occasion] || 0) + 1;
    if (s.gender) genderCounts[s.gender] = (genderCounts[s.gender] || 0) + 1;
    if (s.style) styleCounts[s.style] = (styleCounts[s.style] || 0) + 1;
  });

  const totalSent = corrections.length;
  const overrides = corrections.filter((c) => c.was_override).length;
  const aiAccuracy = totalSent > 0 ? Math.round(((totalSent - overrides) / totalSent) * 100) : null;

  const pendingNow = flags.filter((f) => !f.resolved).length;

  const funnel = {
    totalSessionsStarted: totalSessions,
    sessionsThatReachedAnalysis: sessions.filter((s) => s.stage === "analysis" || s.stage === "blueprint").length,
    outfitsSent: totalSent,
    currentlyPending: pendingNow,
  };

  res.json({
    funnel,
    aiAccuracy,
    goalCounts,
    occasionCounts,
    genderCounts,
    styleCounts,
    totalSessions,
  });
});

router.get("/analytics/sessions", async (req, res) => {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default router;
