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
  const hourCounts = {};

  sessions.forEach((s) => {
    if (s.goal) goalCounts[s.goal] = (goalCounts[s.goal] || 0) + 1;
    if (s.occasion) occasionCounts[s.occasion] = (occasionCounts[s.occasion] || 0) + 1;
    if (s.gender) genderCounts[s.gender] = (genderCounts[s.gender] || 0) + 1;
    if (s.style) styleCounts[s.style] = (styleCounts[s.style] || 0) + 1;

    if (s.created_at) {
      const hour = new Date(s.created_at).getHours();
      const label = `${hour}:00-${hour + 1}:00`;
      hourCounts[label] = (hourCounts[label] || 0) + 1;
    }
  });

  const totalSent = corrections.length;
  const overrides = corrections.filter((c) => c.was_override).length;
  const autoSent = corrections.filter((c) => c.was_auto_sent).length;
  const aiAccuracy = totalSent > 0 ? Math.round(((totalSent - overrides) / totalSent) * 100) : null;

  const pendingNow = flags.filter((f) => !f.resolved).length;

  const durations = sessions
    .filter((s) => s.created_at && s.updated_at)
    .map((s) => (new Date(s.updated_at) - new Date(s.created_at)) / 1000);
  const avgDurationSeconds = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;

  const funnel = {
    totalSessionsStarted: totalSessions,
    sessionsThatReachedAnalysis: sessions.filter((s) => s.stage === "analysis" || s.stage === "blueprint").length,
    outfitsSent: totalSent,
    currentlyPending: pendingNow,
  };

  res.json({
    funnel,
    aiAccuracy,
    autoSentCount: autoSent,
    goalCounts,
    occasionCounts,
    genderCounts,
    styleCounts,
    hourCounts,
    avgDurationSeconds,
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

router.get("/analytics/session/:sessionId/conversation", async (req, res) => {
  const { data: session, error: sErr } = await supabase
    .from("sessions")
    .select("*")
    .eq("session_id", req.params.sessionId)
    .single();

  const { data: messages, error: mErr } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", req.params.sessionId)
    .order("created_at", { ascending: true });

  if (sErr || mErr) return res.status(500).json({ error: "Failed to load conversation" });

  res.json({ session, messages: messages || [] });
});

export default router;
