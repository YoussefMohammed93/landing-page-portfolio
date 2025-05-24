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
  getSafariUltraFastUrl,
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

      // For Safari, use lightweight DNS prefetch instead of full preload
      if (isSafari) {
        // Lightweight DNS prefetch for faster connection
        const link = document.createElement("link");
        link.rel = "dns-prefetch";
        link.href = "https://www.youtube.com";
        document.head.appendChild(link);

        // Also prefetch the thumbnail for instant display
        const img = new Image();
        img.src = getYouTubeThumbnailUrl(videoSrc, "maxresdefault");
      } else {
        // Other browsers can handle full preload
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

  // Ultra-fast Safari optimization - bypass YouTube embed entirely for Safari
  const getSafariOptimizedUrl = () => {
    if (!videoId) return "";

    if (isSafari) {
      // For Safari, use the fastest possible approach
      if (userInteracted) {
        // After user interaction, use ultra-fast Safari URL
        return getSafariUltraFastUrl(videoId, {
          autoplay: true,
          playsinline: isMobile,
        });
      } else {
        // Before user interaction, don't load iframe at all - show thumbnail only
        return "";
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

  // Safari-specific: Create direct YouTube link for instant opening
  const getDirectYouTubeUrl = () => {
    if (!videoId) return "";
    return `https://www.youtube.com/watch?v=${videoId}`;
  };

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

            {/* Safari ultra-fast loading overlay */}
            {isSafari && !userInteracted && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center gap-4 text-center p-6 max-w-sm">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                      <Play className="size-10 text-white ml-1" fill="white" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-white text-lg font-semibold">
                      {videoTitle}
                    </h3>
                    <p className="text-white/80 text-sm">
                      Choose your preferred way to watch:
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    {/* Embedded player option */}
                    <Button
                      onClick={() => {
                        setUserInteracted(true);
                        setIsLoading(true);
                        // Clear timeout since user is interacting
                        if (loadTimeoutRef.current) {
                          clearTimeout(loadTimeoutRef.current);
                          loadTimeoutRef.current = null;
                        }
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      size="lg"
                    >
                      <Play className="size-4 mr-2" />
                      Play Here (Embedded)
                    </Button>

                    {/* Direct YouTube link option */}
                    <Button
                      onClick={() => {
                        window.open(
                          getDirectYouTubeUrl(),
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }}
                      variant="outline"
                      className="w-full border-white/30 text-white hover:bg-white/10"
                      size="lg"
                    >
                      <svg
                        className="size-4 mr-2"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      Open in YouTube (Faster)
                    </Button>
                  </div>

                  <p className="text-white/60 text-xs">
                    Safari optimized • Instant loading
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
