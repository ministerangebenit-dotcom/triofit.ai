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

app.post("/chat", async (req, res) => {

  try {

    const { messages } = req.body;

    const formatted = messages.map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    const response = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: formatted,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 400
        }
      }
    );

    const text =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I need more information.";

    res.json({ reply: text });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      reply: "Error connecting to AI."
    });

  }

});

app.listen(process.env.PORT || 3001, () => {
  console.log("Triofit backend running...");
});
