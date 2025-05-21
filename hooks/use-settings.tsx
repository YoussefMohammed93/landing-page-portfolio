"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isValidOklch } from "@/lib/color-utils";

/**
 * Hook to apply settings from the database to the website
 * - Applies primary color to CSS variables
 * - Returns settings data for use in components
 */

export function useSettings() {
  const settings = useQuery(api.settings.getSettings);

  // Apply primary color to CSS variables when settings change
  useEffect(() => {
    if (settings?.primaryColor) {
      try {
        // Validate the OKLCH color before applying it
        if (isValidOklch(settings.primaryColor)) {
          document.documentElement.style.setProperty(
            "--primary",
            settings.primaryColor
          );

          // Also update the ring color which is based on primary
          document.documentElement.style.setProperty(
            "--ring",
            settings.primaryColor
          );
        } else {
          console.error("Invalid OKLCH color format:", settings.primaryColor);
          // Use default color if invalid
          document.documentElement.style.setProperty(
            "--primary",
            "oklch(0.637 0.237 25.331)"
          );
          document.documentElement.style.setProperty(
            "--ring",
            "oklch(0.637 0.237 25.331)"
          );
        }
      } catch (error) {
        console.error("Error applying primary color:", error);
        // Use default color on error
        document.documentElement.style.setProperty(
          "--primary",
          "oklch(0.637 0.237 25.331)"
        );
        document.documentElement.style.setProperty(
          "--ring",
          "oklch(0.637 0.237 25.331)"
        );
      }
    }
  }, [settings?.primaryColor]);

  return {
    settings,
    isLoading: settings === undefined,
  };
}

/**
 * Hook to check if a section should be visible based on settings
 */

export function useSectionVisibility() {
  const { settings, isLoading } = useSettings();

  const isSectionVisible = (sectionId: string): boolean => {
    if (isLoading || !settings) return true; // Default to visible while loading

    const { sectionVisibility } = settings;

    switch (sectionId) {
      case "video-editing":
        return sectionVisibility.videoEditing;
      case "2d-animations":
        return sectionVisibility.twoDAnimations;
      case "3d-animations":
        return sectionVisibility.threeDAnimations;
      case "music":
        return sectionVisibility.music;
      default:
        return true; // Other sections are always visible
    }
  };

  return {
    isSectionVisible,
    isLoading,
  };
}
