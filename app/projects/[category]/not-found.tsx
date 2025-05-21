"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/animated-section";

export default function NotFound() {
  return (
    <main>
      <AnimatedSection className="py-20 md:py-24 lg:py-32 bg-gradient-to-b from-background via-background/98 to-background/95 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/10 blur-3xl rounded-full"></div>
        </div>
        <div className="max-w-[1360px] mx-auto px-5 md:px-10 relative z-10">
          <div className="flex flex-col items-center justify-center text-center py-20">
            <h1 className="text-6xl md:text-8xl font-bold mb-6">404</h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Category Not Found
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
              The project category you&apos;re looking for doesn&apos;t exist or may have
              been removed.
            </p>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
            </Button>
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
}
