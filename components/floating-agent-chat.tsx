"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, MessageCircleIcon, XIcon } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "¿Qué servicios tienen?",
  "Quiero reservar un turno",
  "¿Cuánto sale una seña?",
];

export function FloatingAgentChat({ slug, businessName }: { slug: string; businessName: string }) {
  const [open, setOpen] = useState(false);
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

  if (!open) {
    return (
      <Button
        size="icon"
        className="halo fixed right-4 bottom-24 z-40 size-14 rounded-full sm:right-6 sm:bottom-6"
        onClick={() => setOpen(true)}
        aria-label="Hablar con el agente"
      >
        <MessageCircleIcon className="size-6" />
      </Button>
    );
  }

  return (
    <div className="surface fixed right-4 bottom-24 z-40 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col rounded-[24px] bg-card sm:right-6 sm:bottom-6 sm:h-[30rem]">
      <div className="flex items-center justify-between p-4">
        <p className="kicker-label text-muted-foreground">Agente de {businessName}</p>
        <button onClick={() => setOpen(false)} aria-label="Cerrar" className="text-muted-foreground hover:text-foreground">
          <XIcon className="size-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 pb-2">
        {messages.length === 0 && (
          <>
            <p className="mb-3 text-sm text-muted-foreground">
              Preguntame por precios, disponibilidad o pedí un turno.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="surface rounded-full bg-card px-3 py-1.5 text-xs text-foreground/80 hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] rounded-[16px] bg-primary px-3.5 py-2 text-sm text-primary-foreground">
              {m.content}
            </div>
          ) : (
            <div key={i} className="mr-auto flex max-w-[90%] items-start gap-2">
              <div className="mt-0.5 size-5 shrink-0 rounded-md bg-primary" aria-hidden />
              <div className="rounded-[16px] bg-muted px-3.5 py-2 text-sm">{m.content}</div>
            </div>
          )
        )}
        {loading && <p className="kicker-label text-muted-foreground">Escribiendo…</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribí tu consulta…"
          className="h-10 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
        />
        <Button type="submit" size="icon" className="shrink-0 rounded-full" disabled={loading || !input.trim()}>
          <ArrowUpIcon className="size-4" />
        </Button>
      </form>
    </div>
  );
}
