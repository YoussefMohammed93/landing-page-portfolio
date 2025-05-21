"use client";

import Link from "next/link";
import Image from "next/image";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ArrowRight, Circle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRef, useState, useEffect } from "react";
import { useAnimation } from "./animation-provider";
import { motion, useInView, useReducedMotion } from "framer-motion";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useAnimation();

  const [isMobile, setIsMobile] = useState(false);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  const heroContentQuery = useQuery(api.hero.getHeroContent);

  const heroContent = heroContentQuery || {
    mainHeading: "Social Media Content That Captivates",
    highlightedText: "Captivates",
    description:
      "We create stunning videos, animations, and music that help brands stand out in the crowded social media landscape.",
    achievements: [
      "50+ brands trust our creative team.",
      "100+ projects completed successfully.",
      "24/7 support for all our clients.",
    ],
    imageUrl: "/hero.svg",
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const checkIfLowEndDevice = () => {
      const hasLowCPU =
        typeof navigator !== "undefined" &&
        navigator.hardwareConcurrency !== undefined &&
        navigator.hardwareConcurrency <= 2;

      setIsLowEndDevice(hasLowCPU === true);
    };

    checkIfMobile();
    checkIfLowEndDevice();

    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const isInView = useInView(textRef, {
    once: true,
    amount: isMobile ? 0.1 : 0.3,
  });

  const shouldReduceAnimations = prefersReducedMotion || isLowEndDevice;
  const shouldUseReducedAnimations =
    useReducedMotion() || shouldReduceAnimations;

  const getAnimationDuration = (baseDuration: number) =>
    shouldReduceAnimations ? baseDuration * 0.6 : baseDuration;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceAnimations ? 0.1 : 0.2,
        delayChildren: shouldReduceAnimations ? 0.1 : 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceAnimations ? 10 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: getAnimationDuration(0.8),
        ease: shouldReduceAnimations ? "easeOut" : [0.25, 0.1, 0.25, 1.0],
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: shouldReduceAnimations ? 0.98 : 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: getAnimationDuration(1),
        ease: shouldReduceAnimations ? "easeOut" : [0.25, 0.1, 0.25, 1.0],
        delay: shouldReduceAnimations ? 0.3 : 0.6,
      },
    },
  };

  const highlightVariants = {
    hidden: { opacity: 0, y: shouldReduceAnimations ? 5 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: getAnimationDuration(0.5),
        ease: "easeOut",
        delay: shouldReduceAnimations ? 0.4 : 0.8,
      },
    },
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative pt-32 md:pt-28 pb-16 md:pb-20 overflow-hidden bg-grid"
    >
      <div className="max-w-[1360px] relative z-10 mx-auto px-5 md:px-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
          <motion.div
            ref={textRef}
            className="flex flex-col justify-center space-y-6 md:space-y-8"
            initial="hidden"
            animate={
              isInView || shouldUseReducedAnimations ? "visible" : "hidden"
            }
            variants={shouldUseReducedAnimations ? {} : containerVariants}
          >
            <motion.div
              className="space-y-4"
              variants={shouldUseReducedAnimations ? {} : itemVariants}
            >
              {heroContentQuery === undefined ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 md:h-12 lg:h-14 w-4/5" />
                  <Skeleton className="h-8 md:h-10 lg:h-12 w-2/5" />
                  <Skeleton className="h-6 md:h-8 w-full max-w-[600px] mt-4" />
                  <Skeleton className="h-6 md:h-8 w-4/5 max-w-[500px]" />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                    {heroContent.mainHeading.replace(
                      heroContent.highlightedText,
                      ""
                    )}{" "}
                    <motion.span
                      className="relative inline-block"
                      variants={
                        shouldUseReducedAnimations ? {} : highlightVariants
                      }
                    >
                      <span className="bg-gradient-to-r from-primary/90 via-primary to-primary/90 bg-clip-text text-transparent">
                        {heroContent.highlightedText}
                      </span>
                    </motion.span>
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground max-w-[600px] leading-relaxed">
                    {heroContent.description}
                  </p>
                </>
              )}
            </motion.div>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-2"
              variants={shouldUseReducedAnimations ? {} : itemVariants}
            >
              {heroContentQuery === undefined ? (
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <Skeleton className="h-12 w-40 bg-primary/30" />
                  <Skeleton className="h-12 w-40 border border-primary/20" />
                </div>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="font-medium relative overflow-hidden h-12 px-8"
                  >
                    <Link href="#contact">
                      <span className="relative z-10 flex items-center gap-2">
                        Get a Quote
                        {shouldReduceAnimations ? (
                          <ArrowRight className="h-4 w-4 ml-1" />
                        ) : (
                          <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{
                              duration: 1.5,
                              repeat: Number.POSITIVE_INFINITY,
                              repeatType: "reverse",
                            }}
                            className="hidden md:block"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </motion.span>
                        )}
                      </span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
                  >
                    <Link href="#video-editing">
                      <span className="relative z-10">See Our Work</span>
                    </Link>
                  </Button>
                </>
              )}
            </motion.div>
            <motion.div
              className="flex items-center gap-2 pt-2"
              variants={
                shouldUseReducedAnimations
                  ? {}
                  : {
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          delay: shouldReduceAnimations ? 0.6 : 1.2,
                          duration: shouldReduceAnimations ? 0.5 : 0.8,
                        },
                      },
                    }
              }
            >
              {heroContentQuery === undefined ? (
                <div className="flex flex-col gap-2 w-full">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded-full bg-primary/20" />
                      <Skeleton
                        className={`h-5 sm:h-6 md:h-7 ${
                          index === 1
                            ? "w-4/5"
                            : index === 2
                            ? "w-3/4"
                            : "w-5/6"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {heroContent.achievements.map(
                    (achievement: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-primary fill-primary/20" />
                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                          {achievement}
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
          <motion.div
            className="relative h-[400px] lg:h-[550px] w-full"
            initial="hidden"
            animate="visible"
            variants={shouldUseReducedAnimations ? {} : imageVariants}
            viewport={{ once: true }}
          >
            {heroContentQuery === undefined ? (
              <div className="w-full h-full rounded-lg shadow-lg overflow-hidden">
                <Skeleton className="w-full h-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <Image
                  src={heroContent.imageUrl}
                  alt="Social Media Content Creation"
                  fill
                  className="object-cover rounded-lg shadow-lg"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={90}
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
