"use client";

import { type ReactNode, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useAnimation } from "./animation-provider";

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  once?: boolean;
  animation?:
    | "fadeIn"
    | "slideUp"
    | "slideLeft"
    | "slideRight"
    | "scale"
    | "none";
  id?: string;
};

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
  duration = 0.5,
  once = true,
  animation = "fadeIn",
  id,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-10% 0px -10% 0px" });
  const { prefersReducedMotion } = useAnimation();

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className} id={id}>
        {children}
      </div>
    );
  }

  const variants = {
    hidden: {
      opacity: 0,
      y: animation === "slideUp" ? 50 : 0,
      x: animation === "slideLeft" ? 50 : animation === "slideRight" ? -50 : 0,
      scale: animation === "scale" ? 0.95 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      id={id}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={animation === "none" ? {} : variants}
    >
      {children}
    </motion.div>
  );
}
