import { useState, useEffect } from "react";

interface UseTypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const useTypewriter = ({
  text,
  speed = 20,
  onComplete = () => {},
}: UseTypewriterProps) => {
  const [index, setIndex] = useState(0);
  const displayText = text.slice(0, index);

  useEffect(() => {
    if (text && index >= text.length) {
      onComplete();
      return;
    }

    const timeoutId = setTimeout(() => {
      // Skip over a whole HTML tag (<br />, <strong>, </strong>) at once so a
      // half-typed tag never shows up as text.
      if (text.charAt(index) === "<") {
        const tagEnd = text.indexOf(">", index);
        setIndex(tagEnd === -1 ? index + 1 : tagEnd + 1);
      } else {
        setIndex((i) => i + 1);
      }
    }, speed);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [index, text, speed]);

  const resetTypewriter = () => {
    setIndex(0);
  };

  return {
    displayText,
    resetTypewriter,
  };
};
