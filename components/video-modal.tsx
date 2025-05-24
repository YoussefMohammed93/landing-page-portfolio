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
  const [userInteracted, setUserInteracted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Reset states when modal opens/closes with Safari-optimized loading
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setHasError(false);
      setUserInteracted(false);

      // Clear any existing timeout
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }

      // Set a timeout for Safari - if video doesn't load in 8 seconds, show error
      loadTimeoutRef.current = setTimeout(() => {
        if (isSafari) {
          setIsLoading(false);
          setHasError(true);
        }
      }, 8000);

      // For Safari, don't preload - it causes delays. Let user interaction trigger loading
      if (!isSafari && videoSrc) {
        preloadYouTubeVideo(videoSrc, {
          isSafari,
          isMobile,
          timeout: 2000,
        });
      }
    }

    // Cleanup function
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    };
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
    // Clear the timeout since video loaded successfully
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    // Clear the timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
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

  // Extract video ID for potential direct video URL
  const videoId = getYouTubeVideoId(videoSrc);

  // Safari-optimized embed URL - minimal parameters for faster loading
  const getSafariOptimizedUrl = () => {
    if (!videoId) return "";

    if (isSafari) {
      // For Safari, use absolute minimal URL to avoid loading delays
      if (isMobile) {
        // Mobile Safari needs playsinline to prevent fullscreen takeover
        return `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&autoplay=0`;
      } else {
        // Desktop Safari - minimal URL, no autoplay to avoid policy conflicts
        return `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=0`;
      }
    } else {
      // Other browsers can handle more parameters
      return getYouTubeEmbedUrl(videoSrc, {
        isSafari,
        isMobile,
        autoplay: false, // Let user click to play for better UX
        controls: true,
        enableApi: false, // Disable API for faster loading
        playsinline: true,
        rel: false,
        modestbranding: true,
        showinfo: false,
      });
    }
  };

  const embedUrl = getSafariOptimizedUrl();

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

            {/* Safari click-to-play overlay */}
            {isSafari && !userInteracted && !hasError && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer z-10"
                onClick={() => {
                  setUserInteracted(true);
                  setIsLoading(true);
                  // Force iframe reload with user interaction
                  if (iframeRef.current) {
                    const newUrl = embedUrl.replace("autoplay=0", "autoplay=1");
                    iframeRef.current.src = newUrl;
                  }
                }}
              >
                <div className="flex flex-col items-center gap-3 text-center p-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="size-8 text-white ml-1" fill="white" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-pulse" />
                  </div>
                  <p className="text-white text-sm font-medium">
                    Click to play video
                  </p>
                  <p className="text-white/70 text-xs">Optimized for Safari</p>
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
                      setUserInteracted(false);
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
                allow={
                  isSafari
                    ? "autoplay; encrypted-media; picture-in-picture"
                    : "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                }
                allowFullScreen
                loading={isSafari ? "eager" : "lazy"}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
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
