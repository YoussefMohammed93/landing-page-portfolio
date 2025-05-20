"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Parse OKLCH color string to RGB
 * This is a manual conversion for browsers that don't fully support OKLCH
 */

function parseOklchToRgb(
  oklchStr: string
): { r: number; g: number; b: number } | null {
  try {
    const match = oklchStr.match(
      /oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+))?\s*\)/i
    );

    if (!match) {
      return null;
    }

    // For simplicity, we'll convert to a fallback color based on the hue
    // This is not a perfect conversion but will give us a usable color

    const l = parseFloat(match[1]); // lightness
    const c = parseFloat(match[2]); // chroma
    const h = parseFloat(match[3]); // hue

    // Map hue to RGB - simplified conversion
    // This is not accurate but gives us something to work with
    let r, g, b;

    // Simple hue to RGB mapping
    const hue = h % 360;

    if (hue < 60) {
      r = 1;
      g = hue / 60;
      b = 0;
    } else if (hue < 120) {
      r = (120 - hue) / 60;
      g = 1;
      b = 0;
    } else if (hue < 180) {
      r = 0;
      g = 1;
      b = (hue - 120) / 60;
    } else if (hue < 240) {
      r = 0;
      g = (240 - hue) / 60;
      b = 1;
    } else if (hue < 300) {
      r = (hue - 240) / 60;
      g = 0;
      b = 1;
    } else {
      r = 1;
      g = 0;
      b = (360 - hue) / 60;
    }

    // Apply lightness and chroma (simplified)
    const adjustedL = Math.min(Math.max(l, 0.1), 0.9);
    const adjustedC = Math.min(c * 2, 1);

    r = r * adjustedC * adjustedL + (1 - adjustedC) * adjustedL;
    g = g * adjustedC * adjustedL + (1 - adjustedC) * adjustedL;
    b = b * adjustedC * adjustedL + (1 - adjustedC) * adjustedL;

    return { r, g, b };
  } catch {
    return null;
  }
}

/**
 * Convert any CSS color to RGB format
 */

function cssColorToRGB(
  colorStr: string
): { r: number; g: number; b: number } | null {
  try {
    // Check if it's an OKLCH color
    if (colorStr.startsWith("oklch")) {
      // Try our manual OKLCH parser first
      const oklchResult = parseOklchToRgb(colorStr);
      if (oklchResult) {
        return oklchResult;
      }
    }

    // Fallback to browser conversion
    const tempEl = document.createElement("div");
    tempEl.style.color = colorStr;
    document.body.appendChild(tempEl);

    // Get the computed color in RGB format
    const computedColor = getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);

    // Extract RGB values from the computed color string
    const rgbMatch = computedColor.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
    );

    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1], 10) / 255,
        g: parseInt(rgbMatch[2], 10) / 255,
        b: parseInt(rgbMatch[3], 10) / 255,
      };
    }

    // If we get here, neither method worked
    // Return a default purple color similar to the primary in your theme
    return { r: 0.5, g: 0.2, b: 0.8 };
  } catch {
    // Return a default purple color
    return { r: 0.5, g: 0.2, b: 0.8 };
  }
}

/**
 * Convert RGB values to hex string
 */

function rgbToHex(r: number, g: number, b: number): string {
  // Convert from 0-1 range to 0-255 range
  const ri = Math.round(r * 255);
  const gi = Math.round(g * 255);
  const bi = Math.round(b * 255);

  return `#${ri.toString(16).padStart(2, "0")}${gi
    .toString(16)
    .padStart(2, "0")}${bi.toString(16).padStart(2, "0")}`;
}

/**
 * Custom hook to get CSS variable values from the theme
 * @param variableName The CSS variable name without the -- prefix (e.g., "primary")
 * @returns The CSS variable value as a string (converted to hex for color variables)
 */

export function useThemeColor(variableName: string): string {
  // Default to a purple color similar to the theme
  const [color, setColor] = useState<string>("#8033cc");
  const lastValueRef = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Function to get and process the color
    const updateColor = () => {
      try {
        // Get the CSS variable value
        const value = getComputedStyle(document.documentElement)
          .getPropertyValue(`--${variableName}`)
          .trim();

        if (!value) {
          return;
        }

        // Skip if the value hasn't changed
        if (value === lastValueRef.current) {
          return;
        }

        lastValueRef.current = value;

        // Convert to RGB
        const rgb = cssColorToRGB(value);

        if (rgb) {
          // Convert to hex for CSS and Three.js
          const hexColor = rgbToHex(rgb.r, rgb.g, rgb.b);

          // Only update if color has changed
          if (hexColor !== color) {
            setColor(hexColor);
          }
        } else {
          // Use default purple color
          setColor("#8033cc");
        }
      } catch {
        // Use default purple color on error
        setColor("#8033cc");
      }
    };

    // Initial color update
    updateColor();

    // Set up an interval to check for color changes
    // This is more reliable than MutationObserver for CSS variables
    const intervalId = setInterval(updateColor, 500);

    // Also use MutationObserver as a backup
    const observer = new MutationObserver(updateColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
      subtree: true, // Watch the entire document tree
      characterData: true, // Watch for text changes
    });

    return () => {
      clearInterval(intervalId);
      observer.disconnect();
    };
  }, [variableName, color]);

  return color;
}
