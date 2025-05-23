"use client";

import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner-toast";
import { DynamicHead } from "@/components/dynamic-head";
import { AuthProvider } from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "@/app/convex-client-provider";
import { AnimationProvider } from "@/components/animation-provider";
import { SectionTitlesProvider } from "@/components/section-titles-provider";
import { YouTubePreconnect } from "@/components/youtube-preconnect";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <AnimationProvider>
        <ConvexClientProvider>
          <SectionTitlesProvider>
            <AuthProvider>
              <DynamicHead />
              <YouTubePreconnect />
              {children}
              <Toaster closeButton richColors />
            </AuthProvider>
          </SectionTitlesProvider>
        </ConvexClientProvider>
      </AnimationProvider>
    </ThemeProvider>
  );
}
