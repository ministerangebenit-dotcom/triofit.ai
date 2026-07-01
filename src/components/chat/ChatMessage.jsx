export default function ChatMessage({ role, text }) {
  return (
    <div
      className={`w-full flex ${
        role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`
          max-w-[75%]
          px-4 py-3
          rounded-2xl
          text-sm leading-relaxed
          whitespace-pre-wrap
          ${
            role === "user"
              ? "bg-[#C79B45] text-black rounded-br-sm"
              : "bg-white/10 text-white rounded-bl-sm"
          }
        `}
      >
        {text}
      </div>
    </div>
  );
}
