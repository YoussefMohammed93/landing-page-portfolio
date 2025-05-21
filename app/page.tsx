"use client";

import Header from "@/components/header";

import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { VideoSection } from "@/components/video-section";
import { MusicSection } from "@/components/music-section";
import { useSectionVisibility } from "@/hooks/use-settings";
import { ContactSection } from "@/components/contact-section";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";
import { TwoDAnimationsSection } from "@/components/2d-animations-section";
import { ThreeDAnimationsSection } from "@/components/3d-animations-section";

export default function MainPage() {
  const { isSectionVisible } = useSectionVisibility();

  return (
    <main>
      <Header />
      <HeroSection />
      {isSectionVisible("video-editing") && <VideoSection />}
      {isSectionVisible("2d-animations") && <TwoDAnimationsSection />}
      {isSectionVisible("3d-animations") && <ThreeDAnimationsSection />}
      {isSectionVisible("music") && <MusicSection />}
      <ContactSection />
      <Footer />
      <ScrollToTopButton />
    </main>
  );
}
