/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import WaveSurfer from "wavesurfer.js";

import { cn } from "@/lib/utils";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useCallback } from "react";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAudioPlayer } from "@/components/audio-player-context";

interface WavesurferPlayerProps {
  audioSrc: string;
  className?: string;
  waveColor?: string;
  progressColor?: string;
  height?: number;
  barWidth?: number;
  barGap?: number;
  barRadius?: number;
  autoPlay?: boolean;
  initialTime?: number;
  onReady?: (instance?: WaveSurfer) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onFinish?: () => void;
  playerId?: string; // Unique ID for this player
}

export function WavesurferPlayer({
  audioSrc,
  className,
  waveColor,
  progressColor,
  height = 40,
  barWidth = 2,
  barGap = 2,
  barRadius = 3,
  autoPlay = false,
  initialTime = 0,
  onReady,
  onPlay,
  onPause,
  onFinish,
  playerId,
}: WavesurferPlayerProps) {
  const primaryColor = useThemeColor("primary");
  const { currentPlayingId, pauseAllExcept } = useAudioPlayer();

  // Generate a unique ID if none is provided
  const uniquePlayerId = useRef(
    playerId || `player-${Math.random().toString(36).substring(2, 9)}`
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime || 0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const audioProcessIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use a ref to track the current playing state to avoid closure issues
  const isPlayingRef = useRef(isPlaying);

  // Update the ref whenever the state changes
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Listen for changes in the current playing ID and pause this player if needed
  useEffect(() => {
    if (
      currentPlayingId &&
      currentPlayingId !== uniquePlayerId.current &&
      isPlayingRef.current &&
      wavesurferRef.current
    ) {
      try {
        wavesurferRef.current.pause();
        setIsPlaying(false);
        stopAudioProcessTracking();
      } catch (error) {
        console.warn("Error pausing audio:", error);
      }
    }
  }, [currentPlayingId]);

  const startAudioProcessTracking = useCallback(() => {
    if (audioProcessIntervalRef.current) {
      clearInterval(audioProcessIntervalRef.current);
    }

    audioProcessIntervalRef.current = setInterval(() => {
      if (wavesurferRef.current && isPlayingRef.current) {
        try {
          const currentTime = wavesurferRef.current.getCurrentTime();
          setCurrentTime(currentTime);
        } catch (error) {
          console.warn("Error getting current time:", error);
        }
      }
    }, 100); // Update every 100ms for smoother progress
  }, []);

  const stopAudioProcessTracking = useCallback(() => {
    if (audioProcessIntervalRef.current) {
      clearInterval(audioProcessIntervalRef.current);
      audioProcessIntervalRef.current = null;
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!wavesurferRef.current || !isReady) return;

    if (isPlayingRef.current) {
      try {
        wavesurferRef.current.pause();
        setIsPlaying(false);
        stopAudioProcessTracking();
      } catch (error) {
        console.warn("Error pausing audio:", error);
        setIsPlaying(false);
        stopAudioProcessTracking();
      }
    } else {
      try {
        // Notify the context that this player is starting playback
        pauseAllExcept(uniquePlayerId.current);

        wavesurferRef.current.play();
        setIsPlaying(true);
        startAudioProcessTracking();
      } catch (error) {
        console.warn("Error playing audio:", error);
        setIsPlaying(false);
      }
    }
  }, [
    isReady,
    startAudioProcessTracking,
    stopAudioProcessTracking,
    pauseAllExcept,
  ]);

  useEffect(() => {
    let isMounted = true;

    const initializeWavesurfer = async () => {
      if (!containerRef.current || !isMounted) return;

      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }

      try {
        const wavesurfer = WaveSurfer.create({
          container: containerRef.current,
          waveColor: waveColor || "rgba(255, 255, 255, 0.3)",
          progressColor:
            progressColor || primaryColor || "rgba(255, 255, 255, 0.8)",
          height: height,
          barWidth: barWidth,
          barGap: barGap,
          barRadius: barRadius,
          cursorWidth: 0,
          normalize: true,
          backend: "WebAudio",
          hideScrollbar: true,
          interact: true,
        });

        if (!isMounted) {
          wavesurfer.destroy();
          return;
        }

        wavesurfer.on("ready", () => {
          if (!isMounted) return;
          setIsReady(true);
          setDuration(wavesurfer.getDuration());

          wavesurfer.setVolume(1.0);

          if (initialTime > 0) {
            try {
              const seekPosition = initialTime / wavesurfer.getDuration();
              const normalizedPosition = Math.min(Math.max(seekPosition, 0), 1);
              wavesurfer.seekTo(normalizedPosition);
              setCurrentTime(initialTime);
            } catch (error) {
              console.warn("Error seeking to initial position:", error);
            }
          }

          onReady?.(wavesurfer);

          if (autoPlay) {
            try {
              // Notify the context that this player is starting playback
              pauseAllExcept(uniquePlayerId.current);
              wavesurfer.play();
              setIsPlaying(true);
              isPlayingRef.current = true;
              startAudioProcessTracking();
            } catch (error) {
              console.warn("Error during autoplay:", error);
            }
          }
        });

        wavesurfer.on("play", () => {
          if (!isMounted) return;
          setIsPlaying(true);
          isPlayingRef.current = true;
          // Notify the context that this player is starting playback
          pauseAllExcept(uniquePlayerId.current);
          startAudioProcessTracking();
          onPlay?.();
        });

        wavesurfer.on("pause", () => {
          if (!isMounted) return;
          setIsPlaying(false);
          isPlayingRef.current = false;
          stopAudioProcessTracking();
          onPause?.();
        });

        wavesurfer.on("finish", () => {
          if (!isMounted) return;
          setIsPlaying(false);
          isPlayingRef.current = false;
          stopAudioProcessTracking();
          setCurrentTime(wavesurfer.getDuration());
          onFinish?.();
        });

        wavesurfer.on("seeking", () => {
          if (!isMounted) return;
          const newTime = wavesurfer.getCurrentTime();
          setCurrentTime(newTime);
        });

        wavesurfer.on("error", (err) => {
          console.error("WaveSurfer error:", err);
          if (!isMounted) return;
          setIsReady(false);
        });

        if (isMounted) {
          wavesurferRef.current = wavesurfer;

          try {
            wavesurfer.load(audioSrc);
          } catch (error) {
            console.error("Error loading audio:", error);
          }
        } else {
          wavesurfer.destroy();
        }
      } catch (error) {
        console.error("Error initializing WaveSurfer:", error);
      }
    };

    const initTimeout = setTimeout(() => {
      initializeWavesurfer();
    }, 50);

    return () => {
      isMounted = false;
      clearTimeout(initTimeout);
      stopAudioProcessTracking();

      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.destroy();
        } catch (error) {
          console.warn("Error during cleanup:", error);
        }
        wavesurferRef.current = null;
      }
    };
  }, [
    audioSrc,
    waveColor,
    progressColor,
    primaryColor,
    height,
    barWidth,
    barGap,
    barRadius,
    autoPlay,
    initialTime,
    onReady,
    onPlay,
    onPause,
    onFinish,
    startAudioProcessTracking,
    stopAudioProcessTracking,
  ]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={`h-8 w-8 rounded-full ${
            isPlaying ? "bg-primary text-primary-foreground" : ""
          }`}
          onClick={handlePlayPause}
          disabled={!isReady}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div
            ref={containerRef}
            className="w-full cursor-pointer"
            style={{ height: `${height}px` }}
          />
        </div>

        {/* Volume control removed */}
      </div>
    </div>
  );
}
