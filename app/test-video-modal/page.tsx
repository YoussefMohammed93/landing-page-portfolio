"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VideoModal } from "@/components/video-modal";
import { getYouTubeEmbedUrl } from "@/lib/youtube-utils";
import { YouTubePreconnect } from "@/components/youtube-preconnect";

export default function TestVideoModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoFormat, setVideoFormat] = useState<"youtu.be" | "youtube.com">(
    "youtu.be"
  );

  // Sample YouTube URLs in different formats
  const videoUrls = {
    "youtu.be": "https://youtu.be/KE170tmi2zg?si=jb6p26bb-9Uf6g1D",
    "youtube.com": "https://www.youtube.com/watch?v=1ZYbU82GVz4",
  };

  return (
    <div className="container py-20">
      {/* Add YouTube preconnect for faster loading */}
      <YouTubePreconnect />

      <h1 className="text-3xl font-bold mb-8">Video Modal Test</h1>

      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Select YouTube URL Format</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              variant={videoFormat === "youtu.be" ? "default" : "outline"}
              onClick={() => setVideoFormat("youtu.be")}
            >
              youtu.be Format
            </Button>
            <Button
              variant={videoFormat === "youtube.com" ? "default" : "outline"}
              onClick={() => setVideoFormat("youtube.com")}
            >
              youtube.com Format
            </Button>
          </div>

          <div className="mt-2">
            <p className="text-sm text-muted-foreground">
              Current URL:{" "}
              <code className="bg-muted p-1 rounded">
                {videoUrls[videoFormat]}
              </code>
            </p>
          </div>
        </div>

        <Button size="lg" onClick={() => setIsModalOpen(true)}>
          Open Video Modal
        </Button>
      </div>

      <VideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoSrc={getYouTubeEmbedUrl(videoUrls[videoFormat])}
        videoTitle={
          videoFormat === "youtu.be"
            ? "Sample Video (youtu.be format)"
            : "Sample Video (youtube.com format)"
        }
      />
    </div>
  );
}
