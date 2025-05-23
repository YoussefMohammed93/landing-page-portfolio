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
      "https://www.google.com", // For authentication
      "https://accounts.google.com", // For authentication
      "https://static.doubleclick.net", // For tracking
      "https://googleads.g.doubleclick.net", // For ads
    ];

    // Check if Safari browser
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isMobileSafari = isSafari && isMobile;

    domains.forEach((domain) => {
      // Add preconnect
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = domain;
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);

      // Add DNS prefetch as fallback
      const dnsLink = document.createElement("link");
      dnsLink.rel = "dns-prefetch";
      dnsLink.href = domain;
      document.head.appendChild(dnsLink);

      // For Safari, add preload for critical resources
      if (isSafari && domain === "https://www.youtube.com") {
        // Preload the YouTube player API
        const preloadScript = document.createElement("link");
        preloadScript.rel = "preload";
        preloadScript.href = "https://www.youtube.com/iframe_api";
        preloadScript.as = "script";
        document.head.appendChild(preloadScript);

        // For mobile Safari, preload the embed page
        if (isMobileSafari) {
          const preloadEmbed = document.createElement("link");
          preloadEmbed.rel = "preload";
          preloadEmbed.href = "https://www.youtube.com/embed";
          preloadEmbed.as = "document";
          document.head.appendChild(preloadEmbed);
        }
      }
    });

    return () => {
      // Clean up when component unmounts
      const links = document.querySelectorAll(
        'link[rel="preconnect"], link[rel="dns-prefetch"], link[rel="preload"]'
      );
      links.forEach((link) => {
        const href = link.getAttribute("href") || "";
        if (
          domains.some((domain) => href.startsWith(domain)) ||
          href === "https://www.youtube.com/iframe_api" ||
          href === "https://www.youtube.com/embed"
        ) {
          document.head.removeChild(link);
        }
      });
    };
  }, []);

  return null;
}
