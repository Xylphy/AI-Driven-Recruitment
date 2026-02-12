"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MdChat, MdClose, MdSend } from "react-icons/md";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<
    { text: string; sender: "user" | "bot" }[]
  >([
    { text: "👋 Hi! I’m your AI assistant.", sender: "bot" },
    {
      text: "Ask me about jobs, applications, or your profile.",
      sender: "bot",
    },
  ]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!mounted) return null;

  const handleSend = () => {
    if (!message.trim()) return;

    const userMessage = {
      text: message,
      sender: "user" as const,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    // Show typing animation
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      const botReply = {
        text: `You asked: "${userMessage.text}". Here’s a smooth animated response.`,
        sender: "bot" as const,
      };

      setMessages((prev) => [...prev, botReply]);
    }, 1200);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full
        bg-gradient-to-br from-red-800 via-red-600 to-red-500
        shadow-xl shadow-red-600/30
        flex items-center justify-center
        text-white
        hover:scale-110 transition-transform duration-300"
        onClick={() => setOpen(true)}
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
              bg-gradient-to-r from-red-800 via-red-600 to-red-500
              text-white"
            >
              <div>
                <h3 className="font-semibold text-sm">AI Assistant</h3>
                <p className="text-[11px] opacity-90">
                  Smart help, instant answers
                </p>
              </div>

              <button onClick={() => setOpen(false)} type="button">
                <MdClose className="text-xl" />
              </button>
            </div>

            {/* Messages */}
            <div className="p-4 space-y-3 text-sm overflow-y-auto h-72 bg-red-50/40">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`max-w-[85%] rounded-xl px-4 py-2 shadow-md ${
                      msg.sender === "user"
                        ? "ml-auto bg-gradient-to-br from-red-800 via-red-600 to-red-500 text-white"
                        : "bg-white border border-red-100"
                    }`}
                  >
                    {msg.text}
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
                bg-gradient-to-br from-red-800 via-red-600 to-red-500
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
