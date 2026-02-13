"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MdChat, MdClose, MdSend } from "react-icons/md";

type Message = {
  id?: string;
  message: string;
  role: "user" | "assistant";
  created_at?: string;
};

type ConversationCreatedResponse = {
  conversation_id: string;
  message: string; // Success message from the server
};

const initialMessages: Message[] = [
  {
    id: "f3ac1c09-d1c2-480c-8c23-883d6c656090", // Dummy ID (not from database)
    message: "👋 Hi! I’m your AI assistant.",
    role: "assistant",
  },
  {
    id: "f1b1e2bc-ee73-41a2-af47-569c99160789",
    message: "Ask me about jobs, applications, or your profile.",
    role: "assistant",
  },
];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  if (!mounted) return null;

  const handleSend = () => {
    if (!message.trim()) return;

    const userMessage = {
      user_input: message,
    };

    const chatbotAPI = new URL(
      `http://localhost:8000/chatbot/use/${conversationId}`,
    );

    setMessages((prev) => [...prev, { message, role: "user" }]);

    // Show typing animation
    setIsTyping(true);

    fetch(chatbotAPI.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userMessage),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server error: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data: { reply: string }) => {
        setMessages((prev) => [
          ...prev,
          {
            message: data.reply,
            role: "assistant",
          },
        ]);
      })
      .catch((err) => alert(`Error sending message: ${err}`))
      .finally(() => setIsTyping(false));

    setMessage("");
  };

  const handleOpen = () => {
    fetch("http://localhost:8000/chatbot/new_conv", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data: ConversationCreatedResponse) => {
        setConversationId(data.conversation_id);
        setOpen(true);
        setMessages(initialMessages); // Reset to initial messages on new conversation
      })
      .catch((err) => alert(`Error starting conversation:${err}`));
  };

  const handleClose = () => {
    setOpen(false);

    const chatbotAPI = new URL(
      `http://localhost:8000/chatbot/delete/${conversationId}`,
    );

    fetch(chatbotAPI.toString(), {
      method: "DELETE",
    })
      .then(() => {
        setConversationId(null);
      })
      .catch((err) => alert(`Error ending conversation:${err}`));
  };

  return (
    <>
      {/* Floating Button */}
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
            {/* Header */}
            <div
              className="p-4 flex items-center justify-between
              bg-linear-to-r from-red-800 via-red-600 to-red-500
              text-white"
            >
              <div>
                <h3 className="font-semibold text-sm">AI Assistant</h3>
                <p className="text-[11px] opacity-90">
                  Smart help, instant answers
                </p>
              </div>

              <button onClick={handleClose} type="button">
                <MdClose className="text-xl" />
              </button>
            </div>

            {/* Messages */}
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

              {/* Typing Indicator */}
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

            {/* Input */}
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
