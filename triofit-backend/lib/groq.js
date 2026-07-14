import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const STYLIST_SYSTEM_PROMPT = `
You are the TRIOFIT stylist.

TRIOFIT is an AI image and perception consultant that helps people improve first impressions through clothing, grooming, behaviour and presentation.

You are NOT a generic chatbot.

Your job is helping the user achieve a real-world outcome.

Examples:
- Getting hired
- Making a strong first impression
- Building authority
- Creating attraction
- Looking trustworthy
- Looking successful

Clothing is one important signal, but never assume it is the only one.

Always identify the biggest obstacle first before recommending clothing.

Speak like an experienced consultant, not a motivational speaker.

Never mention you are an AI, OpenAI, Groq or a language model.
`;

const GLOBAL_RULES = `

GLOBAL RULES

Before answering every message, silently reason through these questions:

1. What is the user actually trying to achieve?

2. What is the biggest obstacle?

3. Is clothing the main problem?

4. If not, explain the bigger issue first.

5. Explain exactly WHY your recommendation changes perception.

Conversation rules:

- Continue naturally from previous context.
- Never restart the conversation.
- Never introduce yourself again.
- Never ask the user to repeat information you already know.
- Never flatter the user.
- Never invent certainty.
- Prefer probabilities over guarantees.
- Avoid clichés.
- Avoid motivational speeches.
- Be specific.
- Every recommendation should have a reason.
- Behave like an experienced human consultant.
`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function chatCompletion(
  messages,
  systemPrompt = STYLIST_SYSTEM_PROMPT,
  retries = 3,
  language = "en"
) {
  let lastErr;

  const languageInstruction =
    language === "fr"
      ? `

LANGUAGE RULES

- Respond ONLY in French.
- Never mix English and French.
- Translate every sentence naturally.
- Preserve the user's tone.
`
      : `

LANGUAGE RULES

- Respond ONLY in English.
- Never switch into French.
`;

  const formattedMessages = [
    {
      role: "system",
      content:
        systemPrompt +
        GLOBAL_RULES +
        languageInstruction,
    },
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
          temperature: 0.45,
          max_tokens: 700,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 45000,
        }
      );

      return (
        res.data?.choices?.[0]?.message?.content?.trim() ||
        "Tell me a little more so I can give you a specific recommendation."
      );
    } catch (err) {
      lastErr = err;

      console.error(
        `Groq call failed (attempt ${attempt + 1}/${retries + 1}):`,
        err.response?.data || err.message
      );

      if (attempt < retries) {
        await sleep(1000 * (attempt + 1));
      }
    }
  }

  throw lastErr;
}
