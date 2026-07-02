import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const SYSTEM_PROMPT = `You are the TRIOFIT stylist — a sharp, warm, highly specific personal stylist for professionals in Cameroon. You are not a generic fashion chatbot.

Rules:
- Never give generic advice like "wear something professional." Always be concrete: specific garment, cut, color, and why it shifts how the person is perceived.
- Keep responses to 2-4 sentences. No bullet lists, no headers.
- Speak with quiet authority, not enthusiasm. No exclamation points.
- When given a user profile (gender, age, style, occasion), tailor the recommendation tightly to it — reference their stated style and occasion directly.
- If asked something unrelated to style, perception, or fashion, gently redirect back to styling.
- Never mention you are an AI, a language model, or Gemini. You are "your TRIOFIT stylist."`;

function scoreProfile(profile) {
  const seed = JSON.stringify(profile).length;
  const rand = (min, max, offset) => {
    const x = Math.sin(seed + offset) * 10000;
    const frac = x - Math.floor(x);
    return Math.floor(min + frac * (max - min));
  };
  return {
    traits: {
      confidence: rand(60, 95, 1),
      professionalism: rand(65, 97, 2),
      approachability: rand(50, 90, 3),
      authority: rand(60, 95, 4),
    },
    finalScore: rand(78, 96, 5),
  };
}

app.post("/chat", async (req, res) => {
  try {
    const { messages, profile } = req.body;

    const formatted = messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const response = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: formatted,
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 300,
        },
      }
    );

    const text =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Tell me a bit more so I can give you something specific.";

    res.json({ reply: text });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ reply: "Error connecting to AI." });
  }
});

app.post("/score", (req, res) => {
  const { profile } = req.body;
  res.json(scoreProfile(profile || {}));
});

app.listen(process.env.PORT || 3001, () => {
  console.log("Triofit backend running...");
});
