"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useAnimation } from "./animation-provider";

type StaggeredChildrenProps = {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  childClassName?: string;
  animation?: "fadeIn" | "slideUp" | "slideLeft" | "slideRight" | "scale";
  duration?: number;
  staggerAmount?: number;
};

export function StaggeredChildren({
  children,
  className = "",
  staggerDelay = 0.1,
  childClassName = "",
  animation = "fadeIn",
  duration = 0.5,
  staggerAmount = 0.1,
}: StaggeredChildrenProps) {
  const { prefersReducedMotion } = useAnimation();

  if (prefersReducedMotion) {
    return (
      <div className={className}>
        {Array.isArray(children)
          ? children.map((child, index) => (
              <div key={index} className={childClassName}>
                {child}
              </div>
            ))
          : children}
      </div>
    );
  }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerAmount,
        delayChildren: staggerDelay,
      },
    },
  };

  const childVariants = {
    hidden: {
      opacity: 0,
      y: animation === "slideUp" ? 20 : 0,
      x: animation === "slideLeft" ? 20 : animation === "slideRight" ? -20 : 0,
      scale: animation === "scale" ? 0.95 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      variants={containerVariants}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <motion.div
            key={index}
            className={childClassName}
            variants={childVariants}
          >
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div className={childClassName} variants={childVariants}>
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
