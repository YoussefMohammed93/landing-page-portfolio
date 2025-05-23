"use client";

import { X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { CustomDialogContent } from "@/components/ui/custom-dialog";
import { getYouTubeVideoId } from "@/lib/youtube-utils";
import { YouTubePreconnect } from "@/components/youtube-preconnect";
import { Progress } from "@/components/ui/progress";

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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoId = getYouTubeVideoId(videoSrc);

  // Detect if browser is Safari
  const isSafari =
    typeof navigator !== "undefined" &&
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Detect if device is mobile
  const isMobile =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const isMobileSafari = isSafari && isMobile;

  // Handle cleanup when modal closes
  const handleClose = () => {
    // Clear loading progress interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Reset iframe src to stop video
    if (iframeRef.current) {
      iframeRef.current.src = "";
    }

    onClose();
  };

  // Reset loading state and start progress simulation when video changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setLoadingProgress(0);

      // Clear any existing interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      // For Safari, start with a higher initial progress to make it feel faster
      if (isSafari) {
        setLoadingProgress(isMobileSafari ? 15 : 25);
      }

      // Simulate loading progress
      progressIntervalRef.current = setInterval(
        () => {
          setLoadingProgress((prev) => {
            // Increase progress gradually, but never reach 100% until video is actually loaded
            // For Safari, use faster increments to improve perceived performance
            const baseIncrement = isSafari ? 8 : 5;
            const increment =
              Math.random() * baseIncrement + (isSafari ? 3 : 1);
            const newProgress = prev + increment;

            // Cap at 90% until video is fully loaded (95% for Safari)
            const cap = isSafari ? 95 : 90;
            return newProgress > cap ? cap : newProgress;
          });
        },
        isSafari ? 150 : 200
      ); // Faster updates for Safari
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [videoSrc, isOpen, isSafari, isMobileSafari]);

  // Build YouTube embed URL with appropriate parameters
  const getYouTubeEmbedUrl = () => {
    if (!videoId) return "";

    const params = new URLSearchParams({
      autoplay: "1",
      modestbranding: "1",
      rel: "0",
      fs: "1",
      enablejsapi: "1",
      origin: typeof window !== "undefined" ? window.location.origin : "",
    });

    // Add Safari-specific parameters
    if (isSafari) {
      params.append("playsinline", "1");

      if (isMobile) {
        params.append("controls", "1");
      }
    }

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open: boolean) => !open && handleClose()}
    >
      <DialogTitle className="sr-only">{videoTitle}</DialogTitle>
      <CustomDialogContent className="max-w-4xl p-0 bg-background/95 backdrop-blur-sm border-border overflow-hidden">
        {/* Add YouTube preconnect for faster loading */}
        <YouTubePreconnect />

        <div className="relative">
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
              <div className="w-full max-w-xs px-4 space-y-3">
                <Progress value={loadingProgress} className="h-2 w-full" />
                <p className="text-center text-sm text-muted-foreground">
                  Loading video... {Math.round(loadingProgress)}%
                </p>
              </div>
            </div>
          )}

          {/* Video player */}
          <div className="aspect-video w-full">
            {videoId ? (
              <iframe
                ref={iframeRef}
                src={getYouTubeEmbedUrl()}
                className="w-full h-full"
                title={videoTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => {
                  // Hide loading indicator after iframe loads
                  setTimeout(
                    () => {
                      setIsLoading(false);
                      setLoadingProgress(100);

                      if (progressIntervalRef.current) {
                        clearInterval(progressIntervalRef.current);
                        progressIntervalRef.current = null;
                      }
                    },
                    isSafari ? 1000 : 500
                  ); // Longer delay for Safari
                }}
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
