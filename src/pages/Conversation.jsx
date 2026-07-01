import { useState } from "react";

import ChatHeader from "../components/chat/ChatHeader";
import ChatMessage from "../components/chat/ChatMessage";
import ChatInput from "../components/chat/ChatInput";
import ProgressBar from "../components/chat/ProgressBar";
import TypingIndicator from "../components/chat/TypingIndicator";

export default function Conversation() {

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi Kevin.\nI'm Triofit.\nLet's understand your style."
    }
  ]);

  const [progress, setProgress] = useState(20);
  const [typing, setTyping] = useState(false);

  const sendMessage = (text) => {

    setMessages((prev) => [
      ...prev,
      { role: "user", text }
    ]);

    setTyping(true);

    // fake AI delay (we replace later with Gemini)
    setTimeout(() => {

      setTyping(false);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Interesting.\nTell me more about your daily lifestyle."
        }
      ]);

      setProgress((p) => Math.min(p + 15, 100));

    }, 1200);

  };

  return (
    <div className="h-screen flex flex-col bg-black text-white">

      <ChatHeader />

      <ProgressBar progress={progress} />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">

        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} text={m.text} />
        ))}

        {typing && <TypingIndicator />}

      </div>

      <ChatInput onSend={sendMessage} />

    </div>
  );
}
