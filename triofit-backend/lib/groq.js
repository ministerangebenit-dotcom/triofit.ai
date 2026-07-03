import dotenv from "dotenv";
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function chatCompletion(messages) {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error: ${errText}`);
    }

    const data = await response.json();

    return data.choices?.[0]?.message?.content || "No response from AI.";
  } catch (error) {
    console.error("Groq error:", error);
    return "AI service error.";
  }
}
