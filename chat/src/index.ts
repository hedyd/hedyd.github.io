import { resume } from "./generated/resume";

export interface Env {
  AI: Ai;
  CHAT_LIMITER: RateLimit;
  /** Workers AI model id, e.g. @cf/google/gemma-4-26b-a4b-it */
  MODEL: string;
  /** Comma-separated origins allowed to call the chat. */
  ALLOWED_ORIGINS: string;
}

const MAX_PROMPT_LENGTH = 200;

const SYSTEM_PROMPT = `You are a question answering agent. I will provide you with a resume. The user will provide you with a question. Your job is to answer the user's question using only information from the resume.

- You should provide concise answers to simple questions when the answer is directly contained in the resume, but when it comes to yes/no questions, provide some details.
- If the resume does not contain information that can answer the question, state that Hedy's resume does not contain this information.
- DO NOT USE INFORMATION THAT IS NOT IN THE RESUME!

Here is the resume:

${resume}`;

type ErrorCode =
  | "bad_request"
  | "not_found"
  | "rate_limited"
  | "daily_limit"
  | "model_error";

const corsHeaders = (request: Request, env: Env): Record<string, string> => {
  const origin = request.headers.get("Origin") ?? "";
  const allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
  if (!allowed.includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
};

const json = (
  request: Request,
  env: Env,
  status: number,
  body: { text: string } | { error: ErrorCode; message: string },
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(request, env),
    },
  });

// Workers AI returns `{ response }` for most text models and an
// OpenAI-style `{ choices }` for some newer ones.
const readText = (output: unknown): string | undefined => {
  const o = output as {
    response?: unknown;
    choices?: { message?: { content?: unknown } }[];
  };
  if (typeof o?.response === "string") return o.response;
  const content = o?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : undefined;
};

// Error 4006 means the account has used its free daily neurons.
const isDailyLimitError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("4006") || /daily free allocation/i.test(message);
};

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname !== "/api/chat") {
      return json(request, env, 404, {
        error: "not_found",
        message: "Not found.",
      });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request, env),
      });
    }

    if (request.method !== "POST") {
      return json(request, env, 405, {
        error: "bad_request",
        message: "Use POST.",
      });
    }

    let prompt: unknown;
    try {
      prompt = ((await request.json()) as { prompt?: unknown })?.prompt;
    } catch {
      return json(request, env, 400, {
        error: "bad_request",
        message: "Invalid JSON in request body.",
      });
    }

    if (typeof prompt !== "string" || !prompt.trim()) {
      return json(request, env, 400, {
        error: "bad_request",
        message: "Missing 'prompt' in request body.",
      });
    }

    if (prompt.length > MAX_PROMPT_LENGTH) {
      return json(request, env, 400, {
        error: "bad_request",
        message: `'prompt' should be at most ${MAX_PROMPT_LENGTH} characters.`,
      });
    }

    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const { success } = await env.CHAT_LIMITER.limit({ key: ip });
    if (!success) {
      return json(request, env, 429, {
        error: "rate_limited",
        message: "Too many questions at once. Try again in a minute.",
      });
    }

    try {
      const output = await env.AI.run(env.MODEL as keyof AiModels, {
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
        // Gemma 4 reasons before answering by default, which can use the
        // whole token budget and leave no answer. Short resume answers
        // don't need it, and it also costs more neurons.
        chat_template_kwargs: { enable_thinking: false },
      });
      const text = readText(output);
      if (!text) {
        throw new Error(
          `Model returned no text: ${JSON.stringify(output).slice(0, 500)}`,
        );
      }
      return json(request, env, 200, { text });
    } catch (error) {
      console.error(
        "AI request failed:",
        error instanceof Error ? error.message : String(error),
      );
      if (isDailyLimitError(error)) {
        return json(request, env, 429, {
          error: "daily_limit",
          message: "The chat has used up today's free budget.",
        });
      }
      return json(request, env, 502, {
        error: "model_error",
        message: "The model couldn't answer right now.",
      });
    }
  },
} satisfies ExportedHandler<Env>;
