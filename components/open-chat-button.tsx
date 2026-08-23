"use client";

import { Button } from "@/components/ui/button";
import { OPEN_CHAT_EVENT } from "@/components/chat-widget";
import { cn } from "@/lib/utils";

export function OpenChatButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Button
      variant="secondary"
      className={cn("halo", className)}
      onClick={() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))}
    >
      {children}
    </Button>
  );
}
