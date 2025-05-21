"use client";

import Link from "next/link";
import Image from "next/image";

import {
  Play,
  Pause,
  Volume2,
  AudioLinesIcon,
  Music,
  Waves,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { AnimatedSection } from "./animated-section";
import { motion, AnimatePresence } from "framer-motion";
import { StaggeredChildren } from "./staggered-children";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useRef, useEffect, useCallback } from "react";

export function MusicSection() {
  const [activeTrack, setActiveTrack] = useState<Id<"musicTracks"> | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const musicSectionContent = useQuery(api.music.getMusicSectionContent);
  const musicTracks = useQuery(api.music.getMusicTracks, { limit: 3 });

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

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

      setCurrentTime(newTime);

      if (wasPlaying) {
        audioRef.current.pause();
      }

      audioRef.current.currentTime = newTime;

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

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playWithRetry = () => {
          const playPromise = audioRef.current?.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error("Error playing audio:", error);

              if (error.name === "NotAllowedError") {
                setIsPlaying(false);
              } else {
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

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, activeTrack, updateProgress]);

  const togglePlay = (trackId: Id<"musicTracks">, audioUrl: string) => {
    if (activeTrack === trackId) {
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
    } else {
      setActiveTrack(trackId);
      if (audioRef.current) {
        const wasPlaying = isPlaying;

        audioRef.current.src = audioUrl;

        const handleCanPlay = () => {
          setCurrentTime(0);
          if (wasPlaying) {
            const playPromise = audioRef.current?.play();
            if (playPromise !== undefined) {
              playPromise.catch((error) => {
                console.error("Error playing new track:", error);
                setIsPlaying(false);
              });
            }
          }
          audioRef.current?.removeEventListener(
            "canplaythrough",
            handleCanPlay
          );
        };

        audioRef.current.addEventListener("canplaythrough", handleCanPlay);
        audioRef.current.load();
        setIsPlaying(true);
      }
    }
  };

  return (
    <AnimatedSection
      id="music"
      className="py-10 md:py-12 bg-gradient-to-b from-background via-background/98 to-background/95 relative overflow-hidden"
    >
      <audio
        ref={audioRef}
        className="hidden"
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onSeeking={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onSeeked={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        preload="auto"
      />
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/10 blur-3xl rounded-full"></div>
      </div>
      <div className="max-w-[1360px] mx-auto px-5 md:px-10 relative z-10">
        <div className="text-center mb-12 md:mb-16 max-w-2xl mx-auto">
          <h2 className="flex items-center justify-center gap-3 md:gap-4 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
            <div className="hidden md:flex items-center mt-2">
              <div className="w-14 lg:w-20 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-primary"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary ml-1"></div>
              <div className="w-1 h-1 rounded-full bg-primary/70 ml-1"></div>
            </div>
            <span className="text-gradient">
              {musicSectionContent?.title || "Music"}
            </span>
            <div className="hidden md:flex items-center mt-2">
              <div className="w-1 h-1 rounded-full bg-primary/70 mr-1"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary mr-1"></div>
              <div className="w-14 lg:w-20 h-[1px] bg-gradient-to-l from-transparent via-primary/40 to-primary"></div>
            </div>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            {musicSectionContent?.description ||
              "Our in-house composers create custom music and sound design that enhances your visual content and creates a memorable audio experience for your audience"}
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          {!musicTracks ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-muted/30 border border-border rounded-lg p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-8 sm:gap-5">
                    <div className="flex items-center gap-5">
                      <div className="h-10 w-10 rounded-full bg-muted/50 animate-pulse"></div>
                      <div className="h-12 w-12 rounded-full bg-muted/50 animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-5 w-32 bg-muted/50 animate-pulse rounded mb-2"></div>
                        <div className="h-4 w-24 bg-muted/50 animate-pulse rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : musicTracks.length === 0 ? (
            <div className="text-center py-10">
              <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No music tracks available</p>
            </div>
          ) : (
            <StaggeredChildren
              className="space-y-4"
              animation="slideUp"
              staggerAmount={0.1}
            >
              {musicTracks.map((track) => (
                <Card
                  key={track._id}
                  className={`transition-all bg-muted/30 ${
                    activeTrack === track._id
                      ? "border-primary"
                      : "border-border"
                  } hover:border-primary/50`}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="w-full flex items-center gap-5">
                        <Button
                          variant="outline"
                          size="icon"
                          className={`h-10 w-10 rounded-full transition-colors ${
                            activeTrack === track._id && isPlaying
                              ? "bg-primary text-primary-foreground"
                              : ""
                          }`}
                          onClick={() => togglePlay(track._id, track.audioUrl)}
                        >
                          {isPlaying && activeTrack === track._id ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>

                        <div className="h-12 w-12 relative rounded-full overflow-hidden">
                          <Image
                            src={track.coverArt || "/placeholder.svg"}
                            alt={track.title}
                            fill
                            className="object-cover"
                            unoptimized={
                              track.coverArt?.endsWith(".svg") ||
                              track.coverArt?.includes("image/svg")
                            }
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium">{track.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {track.category} • {track.duration}
                          </p>
                        </div>
                      </div>
                      <AnimatePresence>
                        {activeTrack === track._id && (
                          <motion.div
                            className="flex items-center justify-end gap-4 w-full"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "100%" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="flex flex-col w-full md:w-3/6 gap-8 md:gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(currentTime)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(duration)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Waves className="h-4 w-4 text-muted-foreground" />
                                  <Slider
                                    value={[currentTime]}
                                    max={duration || 100}
                                    step={0.1}
                                    onValueChange={handleTimeChange}
                                    onValueCommit={(value) => {
                                      if (audioRef.current) {
                                        audioRef.current.currentTime = value[0];
                                        setCurrentTime(value[0]);
                                      }
                                    }}
                                    className="w-full"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-2 w-full">
                                <Volume2 className="h-4 w-4 text-muted-foreground" />
                                <Slider
                                  value={[volume]}
                                  max={100}
                                  step={1}
                                  onValueChange={(value) => setVolume(value[0])}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </StaggeredChildren>
          )}
          {musicTracks && musicTracks.length > 0 && (
            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button asChild className="group" variant="outline" size="lg">
                <Link href="/projects/music">
                  <AudioLinesIcon className="z-10 h-4 w-4" />
                  <span className="relative z-10">View All Music Tracks</span>
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </AnimatedSection>
  );
}
