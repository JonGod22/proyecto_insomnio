"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Message = { role: "user" | "assistant"; content: string };

export const OPEN_CHAT_EVENT = "insomnio:open-chat";

export function ChatWidget({ slug, businessName }: { slug: string; businessName: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(OPEN_CHAT_EVENT, handler);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, handler);
  }, []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user" as const, content: text }];
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
        variant="secondary"
        className="halo fixed right-6 bottom-6 h-12 px-5"
        size="lg"
        onClick={() => setOpen(true)}
      >
        Hablar con el agente
      </Button>
    );
  }

  return (
    <Card className="fixed right-6 bottom-6 flex h-[28rem] w-80 flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b-2 border-foreground py-3">
        <p className="kicker-label">{businessName}</p>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cerrar
        </Button>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 overflow-y-auto py-3 text-sm">
        {messages.length === 0 && (
          <p className="text-muted-foreground">
            Preguntame por precios, disponibilidad o reservá tu turno acá mismo.
          </p>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] border-2 border-foreground bg-primary px-3 py-2 text-primary-foreground">
              {m.content}
            </div>
          ) : (
            <div key={i} className="mr-auto flex max-w-[90%] items-start gap-2">
              <div className="mt-0.5 size-6 shrink-0 border-2 border-foreground bg-primary" aria-hidden />
              <div className="border-2 border-foreground bg-card px-3 py-2">{m.content}</div>
            </div>
          )
        )}
        {loading && <p className="kicker-label text-muted-foreground">Escribiendo…</p>}
      </CardContent>
      <CardFooter className="gap-2 border-t-2 border-foreground py-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Escribí tu consulta…"
        />
        <Button onClick={sendMessage} disabled={loading}>
          Enviar
        </Button>
      </CardFooter>
    </Card>
  );
}
