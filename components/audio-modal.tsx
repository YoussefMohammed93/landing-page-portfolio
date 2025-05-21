"use client";

import Image from "next/image";

import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { X, Play, Pause, Volume2 } from "lucide-react";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { CustomDialogContent } from "@/components/ui/custom-dialog";

type AudioModalProps = {
  isOpen: boolean;
  onClose: () => void;
  audioSrc: string;
  audioTitle: string;
  coverArt: string;
  category: string;
  duration: string;
};

export function AudioModal({
  isOpen,
  onClose,
  audioSrc,
  audioTitle,
  coverArt,
  category,
  duration,
}: AudioModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration2, setDuration2] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (isOpen && audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);

      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
          setIsPlaying(false);
        });
        animationRef.current = requestAnimationFrame(updateProgress);
      } else {
        audioRef.current.pause();
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      }
    }
  }, [isPlaying]);

  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration2(audioRef.current.duration || 0);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleClose = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    onClose();
  };

  if (!isMounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogTitle className="sr-only">{audioTitle}</DialogTitle>
      <CustomDialogContent className="max-w-md max-h-[80vh] sm:max-h-[85vh] overflow-auto p-0 bg-background/95 backdrop-blur-sm border-border">
        <div className="flex flex-col">
          <div className="relative aspect-square w-full bg-muted/30">
            <Image
              src={coverArt || "/placeholder.svg"}
              alt={audioTitle}
              fill
              className="object-cover"
              unoptimized={
                coverArt?.endsWith(".svg") || coverArt?.includes("image/svg")
              }
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 z-10 rounded-full bg-foreground hover:!bg-foreground text-black hover:!text-black/50 backdrop-blur-sm"
              onClick={handleClose}
            >
              <X className="size-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{audioTitle}</h3>
              <p className="text-muted-foreground">
                {category} • {duration}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatTime(currentTime)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTime(duration2)}
                </span>
              </div>
              <Slider
                value={[currentTime]}
                max={duration2 || 100}
                step={0.1}
                onValueChange={handleTimeChange}
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                className={`h-12 w-12 rounded-full transition-colors ${
                  isPlaying ? "bg-primary text-primary-foreground" : ""
                }`}
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              <div className="flex items-center gap-2 w-48">
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
          </div>
        </div>
        <audio
          ref={audioRef}
          src={audioSrc}
          onEnded={() => setIsPlaying(false)}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration2(audioRef.current.duration);
            }
          }}
          className="hidden"
        />
      </CustomDialogContent>
    </Dialog>
  );
}
