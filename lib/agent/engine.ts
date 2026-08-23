import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { agentTools, executeTool, type ToolContext } from "@/lib/agent/tools";
import { buildSystemPrompt } from "@/lib/agent/prompt";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type ChatMessage = { role: "user" | "assistant"; content: string };

const MAX_TOOL_TURNS = 6; // corta si el modelo entra en un loop de tools que no converge

export async function runAgent(
  ctx: ToolContext,
  business: { name: string; description: string | null },
  messages: ChatMessage[]
): Promise<string> {
  const conversation: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system: buildSystemPrompt(business),
      tools: agentTools,
      messages: conversation,
    });

    conversation.push({ role: "assistant", content: response.content });

    if (response.stop_reason !== "tool_use") {
      return response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n");
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      const result = await executeTool(ctx, block.name, block.input as Record<string, unknown>);
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result),
      });
    }

    conversation.push({ role: "user", content: toolResults });
  }

  return "Perdón, tuve un problema para resolver tu consulta. ¿Te parece si te derivo con alguien del equipo?";
}
