import { useCallback, useEffect, useState } from "react";
import { encode } from "html-entities";
import { Loading } from "../Loading/Loading";
import { useTypewriter } from "./useTypewriter";
import { Keyboard, type KeyboardProps } from "../Keyboard/Keyboard";
import { SpeechBubble } from "../SpeechBubble/SpeechBubble";
import { colorPairs } from "../../data/colorPairs";
import { keyCodeMapping, letterMapping } from "../../data/letterMapping";

import styles from "./Chat.module.scss";

const startingText = `Ask me anything about Hedy's resume! Here are some example questions:<br /><br />
- Can you describe Hedy's experience with CI/CD pipelines and how she set them up for different projects?<br />
- What is Hedy's experience with cloud services like AWS?<br />
- What are some interesting projects Hedy has used React with?`;

export const Chat = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [text, setText] = useState<string>(startingText);
  const [userInput, setUserInput] = useState<string>("");
  const [userInputLetters, setUserInputLetters] = useState<
    KeyboardProps["activeLetters"]
  >({});
  const [displayTextComplete, setDisplayTextComplete] =
    useState<boolean>(false);
  const { displayText, resetTypewriter } = useTypewriter({
    text,
    onComplete: () => {
      setDisplayTextComplete(true);
    },
  });

  const sendChatMessage = useCallback(async () => {
    if (!userInput) {
      return;
    }

    setText("");
    setDisplayTextComplete(false);
    resetTypewriter();
    setLoading(true);

    const body = {
      prompt: userInput,
    };

    try {
      const response = await fetch(
        "https://qgftcen1z6.execute-api.us-east-1.amazonaws.com/prod/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.body) {
        return;
      }

      const json = await response.json();
      const text = encode(json?.output?.message?.content[0]?.text);
      const output = text?.replace(/\n/g, "<br />") || "";

      setText(output);
    } catch {
      setText("Sorry, chat isn't working right now. Try again later!");
    } finally {
      setLoading(false);
    }
  }, [userInput]);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const formJson = Object.fromEntries(formData.entries());

    if (!formJson?.chatText || typeof formJson.chatText !== "string") {
      return;
    }

    form.reset();
    setUserInput(formJson.chatText);
  }, []);

  const chatTextKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!e?.code) {
      return;
    }

    const key = Object.keys(keyCodeMapping).includes(e.code) ? e.code : "";

    if (!Object.keys(letterMapping).includes(key)) {
      return;
    }

    setUserInputLetters({
      ...userInputLetters,
      [key]: true,
    });
  };

  const chatTextKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!e?.code) {
      return;
    }

    const key = Object.keys(keyCodeMapping).includes(e.code) ? e.code : "";

    if (!Object.keys(letterMapping).includes(key)) {
      return;
    }

    setUserInputLetters((current) => {
      const newLetters = { ...current };
      delete newLetters[key];
      return newLetters;
    });
  };

  useEffect(() => {
    sendChatMessage();
  }, [sendChatMessage]);

  const activeLetter =
    Object.keys(userInputLetters || {}).length > 0
      ? userInputLetters
      : !displayTextComplete
        ? { [displayText.slice(-1)]: true }
        : {};

  return (
    <div className={styles.chat}>
      <div className={styles.output}>
        {userInput && (
          <SpeechBubble
            text={userInput}
            color={colorPairs[3].primary}
            reverse
            sanitized
          />
        )}
        {displayText && (
          <SpeechBubble
            text={displayText}
            color={colorPairs[2].primary}
            sanitized={false}
          />
        )}
        {loading && (
          <div className={styles.loading}>
            <Loading />
          </div>
        )}
      </div>
      <Keyboard activeLetters={activeLetter} />
      <form method="post" onSubmit={handleSubmit}>
        <div className={styles.controls}>
          <label htmlFor="chatText" className={styles.label}>
            Chat Text
          </label>
          <input
            id="chatText"
            className={styles.input}
            name="chatText"
            type="text"
            disabled={!displayTextComplete}
            autoComplete="off"
            maxLength={200}
            onKeyDown={chatTextKeyDown}
            onKeyUp={chatTextKeyUp}
          />
          <button className={styles.button} type="submit" disabled={loading}>
            Send
          </button>
        </div>
        <div className={styles.disclaimer}>
          This chat uses{" "}
          <a
            href="https://docs.aws.amazon.com/nova/latest/userguide/what-is-nova.html"
            target="_blank"
          >
            Amazon Nova Micro
          </a>
          , the cheapest AI model I could find. Please don't judge it too much,
          it's trying its hardest.
        </div>
      </form>
    </div>
  );
};
