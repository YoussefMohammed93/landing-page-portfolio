"use client";

import Image from "next/image";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AudioWaveform } from "./audio-waveform";
import { AnimatedSection } from "./animated-section";
import { motion, AnimatePresence } from "framer-motion";
import { StaggeredChildren } from "./staggered-children";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Volume2, AudioLinesIcon } from "lucide-react";

export function MusicSection() {
  const [activeTrack, setActiveTrack] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);

  const togglePlay = (trackId: number) => {
    if (activeTrack === trackId) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveTrack(trackId);
      setIsPlaying(true);
    }
  };

  const audioTracks = [
    {
      id: 1,
      title: "Upbeat Corporate",
      duration: "1:45",
      genre: "Corporate",
      coverArt: "/placeholder.svg?height=60&width=60",
    },
    {
      id: 2,
      title: "Emotional Piano",
      duration: "2:30",
      genre: "Cinematic",
      coverArt: "/placeholder.svg?height=60&width=60",
    },
    {
      id: 3,
      title: "Energetic EDM",
      duration: "1:20",
      genre: "Electronic",
      coverArt: "/placeholder.svg?height=60&width=60",
    },
  ];

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
            <span className="text-gradient">Music</span>
            <div className="hidden md:flex items-center mt-2">
              <div className="w-1 h-1 rounded-full bg-primary/70 mr-1"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary mr-1"></div>
              <div className="w-14 lg:w-20 h-[1px] bg-gradient-to-l from-transparent via-primary/40 to-primary"></div>
            </div>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            Our in-house composers create custom music and sound design that
            enhances your visual content and creates a memorable audio
            experience for your audience
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <StaggeredChildren
            className="space-y-4"
            animation="slideUp"
            staggerAmount={0.1}
          >
            {audioTracks.map((track) => (
              <Card
                key={track.id}
                className={`transition-all bg-muted/30 ${
                  activeTrack === track.id ? "border-primary" : "border-border"
                } hover:border-primary/50`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-8 sm:gap-5">
                    <div className="flex items-center gap-5">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`h-10 w-10 rounded-full transition-colors ${
                          activeTrack === track.id && isPlaying
                            ? "bg-primary text-primary-foreground"
                            : ""
                        }`}
                        onClick={() => togglePlay(track.id)}
                      >
                        {isPlaying && activeTrack === track.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>

                      <div className="h-12 w-12 relative rounded-full overflow-hidden">
                        <Image
                          src={track.coverArt || "/placeholder.svg"}
                          alt={track.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-medium">{track.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {track.genre} • {track.duration}
                        </p>
                      </div>
                    </div>
                    <AnimatePresence>
                      {activeTrack === track.id && (
                        <motion.div
                          className="flex items-center justify-between gap-4"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <AudioWaveform
                            isPlaying={isPlaying && activeTrack === track.id}
                            height={30}
                            width={60}
                            barCount={6}
                          />

                          <div className="flex items-center gap-2 w-48">
                            <Volume2 className="h-4 w-4 text-muted-foreground" />
                            <Slider
                              value={[volume]}
                              max={100}
                              step={1}
                              onValueChange={(value) => setVolume(value[0])}
                              className="w-full"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            ))}
          </StaggeredChildren>
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button className="group" variant="outline" size="lg">
              <AudioLinesIcon className="z-10 h-4 w-4" />
              <span className="relative z-10">View All Music Tracks</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </AnimatedSection>
  );
}
