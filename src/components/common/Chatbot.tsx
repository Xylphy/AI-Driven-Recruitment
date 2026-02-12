"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MdChat, MdClose, MdSend } from "react-icons/md";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState("");
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

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!mounted) return null;

  const handleSend = () => {
    if (!message.trim()) return;
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full
        bg-gradient-to-br from-red-500 via-red-600 to-red-700
        shadow-xl shadow-red-500/30
        flex items-center justify-center
        text-white
        hover:scale-110 transition-transform duration-300"
        onClick={() => setOpen(true)}
        type="button"
        aria-label="Open chatbot"
      >
        <MdChat className="text-2xl" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-28 right-6 z-50 w-96 max-w-[92vw]
            rounded-2xl overflow-hidden
            backdrop-blur-xl bg-white/70
            border border-white/30
            shadow-2xl"
          >
            <div
              className="p-4 flex items-center justify-between
              bg-gradient-to-r from-red-600 to-red-700
              text-white"
            >
              <div>
                <h3 className="font-semibold text-sm tracking-wide">
                  AI Assistant
                </h3>
                <p className="text-[11px] opacity-90">
                  Smart help, instant answers
                </p>
              </div>

              <button
                aria-label="Close chatbot"
                className="hover:opacity-80 transition"
                onClick={() => setOpen(false)}
                type="button"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-sm overflow-y-auto h-72">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`max-w-[85%] rounded-xl px-4 py-2 shadow-sm ${
                    msg.sender === "user"
                      ? "ml-auto bg-gradient-to-br from-red-600 to-red-700 text-white"
                      : "bg-white/80 backdrop-blur border border-white/40"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div
              className="p-3 flex items-center gap-2
              border-t border-white/40
              bg-white/60 backdrop-blur"
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                className="flex-1 px-4 py-2 text-sm rounded-full
                bg-white/70 backdrop-blur
                border border-white/40
                focus:outline-none"
              />

              <button
                onClick={handleSend}
                className="w-10 h-10 rounded-full
                bg-gradient-to-br from-red-600 to-red-700
                text-white flex items-center justify-center
                hover:scale-105 transition"
                type="button"
              >
                <MdSend />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
