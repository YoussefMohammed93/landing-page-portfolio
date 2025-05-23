"use client";

import { useEffect } from "react";

/**
 * Component to add preconnect hints for YouTube domains
 * This helps speed up loading of YouTube videos by establishing early connections
 */
export function YouTubePreconnect() {
  useEffect(() => {
    // Add preconnect links dynamically to avoid SSR issues
    const domains = [
      "https://www.youtube.com",
      "https://www.youtube-nocookie.com",
      "https://i.ytimg.com",
      "https://s.ytimg.com",
      "https://yt3.ggpht.com",
    ];

    domains.forEach(domain => {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = domain;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);

      // Also add DNS prefetch as fallback
      const dnsLink = document.createElement("link");
      dnsLink.rel = "dns-prefetch";
      dnsLink.href = domain;
      document.head.appendChild(dnsLink);
    });

    return () => {
      // Clean up when component unmounts
      const links = document.querySelectorAll('link[rel="preconnect"], link[rel="dns-prefetch"]');
      links.forEach(link => {
        if (domains.includes(link.getAttribute("href") || "")) {
          document.head.removeChild(link);
        }
      });
    };
  }, []);

  return null;
}
