"use client";

import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSectionVisibility } from "@/hooks/use-settings";
import { useSectionTitles } from "./section-titles-provider";

function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  return function (this: unknown, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

function useActiveSection(sections: Array<{ id: string }>, offset = 100) {
  const [activeSection, setActiveSection] = useState("hero");
  const [isProjectsPage, setIsProjectsPage] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname;
      setIsProjectsPage(pathname.startsWith("/projects"));
    }
  }, []);

  useEffect(() => {
    if (isProjectsPage) {
      setActiveSection("hero");
    }
  }, [isProjectsPage]);

  useEffect(() => {
    const handleScroll = throttle(() => {
      if (isProjectsPage) {
        return;
      }

      const viewportHeight = window.innerHeight;
      let currentSection = "hero";
      let maxVisibleArea = 0;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (!element) {
          console.warn(`Element with id ${section.id} not found`);
          continue;
        }

        const { offsetTop, offsetHeight } = element;
        const elementBottom = offsetTop + offsetHeight;

        const visibleTop = Math.max(offsetTop, window.scrollY);
        const visibleBottom = Math.min(
          elementBottom,
          window.scrollY + viewportHeight
        );
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);

        const visiblePercentage = (visibleHeight / offsetHeight) * 100;

        if (section.id === "timeline" && visiblePercentage > 30) {
          currentSection = "timeline";
          break;
        }

        if (section.id === "services" && visiblePercentage > 25) {
          currentSection = "services";
          break;
        }

        if (visiblePercentage > maxVisibleArea) {
          maxVisibleArea = visiblePercentage;
          currentSection = section.id;
        }
      }

      if (currentSection !== activeSection) {
        console.log(`Setting active section to: ${currentSection}`);
        setActiveSection(currentSection);
      }
    }, 100);

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections, offset, activeSection, isProjectsPage]);

  return { activeSection, isProjectsPage };
}

