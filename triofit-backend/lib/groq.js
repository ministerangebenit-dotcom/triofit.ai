import dotenv from "dotenv";
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function chatCompletion(messages) {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages,
        temperature: 0.7,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Groq error:", data);
    throw new Error(data?.error?.message || "Groq request failed");
  }

  return data.choices[0].message.content;
}
