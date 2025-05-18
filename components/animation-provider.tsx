"use client";

import {
  useState,
  useEffect,
  useContext,
  createContext,
  type ReactNode,
} from "react";
import { AnimatePresence } from "framer-motion";

type AnimationContextType = {
  isFirstLoad: boolean;
  setIsFirstLoad: (value: boolean) => void;
  prefersReducedMotion: boolean;
};

const AnimationContext = createContext<AnimationContextType>({
  isFirstLoad: true,
  setIsFirstLoad: () => {},
  prefersReducedMotion: false,
});

export const useAnimation = () => useContext(AnimationContext);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <AnimationContext.Provider
      value={{ isFirstLoad, setIsFirstLoad, prefersReducedMotion }}
    >
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </AnimationContext.Provider>
  );
}
