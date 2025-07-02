import styles from "./SpeechBubble.module.scss";

interface SpeechBubbleProps {
  text: string;
  sanitized?: boolean;
  reverse?: boolean;
  color?: string;
}

export const SpeechBubble = ({
  text,
  color,
  reverse,
  sanitized = true,
}: SpeechBubbleProps) => {
  return (
    <>
      {!sanitized && (
        <blockquote
          data-reverse={reverse}
          className={styles.speechBubble}
          style={{ "--bubble-color": color } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: text }}
        ></blockquote>
      )}
      {sanitized && (
        <blockquote
          data-reverse={reverse}
          className={styles.speechBubble}
          style={{ "--bubble-color": color } as React.CSSProperties}
        >
          {text}
        </blockquote>
      )}
    </>
  );
};
