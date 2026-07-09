import express from "express";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

// Helper: returns an ISO date string for the start of the period, or null for "all"
function getSinceDate(range) {
  const now = new Date();
  if (range === "24h") return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  if (range === "7d")  return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  if (range === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  return null; // all time
}

router.get("/analytics/overview", async (req, res) => {
  try {
    const range = req.query.range || "all";
    const since = getSinceDate(range);

    // 1. Fetch sessions (filtered by date if needed)
    let sessionQuery = supabase.from("sessions").select("*");
    if (since) sessionQuery = sessionQuery.gte("created_at", since);
    const { data: sessions, error: sErr } = await sessionQuery;
    if (sErr) return res.status(500).json({ error: sErr.message });

    // 2. Collect the session IDs for filtering other tables
    const sessionIds = sessions.map((s) => s.session_id);

    // 3. Fetch corrections for these sessions
    let corrQuery = supabase.from("template_corrections").select("*");
    if (sessionIds.length) corrQuery = corrQuery.in("session_id", sessionIds);
    else corrQuery = corrQuery.filter("session_id", "is", null); // no sessions → empty result
    const { data: corrections, error: cErr } = await corrQuery;
    if (cErr) return res.status(500).json({ error: cErr.message });

    // 4. Fetch admin flags for these sessions
    let flagQuery = supabase.from("admin_flags").select("*");
    if (sessionIds.length) flagQuery = flagQuery.in("session_id", sessionIds);
    else flagQuery = flagQuery.filter("session_id", "is", null);
    const { data: flags, error: fErr } = await flagQuery;
    if (fErr) return res.status(500).json({ error: fErr.message });

    // 5. Fetch messages for these sessions (for duration / single‑message stats)
    let msgQuery = supabase.from("messages").select("session_id, created_at");
    if (sessionIds.length) msgQuery = msgQuery.in("session_id", sessionIds);
    else msgQuery = msgQuery.filter("session_id", "is", null);
    const { data: allMessages, error: mErr } = await msgQuery;
    if (mErr) return res.status(500).json({ error: mErr.message });

    // 6. Compute counts
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

    const messagesBySession = {};
    allMessages.forEach((m) => {
      if (!messagesBySession[m.session_id]) messagesBySession[m.session_id] = [];
      messagesBySession[m.session_id].push(new Date(m.created_at).getTime());
    });

    const durations = Object.values(messagesBySession)
      .filter((timestamps) => timestamps.length >= 2)
      .map((timestamps) => {
        const sorted = timestamps.sort((a, b) => a - b);
        return (sorted[sorted.length - 1] - sorted[0]) / 1000;
      });

    const avgDurationSeconds = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

    const sessionsWithOnlyOneMessage = Object.values(messagesBySession).filter((t) => t.length === 1).length;

    const totalSent = corrections.length;
    const overrides = corrections.filter((c) => c.was_override).length;
    const autoSent = corrections.filter((c) => c.was_auto_sent).length;
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
      autoSentCount: autoSent,
      goalCounts,
      occasionCounts,
      genderCounts,
      styleCounts,
      hourCounts,
      avgDurationSeconds,
      sessionsWithOnlyOneMessage,
      totalSessions,
      sessions, // include the raw sessions for CSV generation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/analytics/sessions", async (req, res) => {
  try {
    const range = req.query.range || "all";
    const since = getSinceDate(range);

    let query = supabase.from("sessions").select("*").order("created_at", { ascending: false }).limit(200);
    if (since) query = query.gte("created_at", since);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
