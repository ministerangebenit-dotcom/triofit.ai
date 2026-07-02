import express from "express";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

router.post("/session", async (req, res) => {
  const { session_id, name, gender, age, style, occasion, goal } = req.body;
  const { data, error } = await supabase
    .from("sessions")
    .upsert(
      { session_id, name, gender, age, style, occasion, goal, updated_at: new Date().toISOString() },
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

export default router;
