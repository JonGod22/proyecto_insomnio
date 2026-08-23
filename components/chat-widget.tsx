"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Message = { role: "user" | "assistant"; content: string };

export function ChatWidget({ slug, businessName }: { slug: string; businessName: string }) {
  const [open, setOpen] = useState(false);
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
        className="fixed bottom-6 right-6 rounded-full shadow-lg"
        size="lg"
        onClick={() => setOpen(true)}
      >
        Consultar / Reservar por chat
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 flex h-[28rem] w-80 flex-col shadow-xl">
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b py-3">
        <p className="text-sm font-medium">{businessName}</p>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cerrar
        </Button>
      </CardHeader>
      <CardContent className="flex-1 space-y-2 overflow-y-auto py-3 text-sm">
        {messages.length === 0 && (
          <p className="text-muted-foreground">
            Preguntame por precios, disponibilidad o reservá tu turno acá mismo.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-lg bg-primary px-3 py-2 text-primary-foreground"
                : "mr-auto max-w-[85%] rounded-lg bg-muted px-3 py-2"
            }
          >
            {m.content}
          </div>
        ))}
        {loading && <p className="text-muted-foreground">Escribiendo…</p>}
      </CardContent>
      <CardFooter className="gap-2 border-t py-3">
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
