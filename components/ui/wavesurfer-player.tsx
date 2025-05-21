"use client";

import WaveSurfer from "wavesurfer.js";

import { cn } from "@/lib/utils";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useThemeColor } from "@/hooks/use-theme-color";

// Extended interface for WaveSurfer with internal properties
interface WaveSurferExtended extends WaveSurfer {
  backend?: {
    ac?: {
      suspend: () => void;
      resume: () => void;
    };
  };
  getBackend?: () => string;
}

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
}: WavesurferPlayerProps) {
  const primaryColor = useThemeColor("primary");

  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurferExtended | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime || 0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);

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

          wavesurfer.on("interaction", () => {
            if (isPlaying) {
              setTimeout(() => {
                if (wavesurferRef.current) {
                  try {
                    wavesurferRef.current.play();
                  } catch (error) {
                    console.warn("Error resuming after interaction:", error);
                  }
                }
              }, 50);
            }
          });

          onReady?.(wavesurfer);

          if (autoPlay) {
            try {
              const playPromise = wavesurfer.play();
              if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch((err) => {
                  console.warn("Playback was prevented:", err);
                });
              }
              setIsPlaying(true);
            } catch (error) {
              console.warn("Error during autoplay:", error);
            }
          }
        });

        wavesurfer.on("audioprocess", () => {
          if (!isMounted) return;
          setCurrentTime(wavesurfer.getCurrentTime());
        });

        wavesurfer.on("seeking", () => {
          if (!isMounted) return;

          const newTime = wavesurfer.getCurrentTime();
          setCurrentTime(newTime);

          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          const isSafari = /^((?!chrome|android).)*safari/i.test(
            navigator.userAgent
          );

          if (isIOS || isSafari) {
            if (isPlaying) {
              setTimeout(() => {
                if (wavesurferRef.current && isMounted) {
                  try {
                    wavesurferRef.current.play();
                  } catch (error) {
                    console.warn("Error resuming after seek:", error);
                  }
                }
              }, 100);
            }
          }
        });

        wavesurfer.on("play", () => {
          if (!isMounted) return;
          setTimeout(() => {
            setIsPlaying(true);
            onPlay?.();
          }, 10);
        });

        wavesurfer.on("pause", () => {
          if (!isMounted) return;
          setTimeout(() => {
            setIsPlaying(false);
            onPause?.();
          }, 10);
        });

        wavesurfer.on("finish", () => {
          if (!isMounted) return;
          setTimeout(() => {
            setIsPlaying(false);
            onFinish?.();
          }, 10);
        });

        wavesurfer.on("interaction", () => {
          if (!isMounted) return;

          setCurrentTime(wavesurfer.getCurrentTime());

          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          const isSafari = /^((?!chrome|android).)*safari/i.test(
            navigator.userAgent
          );

          if (isIOS || isSafari) {
            if (isPlaying) {
              setTimeout(() => {
                if (wavesurferRef.current && isMounted) {
                  try {
                    wavesurferRef.current.play();
                  } catch (error) {
                    console.warn("Error resuming after interaction:", error);
                  }
                }
              }, 100);
            }
          }
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
    isPlaying,
  ]);

  const handlePlayPause = () => {
    if (!wavesurferRef.current || !isReady) return;

    if (isPlaying) {
      try {
        // Check if Safari or iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent
        );

        // Force pause for Safari/iOS
        if (isIOS || isSafari) {
          // First ensure the audio context is suspended
          if (
            wavesurferRef.current.getBackend &&
            wavesurferRef.current.getBackend() === "WebAudio" &&
            wavesurferRef.current.backend &&
            wavesurferRef.current.backend.ac
          ) {
            wavesurferRef.current.backend.ac.suspend();
          }

          // Then call pause
          wavesurferRef.current.pause();

          // Force update state immediately for Safari
          setIsPlaying(false);
        } else {
          // Normal pause for other browsers
          wavesurferRef.current.pause();
          setTimeout(() => {
            setIsPlaying(false);
          }, 10);
        }
      } catch (error) {
        console.warn("Error pausing audio:", error);
        setIsPlaying(false);
      }
    } else {
      try {
        const playPromise = wavesurferRef.current.play();

        if (playPromise && typeof playPromise.then === "function") {
          playPromise
            .then(() => {
              setTimeout(() => {
                setIsPlaying(true);
              }, 10);
            })
            .catch((error) => {
              console.warn("Error playing audio:", error);
              setIsPlaying(false);
            });
        } else {
          setTimeout(() => {
            setIsPlaying(true);
          }, 10);
        }
      } catch (error) {
        console.warn("Error playing audio:", error);
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    if (!wavesurferRef.current || !isReady) return;

    if (autoPlay && !isPlaying) {
      try {
        wavesurferRef.current.play();
      } catch (error) {
        console.warn("Error auto-playing audio:", error);
      }
    }
  }, [autoPlay, isReady, isPlaying]);

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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            // For Safari, call immediately without timeout
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const isSafari = /^((?!chrome|android).)*safari/i.test(
              navigator.userAgent
            );

            if (isIOS || isSafari) {
              handlePlayPause();
            } else {
              setTimeout(() => {
                handlePlayPause();
              }, 10);
            }
          }}
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
            onClick={() => {
              if (wavesurferRef.current && isReady) {
                // Check if Safari or iOS
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                const isSafari = /^((?!chrome|android).)*safari/i.test(
                  navigator.userAgent
                );

                if (isIOS || isSafari) {
                  // For Safari, handle click differently
                  if (isPlaying) {
                    // If playing, ensure it continues playing after interaction
                    try {
                      if (
                        wavesurferRef.current.getBackend &&
                        wavesurferRef.current.getBackend() === "WebAudio" &&
                        wavesurferRef.current.backend &&
                        wavesurferRef.current.backend.ac
                      ) {
                        // Resume audio context if needed
                        wavesurferRef.current.backend.ac.resume();
                      }
                      wavesurferRef.current.play();
                    } catch (error) {
                      console.warn(
                        "Error resuming after waveform click:",
                        error
                      );
                    }
                  }
                } else {
                  // For other browsers
                  if (isPlaying) {
                    setTimeout(() => {
                      if (wavesurferRef.current && isPlaying) {
                        try {
                          wavesurferRef.current.play();
                        } catch (error) {
                          console.warn(
                            "Error resuming after waveform click:",
                            error
                          );
                        }
                      }
                    }, 50);
                  }
                }
              }
            }}
          />
        </div>

        {/* Volume control removed */}
      </div>
    </div>
  );
}
