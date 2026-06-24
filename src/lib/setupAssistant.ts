// Core logic for the dashboard's credential setup-assistant chat. The site
// owner pastes API keys/tokens/config in plain language and Claude writes
// them straight to this repo's GitHub Actions secrets/variables — no manual
// trip to GitHub's UI. Stateless like the rest of the dashboard: the full
// conversation (including tool_use/tool_result blocks) is passed in by the
// caller every turn and handed back updated; nothing is persisted server-side.
//
// This needs its own ANTHROPIC_API_KEY set as a website env var — separate
// from the same-named GitHub Actions secret the automation/ agents use —
// since it can't use itself to configure itself.

import Anthropic from "@anthropic-ai/sdk";

import { CREDENTIAL_CATALOG, findCredential, isWritableCredentialName } from "@/lib/credentialCatalog";
import { setActionsSecret, setActionsVariable } from "@/lib/github";

export type TextBlock = { type: "text"; text: string };
export type ToolUseBlock = { type: "tool_use"; id: string; name: string; input: unknown };
export type ToolResultBlock = {
  type: "tool_result";
  tool_use_id: string;
  content: string;
  is_error?: boolean;
};
export type ContentBlock = TextBlock | ToolUseBlock | ToolResultBlock;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string | ContentBlock[];
};

const MODEL = "claude-sonnet-4-6";
const MAX_TOOL_TURNS = 6;

const SET_CREDENTIAL_TOOL: Anthropic.Tool = {
  name: "set_credential",
  description:
    "Writes one credential to this repo's GitHub Actions secrets or variables so the growth agents can use it. Only call this once you have the exact value the user gave you — never invent or guess a value.",
  input_schema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Exact credential name from the catalog given in the system prompt.",
      },
      value: { type: "string", description: "The plaintext value to store." },
    },
    required: ["name", "value"],
  },
};

function systemPrompt() {
  const lines = CREDENTIAL_CATALOG.map(
    (c) => `- ${c.name} (${c.kind}): ${c.label} — ${c.description}`,
  ).join("\n");
  return `You are the setup assistant for GunaFix's growth-agents dashboard. The site owner will paste API keys, tokens, and config values in plain language, sometimes several at once, sometimes with extra surrounding text. Identify which credential(s) they're giving you, map each to one of the exact names below, and call set_credential once per value to write it.

Credential catalog (the ONLY names you may ever pass to set_credential):
${lines}

Rules:
- Only call set_credential with a name from the list above, exactly as written. If you can't confidently match what the user gave you to one of these, ask them to clarify instead of guessing.
- Never call set_credential with a value you weren't explicitly given.
- After writing a value, NEVER repeat it back — confirm only by credential name (e.g. "Saved GMAIL_REFRESH_TOKEN."). Treat every value as sensitive even if it's stored as a plaintext variable.
- If the user pastes multiple values in one message, call set_credential separately for each.
- Keep replies short and practical. If something looks malformed (e.g. a private key missing its header/footer) say so before saving it.`;
}

async function executeSetCredential(input: unknown): Promise<{ content: string; is_error?: boolean }> {
  const args = input as { name?: unknown; value?: unknown };
  const name = String(args?.name ?? "");
  const value = String(args?.value ?? "");

  if (!isWritableCredentialName(name)) {
    return {
      content: `Refused: "${name}" is not in the credential catalog. Pick one of the exact names from the system prompt.`,
      is_error: true,
    };
  }
  if (!value) {
    return { content: `Refused: empty value for ${name}.`, is_error: true };
  }

  const credential = findCredential(name)!;
  try {
    if (credential.kind === "secret") {
      await setActionsSecret(name, value);
    } else {
      await setActionsVariable(name, value);
    }
    return { content: `Saved ${name}.` };
  } catch (error) {
    return {
      content: `Failed to save ${name}: ${error instanceof Error ? error.message : "unknown error"}`,
      is_error: true,
    };
  }
}

function toContentBlocks(content: Anthropic.Message["content"]): ContentBlock[] {
  return content.map((block) => {
    if (block.type === "text") return { type: "text", text: block.text };
    if (block.type === "tool_use") {
      return { type: "tool_use", id: block.id, name: block.name, input: block.input };
    }
    return { type: "text", text: "" };
  });
}

export function noApiKeyConfigured() {
  return !process.env.ANTHROPIC_API_KEY;
}

/** Runs one user turn (possibly several tool round-trips) and returns the full updated history. */
export async function runSetupAssistantTurn(
  history: ChatMessage[],
  userText: string,
): Promise<ChatMessage[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return [
      ...history,
      { role: "user", content: userText },
      {
        role: "assistant",
        content:
          "The setup assistant needs ANTHROPIC_API_KEY set as an environment variable on this website (separate from the same-named GitHub Actions secret the agents use) — it can't configure itself.",
      },
    ];
  }

  const client = new Anthropic({ apiKey });
  const conversation: ChatMessage[] = [...history, { role: "user", content: userText }];

  for (let i = 0; i < MAX_TOOL_TURNS; i++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt(),
      tools: [SET_CREDENTIAL_TOOL],
      messages: conversation as Anthropic.MessageParam[],
    });

    const blocks = toContentBlocks(response.content);
    conversation.push({ role: "assistant", content: blocks });

    if (response.stop_reason !== "tool_use") {
      return conversation;
    }

    const toolResults: ToolResultBlock[] = [];
    for (const block of blocks) {
      if (block.type === "tool_use") {
        const result =
          block.name === "set_credential"
            ? await executeSetCredential(block.input)
            : { content: `Unknown tool: ${block.name}`, is_error: true };
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result.content,
          is_error: result.is_error,
        });
      }
    }
    conversation.push({ role: "user", content: toolResults });
  }

  conversation.push({
    role: "assistant",
    content: "Stopped after too many tool calls in a row — try again or split it into smaller messages.",
  });
  return conversation;
}
