"use client";

import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { CustomDialogContent } from "@/components/ui/custom-dialog";
import {
  getYouTubeEmbedUrl,
  getYouTubeVideoId,
  getYouTubeThumbnailUrl,
  detectBrowserAndDevice,
  preloadYouTubeVideo,
} from "@/lib/youtube-utils";

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
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Browser detection
  useEffect(() => {
    const browserInfo = detectBrowserAndDevice();
    setIsSafari(browserInfo.isSafari);
    setIsMobile(browserInfo.isMobile);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Reset states when modal opens/closes and preload video
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setHasError(false);

      // Preload video for faster playback
      if (videoSrc) {
        preloadYouTubeVideo(videoSrc, {
          isSafari,
          isMobile,
          timeout: 3000,
        });
      }
    }
  }, [isOpen, videoSrc, isSafari, isMobile]);

  // Keyboard navigation
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
    // Stop any playing video
    if (iframeRef.current) {
      // Reset iframe src to stop video
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = "";
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 100);
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    onClose();
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!isMounted) return null;

  // Get optimized embed URL
  const embedUrl = getYouTubeEmbedUrl(videoSrc, {
    isSafari,
    isMobile,
    autoplay: true,
    controls: true,
    enableApi: true,
    playsinline: true,
    rel: false,
  });

  // Extract video ID for potential direct video URL
  const videoId = getYouTubeVideoId(videoSrc);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogTitle className="sr-only">{videoTitle}</DialogTitle>
      <CustomDialogContent className="max-w-4xl max-h-[90vh] overflow-auto p-0 bg-background/95 backdrop-blur-sm border-border">
        <div className="flex flex-col">
          {/* Video container */}
          <div className="relative aspect-video w-full bg-black">
            {/* Thumbnail background while loading */}
            {videoId && (
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                style={{
                  backgroundImage: `url(${getYouTubeThumbnailUrl(videoSrc, "maxresdefault")})`,
                }}
              />
            )}

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Loading video...
                  </p>
                </div>
              </div>
            )}

            {hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <div className="flex flex-col items-center gap-2 text-center p-4">
                  <Play className="size-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Unable to load video. Please try again later.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsLoading(true);
                      setHasError(false);
                      // Force reload
                      if (iframeRef.current) {
                        const src = iframeRef.current.src;
                        iframeRef.current.src = "";
                        setTimeout(() => {
                          if (iframeRef.current) {
                            iframeRef.current.src = src;
                          }
                        }, 100);
                      }
                    }}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {/* Primary iframe embed */}
            {embedUrl && (
              <iframe
                ref={iframeRef}
                src={embedUrl}
                title={videoTitle}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                // Safari-specific optimizations
                sandbox="allow-scripts allow-same-origin allow-presentation"
                referrerPolicy="strict-origin-when-cross-origin"
                style={{
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  overflow: "hidden",
                }}
              />
            )}

            {/* Fallback for Safari if iframe fails */}
            {isSafari && hasError && videoId && (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-contain"
                controls
                playsInline
                preload="metadata"
                onLoadedData={handleVideoLoad}
                onError={handleVideoError}
                poster={getYouTubeThumbnailUrl(videoSrc, "maxresdefault")}
              >
                <source
                  src={`https://www.youtube.com/watch?v=${videoId}`}
                  type="video/mp4"
                />
                <p className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  Your browser does not support the video tag.
                </p>
              </video>
            )}
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
