"use client";

import { X, ExternalLink } from "lucide-react";
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
  const [showDirectLink, setShowDirectLink] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 2;

  useEffect(() => {
    setIsMounted(true);

    // Detect Safari browser
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(
      navigator.userAgent
    );
    setIsSafari(isSafariBrowser);

    return () => {
      setIsMounted(false);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
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
      setShowDirectLink(false);
      retryCount.current = 0;

      // Set a timeout to show direct link option if loading takes too long
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      loadingTimeoutRef.current = setTimeout(() => {
        if (!iframeLoaded && isSafari) {
          setShowDirectLink(true);
        }
      }, 3000); // Show direct link after 3 seconds if still loading in Safari
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [videoSrc, iframeLoaded, isSafari]);

  // Get original YouTube URL from embed URL
  const getOriginalYouTubeUrl = (embedUrl: string): string => {
    const videoId = embedUrl.match(/embed\/([^?&]+)/)?.[1];
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : embedUrl;
  };

  // Simplified URL for Safari with minimal parameters
  const getSafariVideoSrc = (url: string): string => {
    if (url.includes("youtube.com/embed")) {
      const videoId = url.match(/embed\/([^?&]+)/)?.[1];
      return videoId
        ? `https://www.youtube.com/embed/${videoId}?playsinline=1`
        : url;
    }
    return url;
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setLoadError(false);
    retryCount.current = 0;

    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
  };

  const handleIframeError = () => {
    setLoadError(true);

    if (retryCount.current < maxRetries) {
      retryCount.current += 1;

      setTimeout(() => {
        if (iframeRef.current) {
          // For Safari, use a simplified URL
          if (isSafari) {
            iframeRef.current.src = getSafariVideoSrc(videoSrc);
          } else {
            // For other browsers, just retry with the original URL
            iframeRef.current.src = videoSrc;
          }
        }
      }, 800); // Reduced timeout for faster retry
    } else {
      // After max retries, show direct link option
      setShowDirectLink(true);
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
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                <div className="animate-pulse text-primary mb-4">
                  {loadError
                    ? `Error loading video. ${retryCount.current < maxRetries ? "Retrying..." : "Please try again later."}`
                    : "Loading video..."}
                </div>

                {showDirectLink && videoSrc.includes("youtube.com") && (
                  <a
                    href={getOriginalYouTubeUrl(videoSrc)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline mt-2 px-4 py-2 border border-primary rounded-md"
                  >
                    <ExternalLink className="size-4" />
                    Open video directly on YouTube
                  </a>
                )}
              </div>
            )}

            <iframe
              ref={iframeRef}
              src={isSafari ? getSafariVideoSrc(videoSrc) : videoSrc}
              title={videoTitle}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              loading="eager"
            ></iframe>
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