export default function Navigation() {
  const headerRef = useRef<HTMLElement>(null);

  const [, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { sectionTitles } = useSectionTitles();
  const { isSectionVisible } = useSectionVisibility();
  const settings = useQuery(api.settings.getSettings);

  const baseNavLinks = [
    {
      name: "Home",
      href: "#hero",
      id: "hero",
      ariaLabel: "Navigate to home section",
    },
    {
      name: "Video Editing",
      href: "#video-editing",
      id: "video-editing",
      ariaLabel: "Navigate to video editing section",
    },
    {
      name: "2D Animations",
      href: "#2d-animations",
      id: "2d-animations",
      ariaLabel: "Navigate to 2d animations section",
    },
    {
      name: "3D Animations",
      href: "#3d-animations",
      id: "3d-animations",
      ariaLabel: "Navigate to 3d animations section",
    },
    {
      name: "Music",
      href: "#music",
      id: "music",
      ariaLabel: "Navigate to music section",
    },
    {
      name: "Contact Us",
      href: "#contact",
      id: "contact",
      ariaLabel: "Navigate to contact section",
    },
  ];

  const filteredBaseNavLinks = baseNavLinks.filter((link) => {
    if (link.id === "hero" || link.id === "contact") return true;

    return isSectionVisible(link.id);
  });

  const navLinks = filteredBaseNavLinks.map((link) => {
    if (sectionTitles[link.id]) {
      return {
        ...link,
        name: sectionTitles[link.id],
      };
    }
    return link;
  });

  const { activeSection, isProjectsPage } = useActiveSection(navLinks, 150);

  useEffect(() => {
    const handleScroll = throttle(() => {
      setIsScrolled(window.scrollY > 10);
      setScrollY(window.scrollY / window.innerHeight);
    }, 50);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const logoVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  const navItemVariants = {
    initial: { opacity: 0, y: -10 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: 0.05 * i,
      },
    }),
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
        when: "afterChildren",
        staggerChildren: 0.03,
        staggerDirection: -1,
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        when: "beforeChildren",
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
  };

  const mobileNavItemVariants = {
    closed: { opacity: 0, x: -10 },
    open: { opacity: 1, x: 0 },
  };

  const themeToggleVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.2 } },
    whileTap: { scale: 0.9 },
  };

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 overflow-hidden",
        isScrolled
          ? "bg-background/75 backdrop-blur-md border-b border-border/50 py-3"
          : "bg-background/30 backdrop-blur-sm py-5"
      )}
      role="banner"
      aria-label="Main navigation"
    >
      <div className="max-w-[1360px] mx-auto px-5 md:px-10 flex items-center justify-between">
        <motion.div initial="initial" animate="animate" variants={logoVariants}>
          <Link
            href="/"
            aria-label="Go to home page"
            className="flex items-center relative w-10 h-10"
          >
            <Image
              src={settings?.logoUrl || "/logo.png"}
              alt={`${settings?.websiteName || ""} Logo`}
              fill
              priority
              unoptimized={
                settings?.logoUrl?.includes("/storage/") ||
                settings?.logoUrl?.endsWith(".svg")
              }
            />
          </Link>
        </motion.div>
        <nav
          className="hidden md:flex items-center space-x-5"
          aria-label="Main navigation"
        >
          {navLinks.map((link, i) => (
            <motion.div
              key={link.name}
              custom={i}
              initial="initial"
              animate="animate"
              variants={navItemVariants}
              className="relative"
            >
              <Link
                href={isProjectsPage ? `/${link.href}` : link.href}
                className={cn(
                  "text-sm sm:text-base font-medium transition-all px-1 pt-2 pb-1 relative group",
                  link.id === "hero" && isProjectsPage
                    ? "hover:text-primary"
                    : activeSection === link.id
                    ? "text-primary"
                    : "hover:text-primary"
                )}
                aria-label={link.ariaLabel}
                aria-current={activeSection === link.id ? "page" : undefined}
              >
                <span className="relative z-10">{link.name}</span>
                <motion.span
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-primary/20 rounded-full"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.2 }}
                />
                {activeSection === link.id &&
                  !(link.id === "hero" && isProjectsPage) && (
                    <motion.div
                      layoutId="activeSection"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                      initial={{ opacity: 0, width: "30%" }}
                      animate={{ opacity: 1, width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
              </Link>
            </motion.div>
          ))}
        </nav>
        <div className="flex items-center md:hidden">
          <motion.div
            initial="initial"
            animate="animate"
            whileTap="whileTap"
            variants={themeToggleVariants}
          ></motion.div>
          <motion.div
            initial="initial"
            animate="animate"
            whileTap="whileTap"
            variants={themeToggleVariants}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              className="relative group"
            >
              <motion.div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ scale: 0.8 }}
                whileHover={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                    transition={{
                      duration: 0.2,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <X className="h-6 w-6 text-primary" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                    transition={{
                      duration: 0.2,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </div>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            id="mobile-menu"
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="md:hidden bg-background/80 backdrop-blur-md border-b border-border/40"
            aria-label="Mobile navigation"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-1 border-b">
              {navLinks.map((link) => (
                <motion.div
                  key={link.name}
                  variants={mobileNavItemVariants}
                  className="overflow-hidden"
                >
                  <Link
                    href={isProjectsPage ? `/${link.href}` : link.href}
                    className={cn(
                      "flex items-center text-sm font-medium py-3 px-3 rounded-md transition-all relative overflow-hidden",
                      link.id === "hero" && isProjectsPage
                        ? "hover:bg-primary/5"
                        : activeSection === link.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-primary/5"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label={link.ariaLabel}
                    aria-current={
                      activeSection === link.id ? "page" : undefined
                    }
                  >
                    <motion.div
                      className="absolute inset-0 bg-primary/5 -z-10"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                    <motion.div
                      className="flex items-center"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {link.name}
                      {activeSection === link.id &&
                        !(link.id === "hero" && isProjectsPage) && (
                          <motion.div
                            layoutId="activeMobileSection"
                            className="ml-2 h-2 w-2 rounded-full bg-primary"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                            }}
                          />
                        )}
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
