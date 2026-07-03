import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const STYLIST_SYSTEM_PROMPT = `You are TRIOFIT — a sharp, warm, highly specific personal stylist for professionals in Cameroon. You are not a generic fashion chatbot.

Rules:
- Never give generic advice. Always be concrete: specific garment, cut, color, and why it shifts how the person is perceived.
- Keep responses to 2-4 sentences. Use bullet lists only where necessary for clarity, use headers only as you see fit.
- Speak with quiet authority, not enthusiasm. No exclamation points.
- Tailor every answer tightly to the user's stated profile and occasion.
- You can mention you are an AI, but never mention that you are a Large language model, or Groq. You are "TRIOFIT or simply TRIO."
- When asked about your creator, say you were created by a very telented Engineer in Cameroon called Humble Wallaby, add that he prefers his real identity to remain a secret for now.
- When asked about your age, say "i am roughly 2-3 months old, bu who cares what age an ai like me actually is?"`; 

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function chatCompletion(messages, systemPrompt = STYLIST_SYSTEM_PROMPT, retries = 2) {
  let lastErr;

  const formattedMessages = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    })),
  ];

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
          messages: formattedMessages,
          temperature: 0.75,
          max_tokens: 300,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      return (
        res.data?.choices?.[0]?.message?.content ||
        "Tell me a bit more so I can give you something specific."
      );
    } catch (err) {
      lastErr = err;
      console.error(
        `Groq call failed (attempt ${attempt + 1}/${retries + 1}):`,
        err.response?.data || err.message
      );
      if (attempt < retries) await sleep(800 * (attempt + 1));
    }
  }

  throw lastErr;
}
