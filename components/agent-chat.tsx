"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "¿Qué servicios tienen?",
  "Quiero reservar un turno",
  "¿Cuánto sale una seña?",
];

export function AgentChat({ slug, businessName }: { slug: string; businessName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, messages: next }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply ?? "No pude responder, probá de nuevo." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Hubo un error de conexión. Probá de nuevo en un momento." }]);
    } finally {
      setLoading(false);
    }
  }

  const started = messages.length > 0;

  return (
    <div id="agente" className="mx-auto w-full max-w-2xl scroll-mt-24">
      {!started && (
        <div className="mb-6 text-center">
          <p className="kicker-label mb-3 text-muted-foreground">Agente de {businessName}</p>
          <h1 className="type-display text-3xl leading-[0.95] sm:text-5xl">
            ¿En qué te puedo ayudar hoy?
          </h1>
        </div>
      )}

      <div className="surface rounded-[28px] bg-card">
        {started && (
          <div ref={scrollRef} className="max-h-[26rem] space-y-4 overflow-y-auto p-5 sm:p-6">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="ml-auto max-w-[85%] rounded-[18px] bg-primary px-4 py-2.5 text-primary-foreground">
                  {m.content}
                </div>
              ) : (
                <div key={i} className="mr-auto flex max-w-[90%] items-start gap-2.5">
                  <div className="mt-0.5 size-6 shrink-0 rounded-md bg-primary" aria-hidden />
                  <div className="rounded-[18px] bg-muted px-4 py-2.5">{m.content}</div>
                </div>
              )
            )}
            {loading && <p className="kicker-label text-muted-foreground">Escribiendo…</p>}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className={`flex items-center gap-2 p-3 ${started ? "border-t border-border" : ""}`}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Preguntale al agente o pedí un turno…"
            className="h-11 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-muted-foreground"
          />
          <Button type="submit" size="icon" className="halo shrink-0 rounded-full" disabled={loading || !input.trim()}>
            <ArrowUpIcon className="size-4" />
          </Button>
        </form>
      </div>

      {!started && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="surface rounded-full bg-card px-4 py-2 text-sm text-foreground/80 transition-colors hover:bg-muted"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
