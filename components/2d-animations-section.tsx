"use client";

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

export function TwoDAnimationsSection() {
  const [selectedVideo, setSelectedVideo] = useState<{
    id: Id<"twoDAnimationsProjects"> | number;
    title: string;
    videoSrc: string;
  } | null>(null);

  const animationSectionContent = useQuery(
    api.twoDAnimations.get2DAnimationsSectionContent
  );

  const animationProjects = useQuery(
    api.twoDAnimations.get2DAnimationsProjects,
    { limit: 3 }
  );

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }

    return url;
  };

  return (
    <AnimatedSection
      id="2d-animations"
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
                  <div className="w-14 lg:w-20 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-primary"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary ml-1"></div>
                  <div className="w-1 h-1 rounded-full bg-primary/70 ml-1"></div>
                </div>
                <Skeleton className="h-10 w-48" />
                <div className="hidden md:flex items-center mt-2">
                  <div className="w-1 h-1 rounded-full bg-primary/70 mr-1"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mr-1"></div>
                  <div className="w-14 lg:w-20 h-[1px] bg-gradient-to-l from-transparent via-primary/40 to-primary"></div>
                </div>
              </div>
              <Skeleton className="h-20 w-full mx-auto" />
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
              No 2D animation projects available yet.
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
                  onClick={() =>
                    setSelectedVideo({
                      id: project._id,
                      title: project.title,
                      videoSrc: getYouTubeEmbedUrl(project.videoUrl),
                    })
                  }
                >
                  <Image
                    src={project.thumbnailUrl || "/placeholder.svg"}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={animationProjects.indexOf(project) === 0}
                    className="object-cover"
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
                <CardContent className="px-5 py-4">
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
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            <Film className="h-4 w-4" />
            <span className="relative z-10">
              View All 2D Animation Projects
            </span>
          </Button>
        </div>
      </div>
      {selectedVideo && (
        <VideoModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoSrc={
            typeof selectedVideo.videoSrc === "string"
              ? selectedVideo.videoSrc
              : ""
          }
          videoTitle={selectedVideo.title}
        />
      )}
    </AnimatedSection>
  );
}
