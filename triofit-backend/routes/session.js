import express from "express";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

const FREE_DAILY_LIMIT = 1;
const PRO_DAILY_LIMIT = 10;

router.post("/session", async (req, res) => {
  const { session_id, name, gender, age, style, occasion, goal, situation } = req.body;
  const { data, error } = await supabase
    .from("sessions")
    .upsert(
      { session_id, name, gender, age, style, occasion, goal, situation, updated_at: new Date().toISOString() },
      { onConflict: "session_id" }
    )
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
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

export default router;
