"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { CustomDialogContent } from "@/components/ui/custom-dialog";
import { getYouTubeEmbedUrl } from "@/lib/youtube-utils";

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

  // Handle browser detection for Safari-specific optimizations
  const [browserInfo, setBrowserInfo] = useState({
    isSafari: false,
    isMobile: false,
  });

  useEffect(() => {
    // Detect browser type on client side
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    setBrowserInfo({
      isSafari,
      isMobile,
    });
  }, []);

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoading(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogTitle className="sr-only">{videoTitle}</DialogTitle>
      <CustomDialogContent className="max-w-4xl p-0 bg-background/95 backdrop-blur-sm border-border overflow-hidden">
        <div className="flex flex-col">
          <div className="relative w-full pt-[56.25%]">
            {" "}
            {/* 16:9 aspect ratio */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={getOptimizedVideoSrc()}
              title={videoTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
              onLoad={handleIframeLoad}
            />
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
  );
}
