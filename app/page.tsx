"use client";

import Header from "@/components/header";

import { HeroSection } from "@/components/hero-section";
import { VideoSection } from "@/components/video-section";
import { TwoDAnimationsSection } from "@/components/2d-animations-section";

export default function MainPage() {
  return (
    <main>
      <Header />
      <HeroSection />
      <VideoSection />
      <TwoDAnimationsSection />
    </main>
  );
}
