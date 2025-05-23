"use client";

import { X, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { CustomDialogContent } from "@/components/ui/custom-dialog";
import { getYouTubeEmbedUrl, getYouTubeVideoId } from "@/lib/youtube-utils";
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [useFallbackPlayer, setUseFallbackPlayer] = useState(false);

  // Handle browser detection for Safari-specific optimizations
  const [browserInfo, setBrowserInfo] = useState({
    isSafari: false,
    isMobile: false,
    isMobileSafari: false,
  });

  // Simulate loading progress to provide visual feedback
  const startLoadingProgressSimulation = () => {
    setLoadingProgress(0);

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        // Cap progress at 90% until actual loading completes
        const newProgress = prev + (90 - prev) * 0.1;
        return newProgress > 90 ? 90 : newProgress;
      });
    }, 300);

    // Clear interval after 10 seconds max
    setTimeout(() => {
      clearInterval(interval);
      setLoadingProgress(95);
    }, 10000);

    return interval;
  };

  // Preload YouTube resources for faster loading
  const preloadYouTubeResources = () => {
    const videoId = getYouTubeVideoId(videoSrc);
    if (!videoId) return;

    // Create a hidden preload iframe
    const preloadIframe = document.createElement("iframe");
    preloadIframe.style.display = "none";
    preloadIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=0`;
    preloadIframe.setAttribute("data-preload", "true");

    // Remove the preload iframe after it loads or after 3 seconds
    const removePreloadIframe = () => {
      const existingIframe = document.querySelector(
        'iframe[data-preload="true"]'
      );
      if (existingIframe && existingIframe.parentNode) {
        existingIframe.parentNode.removeChild(existingIframe);
      }
    };

    preloadIframe.onload = removePreloadIframe;
    setTimeout(removePreloadIframe, 3000);

    // Add the preload iframe to the DOM
    document.body.appendChild(preloadIframe);
  };

  // Preload YouTube resources when the component mounts
  useEffect(() => {
    if (isOpen) {
      // Detect browser type on client side
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent
      );
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isMobileSafari = isSafari && isMobile;

      setBrowserInfo({
        isSafari,
        isMobile,
        isMobileSafari,
      });

      // Start loading progress simulation
      const interval = startLoadingProgressSimulation();

      // For Safari browsers, preload YouTube resources
      if (isSafari) {
        preloadYouTubeResources();
      }

      // Set a timeout to switch to fallback player if loading takes too long in Safari
      if (isSafari) {
        const timeout = setTimeout(() => {
          if (isLoading) {
            setUseFallbackPlayer(true);
          }
        }, 5000); // 5 seconds timeout for Safari

        setLoadingTimeout(timeout);
      }

      return () => {
        clearInterval(interval);
      };
    }

    return () => {
      // Clear any timeouts when component unmounts
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, videoSrc, isLoading]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoading(false);
    setLoadingProgress(100);

    // Clear any loading timeouts
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }
  };

  // Clean up when modal closes
  const handleClose = () => {
    // Stop video playback when closing the modal
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        // This attempts to post a message to the iframe to pause the video
        iframeRef.current.contentWindow.postMessage(
          '{"event":"command","func":"pauseVideo","args":""}',
          "*"
        );
      } catch (e) {
        console.error("Failed to pause video:", e);
      }
    }

    // Reset states
    setIsLoading(true);
    setLoadingProgress(0);
    setUseFallbackPlayer(false);

    // Clear any timeouts
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }

    onClose();
  };

  // Get optimized video source URL with proper parameters
  const getOptimizedVideoSrc = () => {
    return getYouTubeEmbedUrl(videoSrc, {
      isSafari: browserInfo.isSafari,
      isMobile: browserInfo.isMobile,
      autoplay: true,
      controls: true,
      enableApi: true,
      playsinline: true,
      rel: false,
    });
  };

  // Handle direct YouTube navigation for Safari fallback
  const handleOpenYouTube = () => {
    const videoId = getYouTubeVideoId(videoSrc);
    if (videoId) {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
    }
    handleClose();
  };

  return (
    <>
      {/* Add YouTube preconnect for faster loading */}
      <YouTubePreconnect />

      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogTitle className="sr-only">{videoTitle}</DialogTitle>
        <CustomDialogContent className="max-w-4xl p-0 bg-background/95 backdrop-blur-sm border-border overflow-hidden">
          <div className="flex flex-col">
            <div className="relative w-full pt-[56.25%]">
              {" "}
              {/* 16:9 aspect ratio */}
              {isLoading && !useFallbackPlayer && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/30">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <div className="w-full max-w-xs bg-muted/50 rounded-full h-2 mb-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {browserInfo.isSafari
                      ? "Loading YouTube video (Safari)"
                      : "Loading video..."}
                  </p>
                </div>
              )}
              {useFallbackPlayer && browserInfo.isSafari ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80">
                  <div className="text-center p-6 max-w-md">
                    <h3 className="text-xl font-semibold mb-4">{videoTitle}</h3>
                    <p className="mb-6 text-muted-foreground">
                      Safari is taking longer than expected to load this video.
                      You can continue waiting or open directly on YouTube.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={handleOpenYouTube}
                        className="flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Open on YouTube
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setUseFallbackPlayer(false)}
                      >
                        Continue Waiting
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  src={getOptimizedVideoSrc()}
                  title={videoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                  onLoad={handleIframeLoad}
                />
              )}
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
            <div className="p-4">
              <h3 className="text-xl font-semibold">{videoTitle}</h3>
            </div>
          </div>
        </CustomDialogContent>
      </Dialog>
    </>
  );
}
