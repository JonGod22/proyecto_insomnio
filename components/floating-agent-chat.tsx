"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, ChevronDownIcon, MessageCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "¿Qué servicios tienen?",
  "Quiero reservar un turno",
  "¿Cuánto sale una seña?",
];

/**
 * Barra de chat siempre visible pegada abajo (como Claude/ChatGPT/Gemini),
 * no un botón flotante suelto — al escribir o abrirla manualmente, el panel
 * de respuestas se despliega arriba de la barra; se puede minimizar sin
 * perder la conversación para seguir navegando la página.
 */
export function FloatingAgentChat({ slug, businessName }: { slug: string; businessName: string }) {
  const [expanded, setExpanded] = useState(false);
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

    setExpanded(true);
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

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col items-center px-4 pb-4 sm:px-6 sm:pb-6">
      {/* Velo detrás de la barra para separarla de lo que haya justo debajo
          (fotos, texto oscuro, etc.) — un solo tono (el oscuro de la
          paleta elegida). Va en su propia capa con z-index explícito: un
          elemento absolute con z-index:auto pinta ARRIBA de sus hermanos en
          flujo normal aunque venga primero en el DOM, así que sin esto el
          velo terminaba tapando la barra en vez de quedar detrás. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 bg-gradient-to-t from-[var(--primary-dark)]/85 to-transparent sm:h-48" />

      <div className="relative z-10 flex w-full flex-col items-center gap-2">
      {expanded && (
        <div className="surface mb-2 flex h-[65vh] max-h-[28rem] w-full max-w-xl flex-col overflow-hidden rounded-[24px] bg-card">
          <div className="flex items-center justify-between p-4">
            <p className="kicker-label text-muted-foreground">Agente de {businessName}</p>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Minimizar el chat"
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronDownIcon className="size-4" />
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
                  <div className="mt-0.5 size-5 shrink-0 rounded-md bg-[var(--primary-dark)]" aria-hidden />
                  <div className="rounded-[16px] bg-muted px-3.5 py-2 text-sm">{m.content}</div>
                </div>
              )
            )}
            {loading && <p className="kicker-label text-muted-foreground">Escribiendo…</p>}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="surface flex w-full max-w-xl items-center gap-1 rounded-full bg-card p-1.5"
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Ocultar el chat" : "Abrir el chat"}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--primary-dark)] hover:bg-muted",
            expanded && "bg-muted"
          )}
        >
          <MessageCircleIcon className="size-4" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder={`Preguntale algo al agente de ${businessName}…`}
          className="h-9 min-w-0 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
        />
        <Button
          type="submit"
          size="icon"
          className="shrink-0 rounded-full bg-[var(--primary-dark)] text-white hover:bg-[var(--primary-dark)]/85"
          disabled={loading || !input.trim()}
        >
          <ArrowUpIcon className="size-4" />
        </Button>
      </form>
      </div>
    </div>
  );
}
