"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  upsertKnowledgeEntry,
  deleteKnowledgeEntry,
  type KnowledgeFormState,
} from "@/app/(admin)/admin/knowledge/actions";
import type { KnowledgeBaseEntry } from "@/lib/types";

const initialState: KnowledgeFormState = { error: null };

export function KnowledgeManager({
  entries,
  serviceId,
  compact = false,
}: {
  entries: KnowledgeBaseEntry[];
  /** Si viene, las entradas nuevas quedan ligadas a este servicio. */
  serviceId?: string;
  /** Versión reducida para usar adentro de un popup (menos aire, sin líneas de ayuda largas). */
  compact?: boolean;
}) {
  const [editing, setEditing] = useState<KnowledgeBaseEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(upsertKnowledgeEntry, initialState);

  useEffect(() => {
    if (!pending && !state.error && state !== initialState) {
      setEditing(null);
      setTitle("");
      setContent("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, pending]);

  function startEdit(entry: KnowledgeBaseEntry) {
    setEditing(entry);
    setTitle(entry.title);
    setContent(entry.content);
  }

  function cancelEdit() {
    setEditing(null);
    setTitle("");
    setContent("");
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const text = await file.text();
    setContent(text);
    if (!title) setTitle(file.name.replace(/\.(txt|md)$/i, ""));
  }

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      <div className="surface space-y-3 bg-card p-5">
        <p className="type-display text-lg leading-none">{editing ? "Editar fragmento" : "Cargar información"}</p>
        {!compact && (
          <p className="text-sm text-muted-foreground">
            Escribí acá abajo o adjuntá un archivo de texto (.txt o .md) — es lo único que el agente
            va a poder usar para responder, se guarda tal cual, sin reentrenamiento.
          </p>
        )}
        <form action={formAction} className="space-y-3">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          {serviceId && !editing && <input type="hidden" name="service_id" value={serviceId} />}
          <div>
            <Label className="mb-1 block">Título</Label>
            <Input name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label className="mb-1 block">Contenido</Label>
            <Textarea
              name="content"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="mb-1 block">O adjuntar archivo (.txt, .md)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="kicker-label block w-full text-xs text-muted-foreground file:mr-3 file:rounded-[6px] file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-foreground"
            />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {editing ? "Guardar cambios" : "Agregar"}
            </Button>
            {editing && (
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="surface bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="type-display text-base leading-none">{entry.title}</p>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{entry.content}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={() => startEdit(entry)}>
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteKnowledgeEntry(entry.id)}>
                  Borrar
                </Button>
              </div>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">Todavía no cargaste nada.</p>
        )}
      </div>
    </div>
  );
}
