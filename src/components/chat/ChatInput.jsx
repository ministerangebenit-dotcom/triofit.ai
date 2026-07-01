import { useState } from "react";

export default function ChatInput({ onSend }) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="w-full p-4 border-t border-white/10 flex gap-3">

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message..."
        className="
          flex-1
          px-4 py-3
          rounded-full
          bg-white/10
          outline-none
          text-sm
        "
        onKeyDown={(e) => {
          if (e.key === "Enter") send();
        }}
      />

      <button
        onClick={send}
        className="
          px-5 py-3
          bg-[#C79B45]
          text-black
          rounded-full
          font-semibold
        "
      >
        Send
      </button>

    </div>
  );
}
