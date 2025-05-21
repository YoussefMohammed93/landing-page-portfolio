"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePathname } from "next/navigation";

const categoryConfig: Record<string, string> = {
  "video-editing": "Video Editing Projects",
  "2d-animations": "2D Animation Projects",
  "3d-animations": "3D Animation Projects",
  music: "Music Tracks",
};

export function DynamicHead() {
  const settings = useQuery(api.settings.getSettings);
  const pathname = usePathname();

  useEffect(() => {
    if (!settings) return;

    const websiteName = settings.websiteName;
    const logoUrl = settings.logoUrl;

    const linkElements = document.querySelectorAll('link[rel*="icon"]');
    linkElements.forEach((el) => {
      el.setAttribute("href", logoUrl);
    });

    let title = websiteName;

    if (pathname.startsWith("/projects/")) {
      const category = pathname.split("/").pop() || "";
      const categoryTitle = categoryConfig[category] || "Projects";
      title = `${websiteName} || ${categoryTitle}`;
    } else if (pathname.startsWith("/admin")) {
      title = `${websiteName} Admin Login`;
    }

    document.title = title;
  }, [settings, pathname]);

  return null;
}
