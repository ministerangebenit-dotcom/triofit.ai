import fetch from "node-fetch";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function chatCompletion(messages) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages,
          temperature: 0.7,
        }),
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error: ${errText}`);
    }

    const data = await response.json();

    return data.choices?.[0]?.message?.content || "No response generated.";
  } catch (err) {
    clearTimeout(timeout);
    console.error("Groq fetch failed:", err);

    // HARD fallback (prevents 500 cascade)
    return "I'm unable to connect to the AI service right now. Please retry.";
  }
}
