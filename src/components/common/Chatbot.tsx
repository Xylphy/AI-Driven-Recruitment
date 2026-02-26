"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MdAdd, MdChat, MdClose, MdSend } from "react-icons/md";
import { trpc } from "@/lib/trpc/client";

type Message = {
  id?: string;
  message: string;
  role: "user" | "assistant";
  created_at?: string;
};

const initialMessages: Message[] = [];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const createNewConversation = trpc.chatbot.createNewConversation.useQuery(
    undefined,
    {
      enabled: false,
    },
  );

  const getConversationHistory = trpc.chatbot.getConversationHistory.useQuery(
    // biome-ignore lint/style/noNonNullAssertion: conversationId is guaranteed to be non-null due to the enabled condition
    { conversationId: conversationId! },
    {
      enabled: !!conversationId,
    },
  );

  const sendMessage = trpc.chatbot.sendMessage.useMutation();

  useEffect(() => {
    setConversationId(window.sessionStorage.getItem("conversationId") || null);
    setMounted(true);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (getConversationHistory.data) {
      setMessages(getConversationHistory.data);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [getConversationHistory.data]);

  if (!mounted) return null;

  const handleSend = () => {
    if (!message.trim() || !conversationId) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      { message, role: "user", id: prev.length.toString() },
    ]);

    sendMessage.mutate(
      {
        // biome-ignore lint/style/noNonNullAssertion: conversationId is guaranteed to be non-null due early return condition
        conversationId: conversationId!,
        message: message,
      },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            {
              message: data.reply,
              role: "assistant",
              id: prev.length.toString(),
            },
          ]);
        },
      },
    );

    // Show typing animation
    setIsTyping(true);

    setMessage("");
  };

  const handleNewChat = () => {
    setMessages(initialMessages);
    window.sessionStorage.removeItem("conversationId");

    createNewConversation.refetch().then((res) => {
      if (res.data?.conversationId) {
        setConversationId(res.data.conversationId);
        getConversationHistory.refetch();
        window.sessionStorage.setItem(
          "conversationId",
          res.data.conversationId,
        );
      }
    });
  };

  const handleOpen = async () => {
    if (!conversationId) {
      await createNewConversation.refetch().then((res) => {
        if (res.data?.conversationId) {
          setConversationId(res.data.conversationId);
          setOpen(true);
        }
      });
    } else {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <button
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full
        bg-linear-to-br from-red-800 via-red-600 to-red-500
        shadow-xl shadow-red-600/30
        flex items-center justify-center
        text-white
        hover:scale-110 transition-transform duration-300"
        onClick={handleOpen}
        type="button"
      >
        <MdChat className="text-2xl" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-28 right-6 z-50 w-96 max-w-[92vw]
            rounded-2xl overflow-hidden
            backdrop-blur-xl bg-white/90
            border border-red-100
            shadow-2xl"
          >
            <div className="p-4 flex items-center justify-between bg-linear-to-r from-red-800 via-red-600 to-red-500 text-white">
              <div>
                <h3 className="font-semibold text-sm tracking-wide">
                  AI Assistant
                </h3>
                <p className="text-[11px] opacity-90">
                  Smart help, instant answers
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full transition-all duration-200"
                  onClick={handleNewChat}
                >
                  <MdAdd className="text-sm" />
                  New Chat
                </button>

                <button
                  onClick={handleClose}
                  type="button"
                  className="hover:opacity-80 transition"
                >
                  <MdClose className="text-xl" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3 text-sm overflow-y-auto h-72 bg-red-50/40">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`max-w-[85%] rounded-xl px-4 py-2 shadow-md ${
                      msg.role === "user"
                        ? "ml-auto bg-linear-to-br from-red-800 via-red-600 to-red-500 text-white"
                        : "bg-white border border-red-100"
                    }`}
                  >
                    {msg.message}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="max-w-[85%] rounded-xl px-4 py-2 bg-white border border-red-100"
                >
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce delay-150" />
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce delay-300" />
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="p-3 flex items-center gap-2 border-t border-red-100 bg-white">
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                className="flex-1 px-4 py-2 text-sm rounded-full
                bg-red-50 border border-red-200
                focus:outline-none focus:ring-2 focus:ring-red-400"
              />

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                className="w-10 h-10 rounded-full
                bg-linear-to-br from-red-800 via-red-600 to-red-500
                text-white flex items-center justify-center
                shadow-md"
                type="button"
              >
                <MdSend />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
