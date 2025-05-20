"use client";

import {
  useState,
  useEffect,
  ReactNode,
  useContext,
  createContext,
} from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type SectionTitlesContextType = {
  sectionTitles: Record<string, string>;
  refreshTitles: () => void;
};

const SectionTitlesContext = createContext<SectionTitlesContextType>({
  sectionTitles: {
    "video-editing": "Video Editing",
    "2d-animations": "2D Animations",
    "3d-animations": "3D Animations",
    music: "Music",
    contact: "Contact Us",
  },
  refreshTitles: () => {},
});

export const useSectionTitles = () => useContext(SectionTitlesContext);

export function SectionTitlesProvider({ children }: { children: ReactNode }) {
  const defaultTitles = {
    "video-editing": "Video Editing",
    "2d-animations": "2D Animations",
    "3d-animations": "3D Animations",
    music: "Music",
    contact: "Contact Us",
  };

  const [sectionTitles, setSectionTitles] =
    useState<Record<string, string>>(defaultTitles);

  const [refreshCounter, setRefreshCounter] = useState(0);

  const videoTitles = useQuery(api.video.getSectionTitles);
  const twoDAnimationsTitles = useQuery(api.twoDAnimations.getSectionTitles);
  const threeDAnimationsTitles = useQuery(
    api.threeDAnimations.getSectionTitles
  );

  useEffect(() => {
    if (videoTitles || twoDAnimationsTitles || threeDAnimationsTitles) {
      setSectionTitles((prev) => ({
        ...prev,
        ...videoTitles,
        ...twoDAnimationsTitles,
        ...threeDAnimationsTitles,
      }));
    }
  }, [
    videoTitles,
    twoDAnimationsTitles,
    threeDAnimationsTitles,
    refreshCounter,
  ]);

  const refreshTitles = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  return (
    <SectionTitlesContext.Provider value={{ sectionTitles, refreshTitles }}>
      {children}
    </SectionTitlesContext.Provider>
  );
}
