"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { CustomDialogContent } from "@/components/ui/custom-dialog";

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
  const [isMounted, setIsMounted] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    setIsMounted(true);

    // Detect Safari browser
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(
      navigator.userAgent
    );
    setIsSafari(isSafariBrowser);

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

  // Reset loading state when video source changes
  useEffect(() => {
    if (videoSrc) {
      setIframeLoaded(false);
      setLoadError(false);
      retryCount.current = 0;
    }
  }, [videoSrc]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  // Enhanced URL with Safari-specific parameters
  const enhancedVideoSrc = videoSrc.includes("youtube.com/embed")
    ? `${videoSrc}${videoSrc.includes("?") ? "&" : "?"}playsinline=1&rel=0&modestbranding=1&autoplay=0&enablejsapi=1${origin ? `&origin=${encodeURIComponent(origin)}` : ""}`
    : videoSrc;

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setLoadError(false);
    retryCount.current = 0;
  };

  const handleIframeError = () => {
    setLoadError(true);

    if (retryCount.current < maxRetries) {
      retryCount.current += 1;

      setTimeout(() => {
        if (iframeRef.current) {
          // For Safari, try with a clean URL first
          if (isSafari && videoSrc.includes("youtube.com/embed")) {
            const videoId = videoSrc.match(/embed\/([^?&]+)/)?.[1];
            if (videoId) {
              iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?playsinline=1&autoplay=0`;
            } else {
              iframeRef.current.src = enhancedVideoSrc;
            }
          } else {
            iframeRef.current.src = enhancedVideoSrc;
          }
        }
      }, 1000);
    }
  };

  if (!isMounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogTitle className="sr-only">{videoTitle}</DialogTitle>
      <CustomDialogContent className="max-w-min p-0 bg-background/95 backdrop-blur-sm border-border flex items-center justify-center">
        <div className="flex items-center justify-center">
          <div className="relative aspect-video w-[380px] sm:w-[500px] md:w-[800px]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 z-10 rounded-full bg-foreground hover:!bg-foreground text-black hover:!text-black/50 backdrop-blur-sm"
              onClick={onClose}
            >
              <X className="size-5" />
              <span className="sr-only">Close</span>
            </Button>
            {(!iframeLoaded || loadError) && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="animate-pulse text-primary">
                  {loadError
                    ? `Error loading video. ${retryCount.current < maxRetries ? "Retrying..." : "Please try again later."}`
                    : "Loading video..."}
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={enhancedVideoSrc}
              title={videoTitle}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              loading="eager"
              sandbox={
                isSafari
                  ? "allow-scripts allow-same-origin allow-presentation"
                  : undefined
              }
            ></iframe>
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
