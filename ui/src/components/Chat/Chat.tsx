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

const CHAT_URL: string | undefined = import.meta.env.PUBLIC_CHAT_URL;
const REQUEST_TIMEOUT_MS = 20000;

type ChatResponse = { text: string } | { error: string; message: string };

const errorMessages: Record<string, string> = {
  rate_limited:
    "Whoa, that's a lot of questions at once! Give me a minute and try again.",
  daily_limit:
    "I've used up today's free AI budget, so I'm resting until tomorrow. Try again later!",
  timeout: "That took too long to answer. Try asking again!",
  default: "Sorry, chat isn't working right now. Try again later!",
};

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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      if (!CHAT_URL) {
        throw new Error("PUBLIC_CHAT_URL is not set.");
      }

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userInput }),
        signal: controller.signal,
      });
      const json: ChatResponse | null = await response
        .json()
        .catch(() => null);

      if (!response.ok || !json || !("text" in json)) {
        setText(
          errorMessages[json && "error" in json ? json.error : ""] ??
            errorMessages.default,
        );
        return;
      }

      setText(encode(json.text).replace(/\n/g, "<br />"));
    } catch (error) {
      setText(
        error instanceof DOMException && error.name === "AbortError"
          ? errorMessages.timeout
          : errorMessages.default,
      );
    } finally {
      clearTimeout(timeout);
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
          This chat runs on the free tier of{" "}
          <a
            href="https://developers.cloudflare.com/workers-ai/"
            target="_blank"
          >
            Cloudflare Workers AI
          </a>
          . Please don't judge it too much, it's trying its hardest.
        </div>
      </form>
    </div>
  );
};
