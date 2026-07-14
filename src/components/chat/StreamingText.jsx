import { useState, useEffect, useRef } from "react";

export default function StreamingText({ text, speed = 18, onDone }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    indexRef.current = 0;
    doneRef.current = false;
    setDisplayed("");

    if (!text) return;

    const words = text.split(" ");
    let cancelled = false;

    function step() {
      if (cancelled) return;
      if (indexRef.current >= words.length) {
        if (!doneRef.current) {
          doneRef.current = true;
          onDone?.();
        }
        return;
      }
      indexRef.current += 1;
      setDisplayed(words.slice(0, indexRef.current).join(" "));
      setTimeout(step, speed);
    }

    step();

    return () => { cancelled = true; };
  }, [text]);

  return <span>{displayed}</span>;
}
