"use client";

import { X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import YouTube, { YouTubeProps, YouTubePlayer } from "react-youtube";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { CustomDialogContent } from "@/components/ui/custom-dialog";
import { getYouTubeVideoId } from "@/lib/youtube-utils";
import { YouTubePreconnect } from "@/components/youtube-preconnect";

type VideoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  videoTitle: string;
};

export function VideoModal({
  isOpen,
  onClose,
  videoSrc,
  videoTitle,
}: VideoModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const videoId = getYouTubeVideoId(videoSrc);

  // Handle cleanup when modal closes
  const handleClose = () => {
    if (playerRef.current) {
      try {
        playerRef.current.pauseVideo();
      } catch (error) {
        console.error("Error pausing video:", error);
      }
    }
    onClose();
  };

  // Reset loading state when video changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [videoSrc, isOpen]);

  // YouTube player options
  const opts: YouTubeProps["opts"] = {
    height: "100%",
    width: "100%",
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      fs: 1,
      playsinline: 1, // Important for iOS Safari
      enablejsapi: 1,
      origin: typeof window !== "undefined" ? window.location.origin : "",
    },
  };

  // Detect if browser is Safari
  const isSafari =
    typeof navigator !== "undefined" &&
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Detect if device is mobile
  const isMobile =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Add additional Safari-specific options
  if (isSafari) {
    opts.playerVars.playsinline = 1; // Ensure playsinline is enabled for Safari

    // Additional settings for mobile Safari
    if (isMobile) {
      opts.playerVars.controls = 1; // Ensure controls are visible
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogTitle className="sr-only">{videoTitle}</DialogTitle>
      <CustomDialogContent className="max-w-4xl p-0 bg-background/95 backdrop-blur-sm border-border overflow-hidden">
        {/* Add YouTube preconnect for faster loading */}
        <YouTubePreconnect />

        <div className="relative">
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Video player */}
          <div className="aspect-video w-full">
            {videoId ? (
              <YouTube
                videoId={videoId}
                opts={opts}
                className="w-full h-full"
                onReady={(event) => {
                  playerRef.current = event.target;
                  // Safari sometimes needs a small delay to start playing
                  if (isSafari) {
                    setTimeout(() => {
                      try {
                        event.target.playVideo();
                      } catch (error) {
                        console.error("Error playing video:", error);
                      }
                    }, 100);
                  }
                }}
                onPlay={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Video not available</p>
              </div>
            )}
          </div>

          {/* Close button */}
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
      </CustomDialogContent>
    </Dialog>
  );
}
