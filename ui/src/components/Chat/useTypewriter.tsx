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
  const lineBreak = "<br />";

  useEffect(() => {
    if (text && index >= text.length) {
      onComplete();
      return;
    }

    const timeoutId = setTimeout(() => {
      if (text.charAt(index) === "<") {
        setIndex((i) => i + lineBreak.length);
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
