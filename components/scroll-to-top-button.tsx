"use client";

import { ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAnimation } from "./animation-provider";
import { motion, AnimatePresence } from "framer-motion";

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const { prefersReducedMotion } = useAnimation();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  const buttonVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
      },
    },
    hover: {
      y: -5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={buttonVariants}
          whileTap="tap"
          whileHover="hover"
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className="size-12 rounded-full shadow-lg bg-primary/90 hover:bg-primary text-primary-foreground"
            aria-label="Scroll to top"
          >
            <ChevronUp className="size-6" />
            <span className="sr-only">Scroll to top</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
