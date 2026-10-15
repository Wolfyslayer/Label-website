"use client";

import { useReducedMotion } from "framer-motion";

export function useMotionSafe() {
  const reduced = useReducedMotion();
  return {
    reduced: Boolean(reduced),
    fadeUp: reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-40px" },
          transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
        },
    fade: reduced
      ? {}
      : {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          viewport: { once: true },
          transition: { duration: 0.6 },
        },
  };
}
