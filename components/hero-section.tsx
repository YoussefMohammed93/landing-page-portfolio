"use client";

import Link from "next/link";
import Image from "next/image";

import { useThree } from "./three-provider";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";
import { useAnimation } from "./animation-provider";
import { ThreeBackground } from "./three-background";
import { motion, useInView, useReducedMotion } from "framer-motion";

export function HeroSection() {
  const { prefersReducedMotion } = useAnimation();
  const { shouldUseThree, setInteractionIntensity } = useThree();
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      const scrollPercentage = Math.min(
        scrollTop / (scrollHeight - clientHeight),
        1
      );

      const newIntensity = Math.max(1.0 - scrollPercentage * 0.8, 0.2);

      setInteractionIntensity(newIntensity);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setInteractionIntensity]);

  const isInView = useInView(textRef, {
    once: true,
    amount: isMobile ? 0.1 : 0.3,
  });

  const shouldReduceAnimations = prefersReducedMotion || isLowEndDevice;
  const shouldUseReducedAnimations =
    useReducedMotion() || shouldReduceAnimations;

  const shouldDisableAnimations = isLowEndDevice;

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
      id="home"
      ref={sectionRef}
      className="relative pt-32 md:pt-28 pb-16 md:pb-20 overflow-hidden bg-grid"
    >
      {shouldUseThree ? (
        <ThreeBackground />
      ) : (
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/20 via-primary/10 to-background"></div>
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/15 blur-3xl rounded-full opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-primary/15 blur-3xl rounded-full opacity-70"></div>
          {!isMobile && !shouldReduceAnimations && (
            <motion.div
              className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 blur-2xl rounded-full"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.6, 0.5],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            ></motion.div>
          )}
        </div>
      )}
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
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                Social Media Content That{" "}
                <motion.span
                  className="relative inline-block"
                  variants={shouldUseReducedAnimations ? {} : highlightVariants}
                >
                  <span className="bg-gradient-to-r from-primary/90 via-primary to-primary/90 bg-clip-text text-transparent">
                    Captivates
                  </span>
                  <motion.span
                    className="hidden md:block absolute -right-6 top-3 text-primary"
                    animate={{ rotate: [0, 15, 0] }}
                    transition={{
                      duration: shouldReduceAnimations ? 7 : 5,
                      repeat: Infinity,
                      ease: shouldReduceAnimations ? "linear" : "easeInOut",
                    }}
                  >
                    <Star className="h-5 w-5 fill-primary" />
                  </motion.span>
                </motion.span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-[600px] leading-relaxed">
                We create stunning videos, animations, and music that help
                brands stand out in the crowded social media landscape.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-2"
              variants={shouldUseReducedAnimations ? {} : itemVariants}
            >
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
                <Link href="#video">
                  <span className="relative z-10">See Our Work</span>
                </Link>
              </Button>
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
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden">
                  <Image
                    src="/avatar-placeholder.png"
                    alt="Avatar"
                    width={32}
                    height={32}
                    className="object-cover"
                    loading="lazy"
                    sizes="32px"
                    quality={50}
                  />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden">
                  <Image
                    src="/avatar-placeholder.png"
                    alt="Avatar"
                    width={32}
                    height={32}
                    className="object-cover"
                    loading="lazy"
                    sizes="32px"
                    quality={50}
                  />
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden">
                  <Image
                    src="/avatar-placeholder.png"
                    alt="Avatar"
                    width={32}
                    height={32}
                    className="object-cover"
                    loading="lazy"
                    sizes="32px"
                    quality={50}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">50+ brands</span>{" "}
                trust our creative team.
              </p>
            </motion.div>
          </motion.div>
          <motion.div
            className="relative h-[400px] lg:h-[550px] w-full"
            initial="hidden"
            animate="visible"
            variants={shouldUseReducedAnimations ? {} : imageVariants}
            viewport={{ once: true }}
          >
            <Image
              src="/hero.svg?height=550&width=650"
              alt="Social Media Content Creation"
              width={650}
              height={550}
              className="object-cover h-full w-full"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={90}
            />
            {shouldDisableAnimations ? (
              <div className="w-max absolute -bottom-5 left-1/2 -translate-x-1/2 md:left-auto md:right-5 md:translate-x-0 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-border shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/20 p-2 rounded-lg">
                    <Star className="h-4 w-4 text-primary fill-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Trusted by 50+ brands worldwide
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Delivering exceptional content since 2024
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <motion.div
                className="w-max absolute -bottom-5 left-1/2 -translate-x-1/2 md:left-auto md:right-5 md:translate-x-0 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-border shadow-lg"
                initial={{ opacity: 0, y: shouldReduceAnimations ? 10 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: shouldReduceAnimations ? 0.5 : 1,
                  duration: shouldReduceAnimations ? 0.3 : 0.5,
                  ease: shouldReduceAnimations ? "easeOut" : "easeInOut",
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="bg-primary/20 p-2.5 rounded-full">
                    <Star className="h-4 w-4 text-primary fill-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Trusted by 50+ brands worldwide
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Delivering exceptional content since 2024
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
