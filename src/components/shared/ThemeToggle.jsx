import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      style={{
        position: "fixed", top: 16, right: 16, zIndex: 50,
        width: 36, height: 36, borderRadius: "50%",
        background: "var(--surface-2)", border: "1px solid var(--border-soft)",
        color: "var(--text-dim)", display: "flex", alignItems: "center",
        justifyContent: "center", cursor: "pointer", fontSize: 15,
      }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
