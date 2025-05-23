"use client";

import Image from "next/image";
import WaveSurfer from "wavesurfer.js";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { CustomDialogContent } from "@/components/ui/custom-dialog";
import { WavesurferPlayer } from "@/components/ui/wavesurfer-player";

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
  const [currentPosition, setCurrentPosition] = useState(0);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (wavesurferRef.current) {
        try {
          const position = wavesurferRef.current.getCurrentTime();
          setCurrentPosition(position);
        } catch (error) {
          console.warn("Error getting current position:", error);
        }
      }
    }
  }, [isOpen]);

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

  const handleClose = () => {
    if (wavesurferRef.current) {
      try {
        wavesurferRef.current.pause();
      } catch (error) {
        console.warn("Error pausing audio on close:", error);
      }
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
            <WavesurferPlayer
              audioSrc={audioSrc}
              height={60}
              barWidth={2}
              barGap={2}
              barRadius={3}
              autoPlay={true}
              initialTime={currentPosition}
              playerId={`audio-modal-${audioTitle}`}
              onReady={(instance) => {
                if (instance) {
                  wavesurferRef.current = instance;
                }
              }}
              onPause={() => {
                if (wavesurferRef.current) {
                  try {
                    const position = wavesurferRef.current.getCurrentTime();
                    setCurrentPosition(position);
                  } catch (error) {
                    console.warn("Error storing position on pause:", error);
                  }
                }
              }}
              onFinish={() => {
                setCurrentPosition(0);
              }}
            />
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
