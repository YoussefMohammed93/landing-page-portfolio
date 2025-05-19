"use client";

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

export function useMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      const onChange = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      };

      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

      mql.addEventListener("change", onChange);

      return () => mql.removeEventListener("change", onChange);
    }
  }, []);

  return isMobile;
}
