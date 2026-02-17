import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createClientServer } from "@/lib/supabase/supabase";
import { createTRPCRouter, rateLimitedProcedure } from "../init";

const chatbotRouter = createTRPCRouter({
  createNewConversation: rateLimitedProcedure.query(async () => {
    const conversationId = crypto.randomUUID();

    const { error } = await (await createClientServer(1, true))
      .from("conversation_messages")
      .insert({
        conversation_id: conversationId,
        role: "assistant",
        message:
          "👋 Hi! I’m your AI assistant. Ask me about jobs, applications, or your profile.",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create conversation",
      });
    }

    return { conversationId };
  }),
  getConversationHistory: rateLimitedProcedure
    .input(
      z.object({
        conversationId: z.uuidv4(),
      }),
    )
    .query(async ({ input }) => {
      const { data, error } = await (await createClientServer(1, true))
        .from("conversation_messages")
        .select("id, role, message, created_at")
        .eq("conversation_id", input.conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching conversation history:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch conversation history",
        });
      }

      return data || [];
    }),
  sendMessage: rateLimitedProcedure
    .input(
      z.object({
        conversationId: z.uuidv4(),
        message: z.string().max(1000),
      }),
    )
    .mutation(async ({ input }) => {
      const chatbotAPI = new URL(
        `http://localhost:8000/chatbot/use/${input.conversationId}`,
      );

      const { reply } = await fetch(chatbotAPI.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_input: input.message,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Server error: ${res.statusText}`);
          }
          return res.json();
        })
        .catch((err) => {
          console.error("Error communicating with chatbot API:", err);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to communicate with chatbot API",
          });
        });

      return { reply } as { reply: string };
    }),
});

export default chatbotRouter;
