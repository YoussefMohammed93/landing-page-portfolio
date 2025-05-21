"use client";

import Link from "next/link";
import Image from "next/image";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "./animated-section";
import { AudioLinesIcon, Music } from "lucide-react";
import { StaggeredChildren } from "./staggered-children";
import { Card, CardContent } from "@/components/ui/card";
import { WavesurferPlayer } from "@/components/ui/wavesurfer-player";

export function MusicSection() {
  const musicSectionContent = useQuery(api.music.getMusicSectionContent);
  const musicTracks = useQuery(api.music.getMusicTracks, { limit: 3 });

  return (
    <AnimatedSection
      id="music"
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
            <span className="text-gradient">
              {musicSectionContent?.title || "Music"}
            </span>
            <div className="hidden md:flex items-center mt-2">
              <div className="w-1 h-1 rounded-full bg-primary/70 mr-1"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary mr-1"></div>
              <div className="w-14 lg:w-20 h-[1px] bg-gradient-to-l from-transparent via-primary/40 to-primary"></div>
            </div>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            {musicSectionContent?.description ||
              "Our in-house composers create custom music and sound design that enhances your visual content and creates a memorable audio experience for your audience"}
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          {!musicTracks ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-muted/30 border border-border rounded-lg p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-8 sm:gap-5">
                    <div className="flex items-center gap-5">
                      <div className="h-10 w-10 rounded-full bg-muted/50 animate-pulse"></div>
                      <div className="h-12 w-12 rounded-full bg-muted/50 animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-5 w-32 bg-muted/50 animate-pulse rounded mb-2"></div>
                        <div className="h-4 w-24 bg-muted/50 animate-pulse rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : musicTracks.length === 0 ? (
            <div className="text-center py-10">
              <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No music tracks available</p>
            </div>
          ) : (
            <StaggeredChildren
              className="space-y-4"
              animation="slideUp"
              staggerAmount={0.1}
            >
              {musicTracks.map((track) => (
                <Card
                  key={track._id}
                  className="transition-all bg-muted/30 border-border hover:border-primary/50"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-3/8 flex items-center gap-5">
                        <div className="h-12 w-12 relative rounded-full overflow-hidden">
                          <Image
                            src={track.coverArt || "/placeholder.svg"}
                            alt={track.title}
                            fill
                            className="object-cover"
                            unoptimized={
                              track.coverArt?.endsWith(".svg") ||
                              track.coverArt?.includes("image/svg")
                            }
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium">{track.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {track.category} • {track.duration}
                          </p>
                        </div>
                      </div>
                      <div className="w-full">
                        <WavesurferPlayer
                          audioSrc={track.audioUrl}
                          height={50}
                          barWidth={2}
                          barGap={2}
                          barRadius={3}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </StaggeredChildren>
          )}
          {musicTracks && musicTracks.length > 0 && (
            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button asChild className="group" variant="outline" size="lg">
                <Link href="/projects/music">
                  <AudioLinesIcon className="z-10 h-4 w-4" />
                  <span className="relative z-10">View All Music Tracks</span>
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </AnimatedSection>
  );
}
