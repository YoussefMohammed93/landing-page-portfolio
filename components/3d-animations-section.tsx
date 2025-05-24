"use client";

import Link from "next/link";
import Image from "next/image";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { VideoModal } from "./video-modal";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Play, Film, Video } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedSection } from "./animated-section";
import { StaggeredChildren } from "./staggered-children";
import { Card, CardContent } from "@/components/ui/card";

export function ThreeDAnimationsSection() {
  const [selectedVideo, setSelectedVideo] = useState<{
    id: Id<"threeDAnimationsProjects"> | number;
    title: string;
    videoUrl: string;
  } | null>(null);

  // State to track which video is being preloaded
  const [preloadedVideoId, setPreloadedVideoId] =
    useState<Id<"threeDAnimationsProjects"> | null>(null);

  const animationSectionContent = useQuery(
    api.threeDAnimations.get3DAnimationsSectionContent
  );

  const animationProjects = useQuery(
    api.threeDAnimations.get3DAnimationsProjects,
    { limit: 3 }
  );

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

      // For Safari mobile, use the most optimized URL with playsinline parameter
      if (isMobileSafari) {
        return `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0`;
      }

      // Use absolute minimal URL for Safari Desktop
      if (isSafariDesktop) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      // Use minimal parameters for other browsers
      return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }

    return url;
  };

  return (
    <AnimatedSection
      id="3d-animations"
      className="py-10 md:py-12 bg-gradient-to-b from-background via-background/98 to-background/95 relative overflow-hidden"
    >
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/10 blur-3xl rounded-full"></div>
      </div>
      <div className="max-w-[1360px] mx-auto px-5 md:px-10 relative z-10">
        <div className="text-center mb-12 md:mb-16 max-w-2xl mx-auto">
          {animationSectionContent === undefined ? (
            <>
              <div className="flex items-center justify-center gap-3 md:gap-4 mb-4">
                <div className="hidden md:flex items-center mt-2">
                  <Skeleton className="w-14 lg:w-20 h-[1px]" />
                  <Skeleton className="w-1.5 h-1.5 rounded-full ml-1" />
                  <Skeleton className="w-1 h-1 rounded-full ml-1" />
                </div>
                <Skeleton className="h-10 w-48" />
                <div className="hidden md:flex items-center mt-2">
                  <Skeleton className="w-1 h-1 rounded-full mr-1" />
                  <Skeleton className="w-1.5 h-1.5 rounded-full mr-1" />
                  <Skeleton className="w-14 lg:w-20 h-[1px]" />
                </div>
              </div>
              <Skeleton className="h-20 w-full max-w-lg mx-auto" />
            </>
          ) : (
            <>
              <h2 className="flex items-center justify-center gap-3 md:gap-4 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
                <div className="hidden md:flex items-center mt-2">
                  <div className="w-14 lg:w-20 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-primary"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary ml-1"></div>
                  <div className="w-1 h-1 rounded-full bg-primary/70 ml-1"></div>
                </div>
                <span className="text-gradient">
                  {animationSectionContent.title}
                </span>
                <div className="hidden md:flex items-center mt-2">
                  <div className="w-1 h-1 rounded-full bg-primary/70 mr-1"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mr-1"></div>
                  <div className="w-14 lg:w-20 h-[1px] bg-gradient-to-l from-transparent via-primary/40 to-primary"></div>
                </div>
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                {animationSectionContent.description}
              </p>
            </>
          )}
        </div>
        {animationProjects === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="overflow-hidden bg-card/50 border-border pt-0"
              >
                <div className="relative aspect-video">
                  <Skeleton className="w-full h-full absolute inset-0" />
                </div>
                <CardContent className="px-5 py-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : animationProjects.length === 0 ? (
          <div className="flex items-center flex-col gap-5 py-10">
            <Video className="h-24 w-24 text-muted-foreground bg-muted/50 p-5 rounded-full" />
            <p className="text-muted-foreground text-center">
              No 3D animation projects available yet.
            </p>
          </div>
        ) : (
          <StaggeredChildren
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            animation="slideUp"
            staggerAmount={0.1}
            duration={0.4}
          >
            {animationProjects.map((project) => (
              <Card
                key={project._id}
                className={cn(
                  "overflow-hidden bg-card/50 border-border hover:border-primary/50 pt-0",
                  "transition-all duration-300 group hover:shadow-lg hover:shadow-primary/5"
                )}
              >
                <div
                  className="relative aspect-video cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedVideo({
                      id: project._id,
                      title: project.title,
                      videoUrl: project.videoUrl,
                    });
                  }}
                  onMouseEnter={() => {
                    // Preload this video when user hovers over the thumbnail
                    setPreloadedVideoId(project._id);

                    // Create a hidden iframe to preload the video
                    const videoId = project._id;
                    if (videoId !== preloadedVideoId) {
                      const preloadIframe = document.createElement("iframe");
                      preloadIframe.style.display = "none";
                      preloadIframe.src = getYouTubeEmbedUrl(project.videoUrl);
                      preloadIframe.setAttribute(
                        "data-preload-id",
                        String(videoId)
                      );

                      // Remove the iframe after it has loaded or after 2 seconds
                      const removeIframe = () => {
                        const existingIframe = document.querySelector(
                          `iframe[data-preload-id="${videoId}"]`
                        );
                        if (existingIframe && existingIframe.parentNode) {
                          existingIframe.parentNode.removeChild(existingIframe);
                        }
                      };

                      preloadIframe.onload = removeIframe;
                      setTimeout(removeIframe, 2000);

                      // Remove any existing preload iframes for this video
                      const existingIframe = document.querySelector(
                        `iframe[data-preload-id="${videoId}"]`
                      );
                      if (existingIframe && existingIframe.parentNode) {
                        existingIframe.parentNode.removeChild(existingIframe);
                      }

                      // Add the preload iframe to the DOM
                      document.body.appendChild(preloadIframe);
                    }
                  }}
                >
                  <Image
                    src={project.thumbnailUrl || "/placeholder.svg"}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={project._id === animationProjects[0]?._id}
                    className="object-cover"
                    unoptimized={
                      project.thumbnailUrl?.endsWith(".svg") ||
                      project.thumbnailUrl?.includes("image/svg")
                    }
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button size="icon" className="rounded-full">
                      <Play className="h-6 w-6 text-white" />
                      <span className="sr-only">
                        Play {project.title} video
                      </span>
                    </Button>
                  </div>
                </div>
                <CardContent className="px-5 py-0">
                  <h3 className="font-bold text-lg md:text-xl mb-2 line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </StaggeredChildren>
        )}
        <div
          className={`mt-12 md:mt-16 text-center ${
            animationProjects?.length === 0 ? "hidden" : ""
          }`}
        >
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href="/projects/3d-animations">
              <Film className="h-4 w-4" />
              <span className="relative z-10">
                View All 3D Animation Projects
              </span>
            </Link>
          </Button>
        </div>
      </div>
      {selectedVideo && (
        <VideoModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoSrc={selectedVideo.videoUrl}
          videoTitle={selectedVideo.title}
        />
      )}
    </AnimatedSection>
  );
}
