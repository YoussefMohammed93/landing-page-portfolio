"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type AudioPlayerContextType = {
  currentPlayingId: string | null;
  setCurrentPlayingId: (id: string | null) => void;
  pauseAllExcept: (id: string) => void;
};

const AudioPlayerContext = createContext<AudioPlayerContextType>({
  currentPlayingId: null,
  setCurrentPlayingId: () => {},
  pauseAllExcept: () => {},
});

export const useAudioPlayer = () => useContext(AudioPlayerContext);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  const pauseAllExcept = useCallback((id: string) => {
    // If there's a different audio already playing, we'll set the current ID
    // which will trigger other players to pause
    if (currentPlayingId !== id) {
      setCurrentPlayingId(id);
    }
  }, [currentPlayingId]);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentPlayingId,
        setCurrentPlayingId,
        pauseAllExcept,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}
