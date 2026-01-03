"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdChat, MdClose, MdSend } from "react-icons/md";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open chatbot"
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full
          bg-gradient-to-br from-red-500 via-red-600 to-red-700
          shadow-xl shadow-red-500/30
          flex items-center justify-center
          text-white
          hover:scale-110 transition-transform duration-300"
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
            className="fixed bottom-28 right-6 z-50 w-[360px] max-w-[92vw]
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
                onClick={() => setOpen(false)}
                aria-label="Close chatbot"
                className="hover:opacity-80 transition"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-sm overflow-y-auto h-72">
              <div
                className="max-w-[85%] rounded-xl px-4 py-2
                bg-white/80 backdrop-blur border border-white/40 shadow-sm"
              >
                👋 Hi! I’m your AI assistant.
              </div>

              <div
                className="max-w-[85%] rounded-xl px-4 py-2
                bg-white/80 backdrop-blur border border-white/40 shadow-sm"
              >
                Ask me about jobs, applications, or your profile.
              </div>

              <div
                className="max-w-[85%] ml-auto rounded-xl px-4 py-2
                bg-gradient-to-br from-red-600 to-red-700
                text-white shadow-md"
              >
                (User message placeholder)
              </div>
            </div>

            <div
              className="p-3 flex items-center gap-2
                border-t border-white/40
                bg-white/60 backdrop-blur"
            >
              <input
                type="text"
                placeholder="Type your message..."
                disabled
                className="flex-1 px-4 py-2 text-sm rounded-full
                  bg-white/70 backdrop-blur
                  border border-white/40
                  focus:outline-none
                  cursor-not-allowed"
              />

              <button
                disabled
                className="w-10 h-10 rounded-full
                  bg-gradient-to-br from-gray-300 to-gray-400
                  text-white flex items-center justify-center
                  cursor-not-allowed"
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
