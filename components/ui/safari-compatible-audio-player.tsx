"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface SafariCompatibleAudioPlayerProps {
  audioSrc: string;
  className?: string;
}

export function SafariCompatibleAudioPlayer({
  audioSrc,
  className,
}: SafariCompatibleAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const updateProgress = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleTimeChange = (value: number[]) => {
    if (audioRef.current) {
      const newTime = value[0];
      const wasPlaying = !audioRef.current.paused;

      // Store the current time before seeking
      setCurrentTime(newTime);

      // Pause before seeking to avoid Safari issues
      if (wasPlaying) {
        audioRef.current.pause();
      }

      // Set the new time
      audioRef.current.currentTime = newTime;

      // Resume playback if it was playing before
      if (wasPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error resuming playback after seeking:", error);
            setIsPlaying(false);
          });
        }
      }
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
          });
        }
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Reset player when audio source changes
  useEffect(() => {
    if (audioRef.current) {
      setCurrentTime(0);
      setIsPlaying(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [audioSrc]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        // Safari sometimes needs a small delay before playing after seeking
        const playWithRetry = () => {
          const playPromise = audioRef.current?.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error("Error playing audio:", error);

              // If we get a user interaction error, we'll need to wait for user input
              if (error.name === "NotAllowedError") {
                setIsPlaying(false);
              } else {
                // For other errors, we can try again with a small delay
                // This helps with Safari's inconsistent behavior
                setTimeout(() => {
                  if (audioRef.current && isPlaying) {
                    playWithRetry();
                  }
                }, 100);
              }
            });
          }
        };

        playWithRetry();
        animationRef.current = requestAnimationFrame(updateProgress);
      } else {
        audioRef.current.pause();
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      }
    }

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, updateProgress]);

  return (
    <div className={`w-full space-y-2 ${className || ""}`}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={`h-8 w-8 rounded-full ${
            isPlaying ? "bg-primary text-primary-foreground" : ""
          }`}
          onClick={togglePlay}
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
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleTimeChange}
            // Add onValueCommit to handle Safari's behavior when user finishes dragging
            onValueCommit={(value) => {
              if (audioRef.current) {
                audioRef.current.currentTime = value[0];
                setCurrentTime(value[0]);
              }
            }}
          />
        </div>
        <div className="flex items-center gap-1 w-20">
          <Volume2 className="h-3 w-3 text-muted-foreground" />
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={(value) => setVolume(value[0])}
          />
        </div>
      </div>
      <audio
        ref={audioRef}
        src={audioSrc}
        className="hidden"
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onSeeking={() => {
          // Safari sometimes triggers seeking event but doesn't update currentTime properly
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onSeeked={() => {
          // After seeking completes, ensure the UI is updated with the correct time
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        // This helps with Safari's issues with seeking and resuming playback
        preload="auto"
      />
    </div>
  );
}
