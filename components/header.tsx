"use client";

import Link from "next/link";

import {
  Sheet,
  SheetTitle,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useSmoothScroll();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "Video Editing", href: "#video" },
    { name: "2D Animations", href: "#2d" },
    { name: "3D Animations", href: "#3d" },
    { name: "Music", href: "#music" },
    { name: "Contact", href: "#contact" },
  ];

  const headerVariants = {
    initial: { y: -100, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: isMobile ? 0.3 : 0.5,
        ease: isMobile ? "easeOut" : [0.25, 0.1, 0.25, 1.0],
      },
    },
  };

  const navItemVariants = {
    initial: { opacity: 0, y: -10 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: isMobile ? 0.05 + i * 0.05 : 0.1 + i * 0.1,
        duration: isMobile ? 0.3 : 0.5,
        ease: isMobile ? "easeOut" : [0.25, 0.1, 0.25, 1.0],
      },
    }),
  };

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
      initial="initial"
      animate="animate"
      variants={headerVariants}
      style={{
        willChange: "transform, opacity",
      }}
    >
      <div className="container mx-auto px-5 md:px-10 flex items-center justify-between h-16">
        <motion.div
          initial={{ opacity: 0, x: isMobile ? -10 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: isMobile ? 0.3 : 0.5,
            delay: isMobile ? 0.1 : 0.2,
            ease: isMobile ? "easeOut" : "easeInOut",
          }}
        >
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-primary/90 via-primary to-primary/60 bg-clip-text text-transparent">
              MEDIA TEAM
            </span>
          </Link>
        </motion.div>
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item, i) => (
            <motion.div
              key={item.name}
              custom={i}
              initial="initial"
              animate="animate"
              variants={navItemVariants}
            >
              <Link
                href={item.href}
                className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            </motion.div>
          ))}
        </nav>
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[250px] sm:w-[300px] !bg-card"
            aria-label="Navigation menu"
          >
            <SheetTitle className="sr-only">MEDIA TEAM</SheetTitle>
            <nav className="flex flex-col gap-5 mt-10 pl-5">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
}
