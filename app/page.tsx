"use client";

import { HeroSection } from "@/components/hero-section";
import { VideoSection } from "@/components/video-section";
import { MusicSection } from "@/components/music-section";
import { ContactSection } from "@/components/contact-section";
import { TwoDAnimationsSection } from "@/components/2d-animations-section";
import { ThreeDAnimationsSection } from "@/components/3d-animations-section";

export default function MainPage() {
  return (
    <main>
      <HeroSection />
      <VideoSection />
      <TwoDAnimationsSection />
      <ThreeDAnimationsSection />
      <MusicSection />
      <ContactSection />
    </main>
  );
}
