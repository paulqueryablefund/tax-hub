/**
 * The only module in the app that talks to a model provider. Everything else
 * calls through here, so replacing the platform is a one-file change.
 *
 * Two hard rules live here and nowhere else:
 *  - the model id is pinned, never defaulted by the gateway;
 *  - the API key is read per invocation, never captured at module scope.
 */

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

/**
 * Pinned deliberately. The gateway default changed on 22 July 2026 and a legal
 * answer must be reproducible from the record of which model produced it.
 */
export const KNOWLEDGE_MODEL_ID = "google/gemini-2.5-flash";

export type GatewayFailure = "no_credits" | "rate_limited" | "unavailable" | "malformed";

export class GatewayError extends Error {
  constructor(
    readonly failure: GatewayFailure,
    message: string,
  ) {
    super(message);
    this.name = "GatewayError";
  }
}

/** Honest, user-facing text for each failure. Never a substitute answer. */
export function gatewayFailureMessage(failure: GatewayFailure): string {
  switch (failure) {
    case "no_credits":
      return "The AI workspace has run out of credits, so no answer could be produced. Nothing was guessed. Add credits and ask again.";
    case "rate_limited":
      return "The AI service is rate-limited right now, so no answer could be produced. Nothing was guessed. Wait a moment and ask again.";
    case "unavailable":
      return "The AI service could not be reached, so no answer could be produced. Nothing was guessed.";
    case "malformed":
      return "The model did not return an answer in the required structured form, so it was discarded rather than shown. Nothing was guessed.";
  }
}

export interface GatewayCall {
  model: string;
  system: string;
  user: string;
  /** JSON schema the model must fill. Structured output is mandatory. */
  schema: { name: string; schema: Record<string, unknown> };
  temperature?: number;
}

/** Returns the parsed structured payload, or throws GatewayError. */
export async function callStructured<T>(call: GatewayCall): Promise<T> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new GatewayError("unavailable", "LOVABLE_API_KEY is not configured.");

  let response: Response;
  try {
    response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: call.model,
        temperature: call.temperature ?? 0,
        messages: [
          { role: "system", content: call.system },
          { role: "user", content: call.user },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: call.schema.name, strict: true, schema: call.schema.schema },
        },
      }),
    });
  } catch (cause) {
    throw new GatewayError("unavailable", `Gateway request failed: ${String(cause)}`);
  }

  if (response.status === 402) {
    throw new GatewayError("no_credits", await response.text());
  }
  if (response.status === 429) {
    throw new GatewayError("rate_limited", await response.text());
  }
  if (!response.ok) {
    throw new GatewayError("unavailable", `Gateway returned ${response.status}: ${await response.text()}`);
  }

  let content: string | undefined;
  try {
    const body = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    content = body.choices?.[0]?.message?.content ?? undefined;
  } catch (cause) {
    throw new GatewayError("malformed", `Gateway body was not JSON: ${String(cause)}`);
  }
  if (!content) throw new GatewayError("malformed", "Gateway returned no message content.");

  try {
    return JSON.parse(content) as T;
  } catch {
    throw new GatewayError("malformed", "Model content was not valid JSON.");
  }
}
