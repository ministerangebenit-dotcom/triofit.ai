import express from "express";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

const FREE_DAILY_LIMIT = 1;
const PRO_DAILY_LIMIT = 10;

router.post("/session", async (req, res) => {
  const { session_id, name, gender, age, style, occasion, goal, situation } = req.body;

  // Check if this session already exists
  const { data: existing } = await supabase
    .from("sessions")
    .select("visit_count")
    .eq("session_id", session_id)
    .single();

  const isNew = !existing;
  const visitCount = isNew ? 1 : (existing.visit_count || 0) + 1;

  const { data, error } = await supabase
    .from("sessions")
    .upsert(
      {
        session_id,
        name,
        gender,
        age,
        style,
        occasion,
        goal,
        situation,
        visit_count: visitCount,
        first_seen: isNew ? new Date().toISOString() : undefined,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id" }
    )
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ...data, isNew });
});

router.get("/session/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("session_id", req.params.id)
    .single();

  if (error) return res.status(404).json({ error: "Session not found" });
  res.json(data);
});

router.patch("/session/:id/stage", async (req, res) => {
  const { stage } = req.body;
  const { error } = await supabase
    .from("sessions")
    .update({ stage, updated_at: new Date().toISOString() })
    .eq("session_id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

router.get("/session/:id/limit-check", async (req, res) => {
  const { data: session, error } = await supabase
    .from("sessions")
    .select("is_pro, analysis_count, analysis_date")
    .eq("session_id", req.params.id)
    .single();

  if (error || !session) {
    return res.json({ allowed: true, remaining: FREE_DAILY_LIMIT, isPro: false });
  }

  const today = new Date().toISOString().slice(0, 10);
  const isToday = session.analysis_date === today;
  const currentCount = isToday ? session.analysis_count : 0;
  const limit = session.is_pro ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;

  res.json({
    allowed: currentCount < limit,
    remaining: Math.max(limit - currentCount, 0),
    isPro: session.is_pro,
    limit,
  });
});

router.post("/session/:id/record-analysis", async (req, res) => {
  const { data: session } = await supabase
    .from("sessions")
    .select("analysis_count, analysis_date")
    .eq("session_id", req.params.id)
    .single();

  const today = new Date().toISOString().slice(0, 10);
  const isToday = session?.analysis_date === today;
  const newCount = isToday ? (session.analysis_count || 0) + 1 : 1;

  const { error } = await supabase
    .from("sessions")
    .update({ analysis_count: newCount, analysis_date: today })
    .eq("session_id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, newCount });
});

router.patch("/session/:id/pro-status", async (req, res) => {
  const { is_pro } = req.body;
  const { error } = await supabase
    .from("sessions")
    .update({ is_pro })
    .eq("session_id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, is_pro });
});

// ── STORE INTEREST ──
router.post("/store-interest", async (req, res) => {
  const { business_name, business_type, contact, city } = req.body;
  const { data, error } = await supabase
    .from("store_interest")
    .insert({ business_name, business_type, contact, city })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── NEW vs RETURNING STATS ──
router.get("/session-stats/today", async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  // New today: first_seen is today
  const { count: newToday } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .gte("first_seen", today + "T00:00:00Z")
    .lte("first_seen", today + "T23:59:59Z");

  // Returning today: last_seen is today AND visit_count > 1
  const { count: returningToday } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .gte("last_seen", today + "T00:00:00Z")
    .lte("last_seen", today + "T23:59:59Z")
    .gt("visit_count", 1);

  res.json({
    newToday: newToday || 0,
    returningToday: returningToday || 0,
  });
});

export default router;
