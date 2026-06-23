// Minimal Claude Messages API client using Node's built-in fetch.
// No SDK dependency by design — keeps automation/ at zero npm dependencies.

import { config } from "../config.mjs";

const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";

/**
 * @param {string} prompt - user message text
 * @param {object} [opts]
 * @param {string} [opts.system] - system prompt
 * @param {string} [opts.model] - defaults to config.anthropicModel
 * @param {number} [opts.maxTokens]
 * @returns {Promise<string>} the assistant's text reply
 */
export async function askClaude(prompt, opts = {}) {
  if (!config.anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const body = {
    model: opts.model || config.anthropicModel,
    max_tokens: opts.maxTokens || 1024,
    messages: [{ role: "user", content: prompt }],
  };
  if (opts.system) body.system = opts.system;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-api-key": config.anthropicApiKey,
      "anthropic-version": API_VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const textBlock = (data.content || []).find((b) => b.type === "text");
  if (!textBlock) {
    throw new Error("Anthropic API returned no text block");
  }
  return textBlock.text.trim();
}

export async function askClaudeFast(prompt, opts = {}) {
  return askClaude(prompt, { ...opts, model: opts.model || config.anthropicFastModel });
}
