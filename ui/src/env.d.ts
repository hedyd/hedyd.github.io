interface ImportMetaEnv {
  /** URL of the chat Worker's /api/chat endpoint. */
  readonly PUBLIC_CHAT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
