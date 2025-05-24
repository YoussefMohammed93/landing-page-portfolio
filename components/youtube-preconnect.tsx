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
      "https://www.gstatic.com", // For YouTube player assets
      "https://fonts.gstatic.com", // For fonts
      "https://fonts.googleapis.com", // For fonts
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

      // For Safari, add aggressive preload for critical resources
      if (isSafari && domain === "https://www.youtube.com") {
        // Preload the YouTube player API
        const preloadScript = document.createElement("link");
        preloadScript.rel = "preload";
        preloadScript.href = "https://www.youtube.com/iframe_api";
        preloadScript.as = "script";
        preloadScript.crossOrigin = "anonymous";
        document.head.appendChild(preloadScript);

        // Preload the YouTube player assets
        const preloadPlayer = document.createElement("link");
        preloadPlayer.rel = "preload";
        preloadPlayer.href = "https://www.youtube.com/s/player/";
        preloadPlayer.as = "fetch";
        preloadPlayer.crossOrigin = "anonymous";
        document.head.appendChild(preloadPlayer);

        // Preload YouTube CSS
        const preloadCSS = document.createElement("link");
        preloadCSS.rel = "preload";
        preloadCSS.href = "https://www.youtube.com/s/desktop/";
        preloadCSS.as = "style";
        preloadCSS.crossOrigin = "anonymous";
        document.head.appendChild(preloadCSS);

        // For Safari, always preload the embed page and additional resources
        const preloadEmbed = document.createElement("link");
        preloadEmbed.rel = "preload";
        preloadEmbed.href = "https://www.youtube.com/embed";
        preloadEmbed.as = "document";
        document.head.appendChild(preloadEmbed);

        // Add a script to load YouTube API early for Safari
        const ytScript = document.createElement("script");
        ytScript.src = "https://www.youtube.com/iframe_api";
        ytScript.async = true;
        ytScript.defer = true;
        document.head.appendChild(ytScript);

        // For mobile Safari, add additional optimizations
        if (isMobileSafari) {
          // Preload mobile-specific resources
          const preloadMobile = document.createElement("link");
          preloadMobile.rel = "preload";
          preloadMobile.href = "https://m.youtube.com/";
          preloadMobile.as = "document";
          document.head.appendChild(preloadMobile);
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
          href === "https://www.youtube.com/embed" ||
          href === "https://www.youtube.com/s/player/" ||
          href === "https://www.youtube.com/s/desktop/" ||
          href === "https://m.youtube.com/"
        ) {
          if (link.parentNode) {
            document.head.removeChild(link);
          }
        }
      });

      // Remove any YouTube API scripts we added
      const scripts = document.querySelectorAll(
        'script[src="https://www.youtube.com/iframe_api"]'
      );
      scripts.forEach((script) => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, []);

  return null;
}
