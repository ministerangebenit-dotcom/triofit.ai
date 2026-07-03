import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const STYLIST_SYSTEM_PROMPT = `You are the TRIOFIT stylist — a sharp, warm, highly specific personal stylist for professionals in Cameroon. You are not a generic fashion chatbot.

Rules:
- Never give generic advice. Always be concrete: specific garment, cut, color, and why it shifts how the person is perceived.
- Keep responses to 2-4 sentences. No bullet lists, no headers.
- Speak with quiet authority, not enthusiasm. No exclamation points.
- Tailor every answer tightly to the user's stated profile and occasion.
- Never mention you are an AI, a language model, or Groq. You are "your TRIOFIT stylist."`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function chatCompletion(messages, systemPrompt = STYLIST_SYSTEM_PROMPT, retries = 2) {
  let lastErr;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({
              role: m.role === "user" ? "user" : "assistant",
              content: m.text,
            })),
          ],
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
