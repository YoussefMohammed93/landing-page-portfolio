"use client";

import Link from "next/link";
import Image from "next/image";

import { useRef } from "react";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnimation } from "./animation-provider";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

export function HeroSection() {
  const { prefersReducedMotion } = useAnimation();
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(textRef, { once: true, amount: 0.3 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "5%"]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1, ease: [0.25, 0.1, 0.25, 1.0], delay: 0.6 },
    },
  };

  const highlightVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.8 },
    },
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative py-20 md:py-28 overflow-hidden bg-grid"
    >
      <motion.div
        className="absolute inset-0 z-0 opacity-40"
        style={{ y: prefersReducedMotion ? 0 : backgroundY }}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/20 via-primary/10 to-background"></div>
        <motion.div
          className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/15 blur-3xl rounded-full"
          animate={{
            x: [0, 20, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        ></motion.div>
        <motion.div
          className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-primary/15 blur-3xl rounded-full"
          animate={{
            x: [0, -20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 18,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        ></motion.div>
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 blur-2xl rounded-full hidden md:block"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        ></motion.div>
      </motion.div>
      <motion.div
        className="container relative z-10 mx-auto px-5 md:px-10"
        style={{ y: prefersReducedMotion ? 0 : contentY }}
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
          <motion.div
            ref={textRef}
            className="flex flex-col justify-center space-y-6 md:space-y-8"
            initial="hidden"
            animate={isInView || prefersReducedMotion ? "visible" : "hidden"}
            variants={prefersReducedMotion ? {} : containerVariants}
          >
            <motion.div
              className="space-y-4"
              variants={prefersReducedMotion ? {} : itemVariants}
            >
              <h1 className="text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
                Social Media Content That{" "}
                <motion.span
                  className="relative inline-block"
                  variants={prefersReducedMotion ? {} : highlightVariants}
                >
                  <span className="bg-gradient-to-r from-primary/90 via-primary to-primary/90 bg-clip-text text-transparent">
                    Captivates
                  </span>
                  <motion.span
                    className="absolute -right-6 top-3 text-primary"
                    animate={{ rotate: [0, 15, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
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
              variants={prefersReducedMotion ? {} : itemVariants}
            >
              <Button
                asChild
                size="lg"
                className="font-medium relative overflow-hidden h-12 px-8"
              >
                <Link href="#contact">
                  <span className="relative z-10 flex items-center gap-2">
                    Get a Quote
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                      }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.span>
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
                prefersReducedMotion
                  ? {}
                  : {
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { delay: 1.2, duration: 0.8 },
                      },
                    }
              }
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background overflow-hidden"
                  >
                    <Image
                      src="/avatar-placeholder.png"
                      alt={`Avatar ${i}`}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">50+ brands</span>{" "}
                trust our creative team
              </p>
            </motion.div>
          </motion.div>
          <motion.div
            className="relative h-[400px] lg:h-[550px] w-full"
            initial="hidden"
            animate="visible"
            variants={prefersReducedMotion ? {} : imageVariants}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-2xl -rotate-1"></div>
            <Image
              src="/placeholder.svg?height=550&width=650"
              alt="Social Media Content Creation"
              width={650}
              height={550}
              className="rounded-2xl object-cover h-full w-full shadow-xl shadow-primary/10"
              priority
            />
            <motion.div
              className="w-max absolute -bottom-5 left-1/2 -translate-x-1/2 md:left-auto md:right-5 md:translate-x-0 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-border shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
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
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
