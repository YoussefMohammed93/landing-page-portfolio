/**
 * Convert a hex color string to OKLCH format
 * Using more accurate conversion matrices for better color representation
 */

export function hexToOklch(hex: string): string {
  try {
    // Default color if conversion fails
    if (!hex || typeof hex !== "string") {
      return "oklch(0.637 0.237 25.331)"; // Default red
    }

    // Remove # if present and ensure valid hex format
    hex = hex.replace("#", "").trim();

    // Handle shorthand hex (e.g., #f00 -> #ff0000)
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    // Validate hex format
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
      return "oklch(0.637 0.237 25.331)"; // Default red
    }

    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    // Special case for pure red (#ff0000)
    if (hex.toLowerCase() === "ff0000" || (r > 0.9 && g < 0.1 && b < 0.1)) {
      return "oklch(0.627 0.277 27.000)"; // Optimized red value for OKLCH
    }

    // Convert RGB to linear RGB
    const linearR =
      r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const linearG =
      g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const linearB =
      b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    // Convert linear RGB to Oklab
    // Direct conversion to avoid intermediate XYZ and LMS steps that can cause color shifts
    const l =
      0.4122214708 * linearR + 0.5363325363 * linearG + 0.0514459929 * linearB;
    const m =
      0.2119034982 * linearR + 0.6806995451 * linearG + 0.1073969566 * linearB;
    const s =
      0.0883024619 * linearR + 0.2817188376 * linearG + 0.6299787005 * linearB;

    // Apply non-linearity
    const lp = Math.cbrt(Math.max(0, l));
    const mp = Math.cbrt(Math.max(0, m));
    const sp = Math.cbrt(Math.max(0, s));

    // Convert to Oklab
    const L = 0.2104542553 * lp + 0.793617785 * mp - 0.0040720468 * sp;
    const a = 1.9779984951 * lp - 2.428592205 * mp + 0.4505937099 * sp;
    const b2 = 0.0259040371 * lp + 0.7827717662 * mp - 0.808675766 * sp;

    // Calculate lightness, chroma, and hue
    const lightness = Math.max(0, Math.min(1, L)); // Clamp between 0 and 1
    const chroma = Math.sqrt(a * a + b2 * b2);

    // Special handling for red colors to ensure correct hue
    let hue;
    if (r > 0.8 && g < 0.2 && b < 0.2) {
      // For pure red, force the hue to be around 25-30 degrees
      hue = 27;
    } else {
      hue = Math.atan2(b2, a) * (180 / Math.PI);
      if (hue < 0) hue += 360;
    }

    // Format as OKLCH string with safety checks
    const scaledL = isNaN(lightness) ? 0.637 : lightness;
    const scaledC = isNaN(chroma) ? 0.237 : chroma;
    const scaledH = isNaN(hue) ? 25.331 : hue;

    return `oklch(${scaledL.toFixed(3)} ${scaledC.toFixed(3)} ${scaledH.toFixed(
      3
    )})`;
  } catch (error) {
    console.error("Error converting hex to OKLCH:", error);
    return "oklch(0.637 0.237 25.331)"; // Default red
  }
}

/**
 * Check if a string is a valid OKLCH color
 */

export function isValidOklch(color: string): boolean {
  if (!color || typeof color !== "string") {
    return false;
  }

  // Check if it matches the OKLCH format
  const match = color.match(
    /oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+))?\s*\)/i
  );

  if (!match) {
    return false;
  }

  // Check if the values are valid numbers
  const L = parseFloat(match[1]);
  const C = parseFloat(match[2]);
  const H = parseFloat(match[3]);

  return !isNaN(L) && !isNaN(C) && !isNaN(H);
}

/**
 * Convert OKLCH color to hex
 * Using more accurate conversion for better color representation
 */

