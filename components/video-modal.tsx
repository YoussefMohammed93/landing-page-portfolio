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
  const [isMobileSafari, setIsMobileSafari] = useState(false);
  const [isSafariDesktop, setIsSafariDesktop] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);

  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const preloadAttempted = useRef(false);

  useEffect(() => {
    setIsMounted(true);

    // Detect Safari browser
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(
      navigator.userAgent
    );
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isMobileSafariBrowser = isSafariBrowser && isMobile;
    const isSafariDesktopBrowser = isSafariBrowser && !isMobile;

    setIsSafari(isSafariBrowser);
    setIsMobileSafari(isMobileSafariBrowser);
    setIsSafariDesktop(isSafariDesktopBrowser);

    return () => {
      setIsMounted(false);
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

  // Extract YouTube video ID from URL
  const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;

    // Handle various YouTube URL formats
    let videoId = null;

    // Format: youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([^&]+)/i);
    if (watchMatch) videoId = watchMatch[1];

    // Format: youtu.be/VIDEO_ID
    const shortMatch = url.match(/(?:youtu\.be\/)([^?&/]+)/i);
    if (shortMatch) videoId = shortMatch[1];

    // Format: youtube.com/embed/VIDEO_ID
    const embedMatch = url.match(/(?:youtube\.com\/embed\/)([^?&/]+)/i);
    if (embedMatch) videoId = embedMatch[1];

    // Standard format using the old regex as fallback
    if (!videoId) {
      const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      }
    }

    return videoId;
  };

  // Reset loading state when video source changes
  useEffect(() => {
    if (videoSrc) {
      setIframeLoaded(false);
      setLoadError(false);
      retryCount.current = 0;
      preloadAttempted.current = false;

      // Extract video ID
      const extractedVideoId = extractYouTubeVideoId(videoSrc);
      setVideoId(extractedVideoId);
    }
  }, [videoSrc]);

  // Preload video when modal is opened
  useEffect(() => {
    if (isOpen && videoSrc && !preloadAttempted.current) {
      preloadAttempted.current = true;

      // For Safari, we need to ensure the content is loaded immediately
      if (isSafari && iframeRef.current) {
        // Use iframe with optimized URL for Safari
        const embedUrl = convertToEmbedUrl(videoSrc);
        iframeRef.current.src = embedUrl;
      } else if (iframeRef.current) {
        // For other browsers, use iframe with standard URL
        const embedUrl = convertToEmbedUrl(videoSrc);
        iframeRef.current.src = embedUrl;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, videoSrc, isSafari, videoId]);

  // Convert any YouTube URL format to a direct embed URL
  const convertToEmbedUrl = (url: string): string => {
    if (!url) return "";

    // Handle various YouTube URL formats
    let videoId = null;

    // Format: youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([^&]+)/i);
    if (watchMatch) videoId = watchMatch[1];

    // Format: youtu.be/VIDEO_ID
    const shortMatch = url.match(/(?:youtu\.be\/)([^?&/]+)/i);
    if (shortMatch) videoId = shortMatch[1];

    // Format: youtube.com/embed/VIDEO_ID
    const embedMatch = url.match(/(?:youtube\.com\/embed\/)([^?&/]+)/i);
    if (embedMatch) videoId = embedMatch[1];

    if (videoId) {
      // For Safari mobile, use the most optimized URL with playsinline and other optimizations
      if (isMobileSafari) {
        return `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&autoplay=1&controls=1&showinfo=0&modestbranding=1&fs=1&color=white`;
      }

      // For Safari on desktop, use optimized embed URL
      if (isSafariDesktop) {
        return `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1&controls=1&showinfo=0&modestbranding=1&fs=1&color=white`;
      }

      // For other browsers, use a standard embed URL
      return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }

    // If no YouTube URL pattern is matched, return the original URL
    return url;
  };

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
          // Extract video ID and try with absolute minimal URL
          const url = videoSrc;
          let videoId = null;

          // Try to extract video ID from various formats
          const patterns = [
            /(?:youtube\.com\/watch\?v=)([^&]+)/i, // youtube.com/watch?v=ID
            /(?:youtu\.be\/)([^?&/]+)/i, // youtu.be/ID
            /(?:youtube\.com\/embed\/)([^?&/]+)/i, // youtube.com/embed/ID
          ];

          for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
              videoId = match[1];
              break;
            }
          }

          if (videoId) {
            // Use the most basic embed URL possible for retries
            iframeRef.current.src = `https://www.youtube.com/embed/${videoId}`;
          } else {
            iframeRef.current.src = url;
          }
        }
      }, 200); // Faster retry
    }
  };

  if (!isMounted) return null;

  // Convert the video source to a proper embed URL
  const embedUrl = convertToEmbedUrl(videoSrc);

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

            {/* Loading indicator */}
            {(!iframeLoaded || loadError) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
                <div className="animate-pulse text-primary">
                  {loadError
                    ? `Error loading video. ${retryCount.current < maxRetries ? "Retrying..." : "Please try again."}`
                    : "Loading video..."}
                </div>
              </div>
            )}

            {/* Use optimized iframe for Safari browsers */}
            {isSafari && videoId ? (
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&autoplay=1&controls=1&showinfo=0&modestbranding=1&fs=1&color=white`}
                title={videoTitle}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                loading="eager"
                style={{ border: "none" }}
              ></iframe>
            ) : (
              /* Use iframe for all other browsers */
              <iframe
                ref={iframeRef}
                src={embedUrl}
                title={videoTitle}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                loading="eager"
              ></iframe>
            )}
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
