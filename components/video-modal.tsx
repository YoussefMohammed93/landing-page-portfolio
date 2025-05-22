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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setIsMounted(true);
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

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const enhancedVideoSrc = videoSrc.includes("youtube.com/embed")
    ? `${videoSrc}${videoSrc.includes("?") ? "&" : "?"}playsinline=1&rel=0&modestbranding=1${origin ? `&origin=${encodeURIComponent(origin)}` : ""}`
    : videoSrc;

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setLoadError(false);
  };

  const handleIframeError = () => {
    setLoadError(true);

    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.src = enhancedVideoSrc;
      }
    }, 1000);
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
                    ? "Error loading video. Retrying..."
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
            ></iframe>
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
