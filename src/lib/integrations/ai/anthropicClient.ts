/**
 * Shared low-level client for calling the Anthropic Messages API with a
 * single forced tool call, so a caller gets back structured JSON instead of
 * free-form text. Factored out of KidsArabicAiTutorAdapter so other
 * AI-backed features (e.g. ReviewTranslationAdapter) reuse the exact same
 * request/response handling and timeout behavior instead of re-implementing
 * it, and so every caller shares one ANTHROPIC_API_KEY configuration check.
 */
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
// Overridable via ANTHROPIC_MODEL in case Anthropic renames/retires this
// model id after this code was written -- no redeploy needed, just update
// the env var in Vercel.
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const REQUEST_TIMEOUT_MS = 15000;

interface AnthropicContentBlock {
  type: string;
  input?: unknown;
  [key: string]: unknown;
}

interface AnthropicResponse {
  content?: AnthropicContentBlock[];
  error?: { type?: string; message?: string };
}

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY);
}

export async function callAnthropicTool(params: {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  toolName: string;
  toolDescription: string;
  toolSchema: Record<string, unknown>;
  maxTokens: number;
}): Promise<Record<string, unknown>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
      max_tokens: params.maxTokens,
      system: params.system,
      messages: params.messages,
      tools: [
        {
          name: params.toolName,
          description: params.toolDescription,
          input_schema: params.toolSchema,
        },
      ],
      tool_choice: { type: "tool", name: params.toolName },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const body = (await response.json()) as AnthropicResponse;

  if (!response.ok) {
    throw new Error(
      `Anthropic API error (${response.status}): ${body.error?.message || "unknown error"}`
    );
  }

  const toolUse = (body.content || []).find(
    (block) => block.type === "tool_use" && typeof block.input === "object" && block.input !== null
  );
  if (!toolUse || typeof toolUse.input !== "object" || toolUse.input === null) {
    throw new Error("Anthropic API response did not include the expected structured reply");
  }

  return toolUse.input as Record<string, unknown>;
}
