"use client";

import { useEffect } from "react";
import { detectBrowserAndDevice } from "@/lib/youtube-utils";

export function YouTubePreconnect() {
  useEffect(() => {
    const browserInfo = detectBrowserAndDevice();
    
    // Only preconnect for non-Safari browsers to avoid conflicts
    if (!browserInfo.isSafari) {
      // Preconnect to YouTube domains for faster loading
      const preconnectLinks = [
        "https://www.youtube.com",
        "https://i.ytimg.com",
        "https://img.youtube.com",
      ];

      preconnectLinks.forEach((href) => {
        const link = document.createElement("link");
        link.rel = "preconnect";
        link.href = href;
        link.crossOrigin = "anonymous";
        document.head.appendChild(link);
      });

      // DNS prefetch for Safari (lighter than preconnect)
    } else {
      const prefetchLinks = [
        "https://www.youtube.com",
        "https://img.youtube.com",
      ];

      prefetchLinks.forEach((href) => {
        const link = document.createElement("link");
        link.rel = "dns-prefetch";
        link.href = href;
        document.head.appendChild(link);
      });
    }
  }, []);

  return null;
}
