"use client";

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
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [isOpen, videoSrc]);

  const handleClose = () => {
    setIsLoading(true);
    onClose();
  };

  const getYouTubeEmbedUrl = (url: string) => {
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

    // Standard format using the old regex as fallback
    if (!videoId) {
      const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      }
    }

    if (videoId) {
      // Check for Safari browser
      const isSafari =
        typeof navigator !== "undefined" &&
        /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isMobile =
        typeof navigator !== "undefined" &&
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isMobileSafari = isSafari && isMobile;
      const isSafariDesktop = isSafari && !isMobile;

      // For Safari, use specific parameters to ensure modal functionality
      if (isMobileSafari) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`;
      }

      if (isSafariDesktop) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
      }

      // Use standard parameters for other browsers
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;
    }

    return url;
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogTitle className="sr-only">{videoTitle}</DialogTitle>
      <CustomDialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-background/95 backdrop-blur-sm border-border">
        <div className="relative">

          <div className="relative aspect-video w-full bg-muted/30">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}

            <iframe
              ref={iframeRef}
              src={getYouTubeEmbedUrl(videoSrc)}
              title={videoTitle}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={handleIframeLoad}
              style={{
                opacity: isLoading ? 0 : 1,
                transition: "opacity 0.3s ease-in-out",
              }}
            />
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
