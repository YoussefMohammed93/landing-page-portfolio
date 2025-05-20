"use client";

import Image from "next/image";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Play, Film } from "lucide-react";
import { VideoModal } from "./video-modal";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "./animated-section";
import { StaggeredChildren } from "./staggered-children";
import { Card, CardContent } from "@/components/ui/card";

export function TwoDAnimationsSection() {
  const [selectedVideo, setSelectedVideo] = useState<{
    id: number;
    title: string;
    videoSrc: string;
  } | null>(null);

  const animationProjects = [
    {
      id: 1,
      title: "Character Animation",
      description: "Animated brand mascot for social media campaign",
      thumbnail: "/placeholder.svg?height=300&width=500",
      videoSrc: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
      id: 2,
      title: "Motion Graphics",
      description: "Explainer animation for tech product features",
      thumbnail: "/placeholder.svg?height=300&width=500",
      videoSrc: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
      id: 3,
      title: "Animated Infographics",
      description: "Data visualization for corporate presentation",
      thumbnail: "/placeholder.svg?height=300&width=500",
      videoSrc: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
  ];

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
          <h2 className="flex items-center justify-center gap-3 md:gap-4 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
            <div className="hidden md:flex items-center mt-2">
              <div className="w-14 lg:w-20 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-primary"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary ml-1"></div>
              <div className="w-1 h-1 rounded-full bg-primary/70 ml-1"></div>
            </div>
            <span className="text-gradient">2D Animations</span>
            <div className="hidden md:flex items-center mt-2">
              <div className="w-1 h-1 rounded-full bg-primary/70 mr-1"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary mr-1"></div>
              <div className="w-14 lg:w-20 h-[1px] bg-gradient-to-l from-transparent via-primary/40 to-primary"></div>
            </div>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            We create eye-catching 2D animations that bring your ideas to life
            with vibrant motion graphics and character animations for all
            digital platforms.
          </p>
        </div>
        <StaggeredChildren
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          animation="slideUp"
          staggerAmount={0.1}
          duration={0.4}
        >
          {animationProjects.map((project) => (
            <Card
              key={project.id}
              className={cn(
                "overflow-hidden bg-card/50 border-border hover:border-primary/50 pt-0",
                "transition-all duration-300 group hover:shadow-lg hover:shadow-primary/5"
              )}
            >
              <div
                className="relative aspect-video cursor-pointer"
                onClick={() =>
                  setSelectedVideo({
                    id: project.id,
                    title: project.title,
                    videoSrc: project.videoSrc,
                  })
                }
              >
                <Image
                  src={project.thumbnail || "/placeholder.svg"}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={project.id === 1}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Button size="icon" className="rounded-full">
                    <Play className="h-6 w-6 text-white" />
                    <span className="sr-only">Play {project.title} video</span>
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
        <div className="mt-12 md:mt-16 text-center">
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
          videoSrc={selectedVideo.videoSrc}
          videoTitle={selectedVideo.title}
        />
      )}
    </AnimatedSection>
  );
}
