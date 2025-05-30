"use client";

import Link from "next/link";
import Image from "next/image";

import { Play, Film, Video, Music, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AudioModal } from "@/components/audio-modal";
import { useParams, notFound } from "next/navigation";
import { VideoModal } from "@/components/video-modal";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/components/animated-section";
import { StaggeredChildren } from "@/components/staggered-children";
import { WavesurferPlayer } from "@/components/ui/wavesurfer-player";

const getYouTubeEmbedUrl = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    // Add parameters for better Safari compatibility
    return `https://www.youtube.com/embed/${match[2]}?playsinline=1&rel=0&modestbranding=1`;
  }

  return url;
};

type VideoProject = Doc<"videoProjects">;
type TwoDAnimationProject = Doc<"twoDAnimationsProjects">;
type ThreeDAnimationProject = Doc<"threeDAnimationsProjects">;
type MusicTrack = Doc<"musicTracks">;

type Project =
  | VideoProject
  | TwoDAnimationProject
  | ThreeDAnimationProject
  | MusicTrack;

const isMusicTrack = (project: Project): project is MusicTrack => {
  return "coverArt" in project && "audioUrl" in project;
};

const isVideoProject = (
  project: Project
): project is VideoProject | TwoDAnimationProject | ThreeDAnimationProject => {
  return "thumbnailUrl" in project && "videoUrl" in project;
};

const categoryConfig: Record<
  string,
  {
    title: string;
    icon: React.ReactNode;
    isMusic: boolean;
  }
> = {
  "video-editing": {
    title: "Video Editing Projects",
    icon: <Video className="h-5 w-5" />,
    isMusic: false,
  },
  "2d-animations": {
    title: "2D Animation Projects",
    icon: <Film className="h-5 w-5" />,
    isMusic: false,
  },
  "3d-animations": {
    title: "3D Animation Projects",
    icon: <Film className="h-5 w-5" />,
    isMusic: false,
  },
  music: {
    title: "Music Tracks",
    icon: <Music className="h-5 w-5" />,
    isMusic: true,
  },
};

