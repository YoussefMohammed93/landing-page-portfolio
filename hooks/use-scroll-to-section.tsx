"use client";

import { useCallback } from "react";
import { useAnimation } from "@/components/animation-provider";

/**
 * Custom hook for smooth scrolling to sections
 * Respects user's preference for reduced motion
*/

export function useScrollToSection() {
  const { prefersReducedMotion } = useAnimation();

  const scrollToSection = useCallback(
    (sectionId: string) => {
      // Remove the # if it exists
      const id = sectionId.startsWith("#") ? sectionId.substring(1) : sectionId;

      const element = document.getElementById(id);

      if (element) {
        // Get the header height to offset the scroll position
        const header = document.querySelector("header");
        const headerHeight = header ? header.offsetHeight : 0;

        // Calculate the element's position relative to the viewport
        const elementPosition = element.getBoundingClientRect().top;

        // Calculate the scroll position
        const offsetPosition =
          elementPosition + window.scrollY - headerHeight - 20; // 20px extra padding

        // Scroll to the element
        window.scrollTo({
          top: offsetPosition,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      }
    },
    [prefersReducedMotion]
  );

  return scrollToSection;
}
