import express from "express";
import { chatCompletion } from "../lib/groq.js";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { session_id, messages } = req.body;

    const reply = await chatCompletion(messages);

    await supabase.from("messages").insert({
      session_id,
      sender: "admin",
      message: reply,
      message_type: "text",
    });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "AI error" });
  }
});

export default router;
