"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { KnowledgeManager } from "@/components/knowledge-manager";
import type { KnowledgeBaseEntry } from "@/lib/types";

export function ServiceKnowledgeDialog({
  serviceId,
  serviceName,
  entries,
  trigger,
}: {
  serviceId: string;
  serviceName: string;
  entries: KnowledgeBaseEntry[];
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Info del agente · {serviceName}</DialogTitle>
        </DialogHeader>
        <p className="mb-3 text-sm text-muted-foreground">
          Lo que cargues acá es lo que el agente va a usar para responder dudas puntuales de{" "}
          <strong>{serviceName}</strong> (cuidados, contraindicaciones, qué incluye, etc.) — no
          reemplaza el precio ni la duración, que ya salen de los datos reales del servicio.
        </p>
        <KnowledgeManager entries={entries} serviceId={serviceId} compact />
      </DialogContent>
    </Dialog>
  );
}
