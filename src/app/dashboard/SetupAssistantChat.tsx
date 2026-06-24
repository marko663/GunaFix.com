"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { ChatMessage, ContentBlock } from "@/lib/setupAssistant";

import { chatWithSetupAssistant } from "./actions";

function textOf(content: string | ContentBlock[]): string {
  if (typeof content === "string") return content;
  return content
    .filter((block): block is Extract<ContentBlock, { type: "text" }> => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

export function SetupAssistantChat() {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  function send() {
    const text = draft.trim();
    if (!text || isPending) return;
    setDraft("");
    startTransition(async () => {
      const next = await chatWithSetupAssistant(history, text);
      setHistory(next);
    });
  }

  const visible = history
    .map((message, index) => ({ message, index, text: textOf(message.content) }))
    .filter((m) => m.text.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Setup assistant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-white/60">
          Paste API keys, tokens, or config values here — Claude matches each one to the right
          credential and writes it straight to this repo&apos;s GitHub Actions secrets/variables.
          Values are never echoed back in chat.
        </p>

        <div className="space-y-3">
          {visible.length === 0 ? (
            <p className="text-sm text-white/40">
              Try: &ldquo;here&apos;s my Anthropic key: sk-ant-...&rdquo;
            </p>
          ) : (
            visible.map(({ message, index, text }) => (
              <div
                key={index}
                className={
                  message.role === "user"
                    ? "ml-auto max-w-[85%] rounded-lg bg-emerald-400/10 px-4 py-2 text-sm text-white"
                    : "max-w-[85%] rounded-lg bg-white/5 px-4 py-2 text-sm text-white/80"
                }
              >
                <pre className="whitespace-pre-wrap font-sans">{text}</pre>
              </div>
            ))
          )}
          {isPending ? <p className="text-sm text-white/40">Thinking…</p> : null}
        </div>

        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Paste a credential or ask a question…"
            className="min-h-20"
            disabled={isPending}
          />
          <Button type="button" size="sm" onClick={send} disabled={isPending || !draft.trim()}>
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