export default function ProjectsPage() {
  const params = useParams<{ category: string }>();
  const category = params.category;

  if (!Object.keys(categoryConfig).includes(category)) {
    notFound();
  }

  const [selectedVideo, setSelectedVideo] = useState<{
    id:
      | Id<
          | "videoProjects"
          | "twoDAnimationsProjects"
          | "threeDAnimationsProjects"
        >
      | number;
    title: string;
    videoSrc: string;
  } | null>(null);

  const [selectedAudio, setSelectedAudio] = useState<{
    id: Id<"musicTracks">;
    title: string;
    audioSrc: string;
    coverArt: string;
    category: string;
    duration: string;
  } | null>(null);

  const videoProjects = useQuery(api.video.getAllVideoProjects);
  const twoDAnimationProjects = useQuery(
    api.twoDAnimations.getAll2DAnimationsProjects
  );
  const threeDAnimationProjects = useQuery(
    api.threeDAnimations.getAll3DAnimationsProjects
  );
  const musicTracks = useQuery(api.music.getAllMusicTracks);

  const getProjects = (): Project[] | undefined => {
    switch (category) {
      case "video-editing":
        return videoProjects;
      case "2d-animations":
        return twoDAnimationProjects;
      case "3d-animations":
        return threeDAnimationProjects;
      case "music":
        return musicTracks;
      default:
        return [];
    }
  };

  const projects = getProjects();
  const config = categoryConfig[category] || {
    title: "Projects",
    icon: <Film className="h-5 w-5" />,
    isMusic: false,
  };

  return (
    <main>
      <AnimatedSection className="py-20 md:py-24 bg-gradient-to-b from-background via-background/98 to-background/95 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/10 blur-3xl rounded-full"></div>
        </div>
        <div className="max-w-[1360px] mx-auto px-5 md:px-10 relative z-10">
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Button asChild variant="outline" size="sm" className="gap-1">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Home</span>
                  </Link>
                </Button>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-5 pt-3">
                <span className="bg-muted/50 p-5 rounded-full">
                  {config.icon}
                </span>
                {config.title}
              </h1>
            </div>
          </div>
          {projects === undefined ? (
            config.isMusic ? (
              <div className="space-y-4 max-w-4xl mx-auto">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="bg-muted/30 border border-border">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-3/8 flex items-center gap-5">
                          <div className="h-12 w-12 rounded-full bg-muted/50 animate-pulse"></div>
                          <div className="flex-1">
                            <div className="h-5 w-32 bg-muted/50 animate-pulse rounded mb-2"></div>
                            <div className="h-4 w-24 bg-muted/50 animate-pulse rounded"></div>
                          </div>
                        </div>
                        <div className="w-full">
                          <div className="h-[50px] bg-muted/50 animate-pulse rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card
                    key={i}
                    className="overflow-hidden bg-card/50 border-border p-0"
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-video w-full">
                        <Skeleton className="absolute inset-0 rounded-none" />
                      </div>
                      <div className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : projects.length === 0 ? (
            <div className="flex items-center flex-col gap-5 py-20">
              {category === "music" ? (
                <Music className="h-24 w-24 text-muted-foreground bg-muted/50 p-5 rounded-full" />
              ) : (
                <Video className="h-24 w-24 text-muted-foreground bg-muted/50 p-5 rounded-full" />
              )}
              <p className="text-muted-foreground text-center text-lg">
                No {config.title.toLowerCase()} available yet.
              </p>
              <Button asChild variant="outline">
                <Link href="/">Return to Homepage</Link>
              </Button>
            </div>
          ) : (
            <StaggeredChildren
              className={cn(
                config.isMusic
                  ? "space-y-4 max-w-4xl mx-auto"
                  : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              )}
              animation="slideUp"
              staggerAmount={0.1}
              duration={0.4}
            >
              {projects.map((project) => (
                <Card
                  key={project._id}
                  className={cn(
                    isMusicTrack(project)
                      ? "transition-all bg-muted/30 border-border hover:border-primary/50"
                      : "overflow-hidden bg-card/50 border-border hover:border-primary/50 pt-0",
                    !isMusicTrack(project) &&
                      "transition-all duration-300 group hover:shadow-lg hover:shadow-primary/5"
                  )}
                >
                  <CardContent
                    className={isMusicTrack(project) ? "p-4" : "p-0"}
                  >
                    {!isMusicTrack(project) && isVideoProject(project) ? (
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
                          className="object-cover"
                          unoptimized={
                            project.thumbnailUrl?.endsWith(".svg") ||
                            project.thumbnailUrl?.includes("image/svg")
                          }
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="icon" className="rounded-full">
                            <Play className="h-6 w-6 text-white" />
                            <span className="sr-only">
                              Play {project.title} video
                            </span>
                          </Button>
                        </div>
                      </div>
                    ) : isMusicTrack(project) ? (
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-3/8 flex items-center gap-5">
                          <div className="h-12 w-12 relative rounded-full overflow-hidden">
                            <Image
                              src={project.coverArt || "/placeholder.svg"}
                              alt={project.title}
                              fill
                              className="object-cover"
                              unoptimized={
                                project.coverArt?.endsWith(".svg") ||
                                project.coverArt?.includes("image/svg")
                              }
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{project.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {project.category} • {project.duration}
                            </p>
                          </div>
                        </div>
                        <div className="w-full">
                          <WavesurferPlayer
                            audioSrc={project.audioUrl}
                            height={50}
                            barWidth={2}
                            barGap={2}
                            barRadius={3}
                            playerId={`projects-${project._id}`}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="relative aspect-video bg-muted/30">
                        <Skeleton className="absolute inset-0" />
                      </div>
                    )}
                    {!isMusicTrack(project) && (
                      <div className="p-5">
                        <h3 className="text-lg font-semibold mb-2">
                          {project.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </StaggeredChildren>
          )}
        </div>
      </AnimatedSection>
      {selectedVideo && (
        <VideoModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoSrc={selectedVideo.videoSrc}
          videoTitle={selectedVideo.title}
        />
      )}
      {selectedAudio && (
        <AudioModal
          isOpen={!!selectedAudio}
          onClose={() => setSelectedAudio(null)}
          audioSrc={selectedAudio.audioSrc}
          audioTitle={selectedAudio.title}
          coverArt={selectedAudio.coverArt}
          category={selectedAudio.category}
          duration={selectedAudio.duration}
        />
      )}
    </main>
  );
}