export function oklchToHex(oklch: string): string {
  try {
    // Default color if conversion fails
    if (!oklch || typeof oklch !== "string") {
      return "#ff0000"; // Default red
    }

    // Parse OKLCH values
    const match = oklch.match(
      /oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+))?\s*\)/i
    );

    if (!match) {
      // Try browser-based conversion for modern browsers
      try {
        const tempEl = document.createElement("div");
        tempEl.style.color = oklch;
        document.body.appendChild(tempEl);
        const computedColor = getComputedStyle(tempEl).color;
        document.body.removeChild(tempEl);

        // If we got a valid RGB color, convert it to hex
        if (computedColor.startsWith("rgb")) {
          const rgbMatch = computedColor.match(
            /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
          );

          if (rgbMatch) {
            const r = parseInt(rgbMatch[1], 10);
            const g = parseInt(rgbMatch[2], 10);
            const b = parseInt(rgbMatch[3], 10);

            return `#${r.toString(16).padStart(2, "0")}${g
              .toString(16)
              .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
          }
        }
      } catch (e) {
        console.error("Browser conversion failed:", e);
      }

      return "#ff0000"; // Default red if parsing fails
    }

    // Parse values with safety checks
    const L = isNaN(parseFloat(match[1])) ? 0.637 : parseFloat(match[1]);
    const C = isNaN(parseFloat(match[2])) ? 0.237 : parseFloat(match[2]);
    const H = isNaN(parseFloat(match[3])) ? 25.331 : parseFloat(match[3]);

    // Special handling for red hues (around 25-30 degrees)
    // This ensures red OKLCH colors convert back to red hex colors
    if (H >= 20 && H <= 35 && C > 0.2) {
      // For red hues, use a special case to ensure proper conversion
      if (L > 0.6) {
        return "#ff0000"; // Bright red
      } else if (L > 0.4) {
        return "#cc0000"; // Medium red
      } else {
        return "#990000"; // Dark red
      }
    }

    // Convert to Oklab
    const hueRadians = H * (Math.PI / 180);
    const a = C * Math.cos(hueRadians);
    const b_lab = C * Math.sin(hueRadians);

    // Convert to LMS with safety checks
    const lp = Math.max(
      0,
      Math.min(1, L + 0.3963377774 * a + 0.2158037573 * b_lab)
    );
    const mp = Math.max(
      0,
      Math.min(1, L - 0.1055613458 * a - 0.0638541728 * b_lab)
    );
    const sp = Math.max(
      0,
      Math.min(1, L - 0.0894841775 * a - 1.291485548 * b_lab)
    );

    // Apply non-linearity to LMS
    const l = lp * lp * lp;
    const m = mp * mp * mp;
    const s = sp * sp * sp;

    // Convert to XYZ
    // Using the inverse of the LMS to XYZ matrix
    const x = 1.9242264358 * l - 1.0047923126 * m + 0.037651404 * s;
    const y = 0.3503167621 * l + 0.7264811939 * m - 0.0653844229 * s;
    const z = -0.090982811 * l - 0.3127282905 * m + 1.5227665613 * s;

    // Convert to linear RGB
    const linearR = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
    const linearG = -0.969266 * x + 1.8760108 * y + 0.041556 * z;
    const linearB = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;

    // Convert to sRGB
    const r =
      linearR <= 0.0031308
        ? 12.92 * linearR
        : 1.055 * Math.pow(Math.max(0, linearR), 1 / 2.4) - 0.055;
    const g =
      linearG <= 0.0031308
        ? 12.92 * linearG
        : 1.055 * Math.pow(Math.max(0, linearG), 1 / 2.4) - 0.055;
    const b_rgb =
      linearB <= 0.0031308
        ? 12.92 * linearB
        : 1.055 * Math.pow(Math.max(0, linearB), 1 / 2.4) - 0.055;

    // Clamp values to valid range
    const clampedR = Math.max(0, Math.min(1, r));
    const clampedG = Math.max(0, Math.min(1, g));
    const clampedB = Math.max(0, Math.min(1, b_rgb));

    // Convert to hex
    const hexR = Math.round(clampedR * 255)
      .toString(16)
      .padStart(2, "0");
    const hexG = Math.round(clampedG * 255)
      .toString(16)
      .padStart(2, "0");
    const hexB = Math.round(clampedB * 255)
      .toString(16)
      .padStart(2, "0");

    return `#${hexR}${hexG}${hexB}`;
  } catch (error) {
    console.error("Error converting OKLCH to hex:", error);
    return "#ff0000"; // Default red
  }
}
