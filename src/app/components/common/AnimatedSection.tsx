"use client";
import { useRef, useEffect } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

type Props = {
  children: React.ReactNode;
  className?: string;
  start?: boolean;
  onComplete?: () => void;
};

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      when: "beforeChildren",
      staggerChildren: 0.2, // <-- This enables staggering
    },
  },
};

export default function AnimatedSection({
  children,
  className,
  start = false,
  onComplete,
}: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const controls = useAnimation();

  useEffect(() => {
    if (inView && start) {
      controls.start("visible").then(() => {
        if (onComplete) onComplete(); // callback to parent
      });
    }
  }, [inView, start, controls, onComplete]);

  return (
    <motion.section
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={container}
    >
      {children}
    </motion.section>
  );
}
