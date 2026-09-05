"use client";

import { useActionState, useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updatePlatformSettings, type PlatformSettingsFormState } from "@/app/(superadmin)/superadmin/actions";
import type { Database } from "@/lib/types";

type PlatformSettings = Database["insomnio"]["Tables"]["platform_settings"]["Row"];

const initialState: PlatformSettingsFormState = { error: null, ok: false };
const SUGGESTIONS_MAX = 6;

export function PlatformSettingsForm({ settings }: { settings: PlatformSettings }) {
  const [state, formAction, pending] = useActionState(updatePlatformSettings, initialState);
  const [creditName, setCreditName] = useState(settings.credit_name);
  const [creditGithubUrl, setCreditGithubUrl] = useState(settings.credit_github_url ?? "");
  const [creditInstagramUrl, setCreditInstagramUrl] = useState(settings.credit_instagram_url ?? "");
  const [creditWhatsappUrl, setCreditWhatsappUrl] = useState(settings.credit_whatsapp_url ?? "");
  const [chatGreeting, setChatGreeting] = useState(settings.chat_greeting);
  const [suggestions, setSuggestions] = useState(settings.chat_suggestions);
  const [newSuggestion, setNewSuggestion] = useState("");

  function addSuggestion() {
    const value = newSuggestion.trim();
    if (!value || suggestions.length >= SUGGESTIONS_MAX) return;
    setSuggestions([...suggestions, value]);
    setNewSuggestion("");
  }

  function removeSuggestion(i: number) {
    setSuggestions(suggestions.filter((_, idx) => idx !== i));
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="surface space-y-4 bg-card p-5">
        <p className="type-display text-lg leading-none">Créditos del pie de página</p>
        <p className="text-xs text-muted-foreground">
          Aparece al final de todas las landings, debajo del mapa. Hoy dice “Sitio desarrollado por
          Jonathan Godoy” con links a GitHub, Instagram y WhatsApp.
        </p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="credit_name">Nombre</Label>
            <Input
              id="credit_name"
              name="credit_name"
              value={creditName}
              onChange={(e) => setCreditName(e.target.value)}
            />
          </div>
          <div className="grid gap-3 @lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="credit_github_url">Link de GitHub</Label>
              <Input
                id="credit_github_url"
                name="credit_github_url"
                value={creditGithubUrl}
                onChange={(e) => setCreditGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="credit_instagram_url">Link de Instagram</Label>
              <Input
                id="credit_instagram_url"
                name="credit_instagram_url"
                value={creditInstagramUrl}
                onChange={(e) => setCreditInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="credit_whatsapp_url">Link de WhatsApp</Label>
              <Input
                id="credit_whatsapp_url"
                name="credit_whatsapp_url"
                value={creditWhatsappUrl}
                onChange={(e) => setCreditWhatsappUrl(e.target.value)}
                placeholder="https://wa.me/..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="surface space-y-4 bg-card p-5">
        <p className="type-display text-lg leading-none">Agente conversacional</p>
        <p className="text-xs text-muted-foreground">
          Texto de bienvenida y sugerencias que ve cualquier visitante antes de escribir el primer
          mensaje, en cualquier negocio.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="chat_greeting">Mensaje de bienvenida</Label>
          <Textarea
            id="chat_greeting"
            name="chat_greeting"
            value={chatGreeting}
            onChange={(e) => setChatGreeting(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Sugerencias rápidas (máx. {SUGGESTIONS_MAX})</Label>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <span
                key={i}
                className="surface flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs"
              >
                <input type="hidden" name="chat_suggestion" value={s} />
                {s}
                <button
                  type="button"
                  onClick={() => removeSuggestion(i)}
                  aria-label={`Quitar "${s}"`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <XIcon className="size-3" />
                </button>
              </span>
            ))}
          </div>
          {suggestions.length < SUGGESTIONS_MAX && (
            <div className="flex gap-2 pt-1">
              <Input
                value={newSuggestion}
                onChange={(e) => setNewSuggestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSuggestion();
                  }
                }}
                placeholder="Ej: ¿Tienen turnos hoy?"
              />
              <Button type="button" variant="outline" size="icon" onClick={addSuggestion} aria-label="Agregar sugerencia">
                <PlusIcon className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.ok && !state.error && <p className="text-sm text-primary">Guardado.</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Guardando…" : "Guardar plantilla base"}
      </Button>
    </form>
  );
}
