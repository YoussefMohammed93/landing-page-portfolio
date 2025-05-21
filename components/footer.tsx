"use client";

import Link from "next/link";
import Image from "next/image";

import { toast } from "sonner";
import {
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Facebook,
  Github,
  Dribbble,
  Figma,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { useSectionVisibility } from "@/hooks/use-settings";
import { useSectionTitles } from "./section-titles-provider";
import { AnimatedSection } from "@/components/animated-section";
import { StaggeredChildren } from "@/components/staggered-children";

function getSocialIcon(iconName: string) {
  switch (iconName) {
    case "Instagram":
      return <Instagram className="h-4 w-4" />;
    case "Twitter":
      return <Twitter className="h-4 w-4" />;
    case "Youtube":
      return <Youtube className="h-4 w-4" />;
    case "Linkedin":
      return <Linkedin className="h-4 w-4" />;
    case "Facebook":
      return <Facebook className="h-4 w-4" />;
    case "Github":
      return <Github className="h-4 w-4" />;
    case "Dribbble":
      return <Dribbble className="h-4 w-4" />;
    case "Figma":
      return <Figma className="h-4 w-4" />;
    default:
      return <ChevronRight className="h-4 w-4" />;
  }
}

const baseNavLinks = [
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

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { sectionTitles } = useSectionTitles();
  const { isSectionVisible } = useSectionVisibility();
  const settings = useQuery(api.settings.getSettings);
  const contactDetails = useQuery(api.contact.getContactDetails);
  const socialMediaLinks = useQuery(api.contact.getSocialMediaLinks);
  const subscribeToNewsletter = useMutation(api.contact.subscribeToNewsletter);

  const heroContentQuery = useQuery(api.hero.getHeroContent);

  const heroContent = heroContentQuery || {
    description:
      "We create stunning videos, animations, and music that help brands stand out in the crowded social media landscape.",
  };

  const filteredBaseNavLinks = baseNavLinks.filter((link) => {
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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitting(true);

      try {
        const result = await subscribeToNewsletter({ email });

        if (result.alreadySubscribed) {
          toast.info("You're already subscribed with this email address.");
        } else {
          toast.success("Successfully subscribed to newsletter!");
          setEmail("");
        }
      } catch (error) {
        console.error("Error subscribing to newsletter:", error);
        toast.error("Failed to subscribe. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card/50 border-t border-border/50 pt-16 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/5 blur-3xl rounded-full"></div>
      </div>
      <div className="max-w-[1360px] mx-auto px-5 md:px-10 relative z-10">
        <AnimatedSection animation="fadeIn" duration={0.6}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-6 lg:gap-12 mb-12">
            <StaggeredChildren
              className="space-y-6"
              animation="fadeIn"
              staggerAmount={0.1}
            >
              <div className="space-y-4">
                <Link href="/" className="inline-block relative w-11 h-11">
                  <Image
                    src={settings?.logoUrl || "/logo.png"}
                    alt={`${settings?.websiteName || ""} Logo`}
                    fill
                    unoptimized={
                      settings?.logoUrl?.includes("/storage/") ||
                      settings?.logoUrl?.endsWith(".svg")
                    }
                  />
                </Link>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {heroContent.description}
                </p>
              </div>
              <div className="flex gap-4">
                {socialMediaLinks === undefined ||
                socialMediaLinks.length === 0 ? (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                      aria-label="Follow us on Instagram"
                      asChild
                    >
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                      aria-label="Follow us on Twitter"
                      asChild
                    >
                      <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                      aria-label="Subscribe to our YouTube channel"
                      asChild
                    >
                      <a
                        href="https://youtube.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Youtube className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                      aria-label="Connect with us on LinkedIn"
                      asChild
                    >
                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </Button>
                  </>
                ) : (
                  socialMediaLinks.map((link) => (
                    <Button
                      key={link._id}
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                      aria-label={`Follow us on ${link.platform}`}
                      asChild
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getSocialIcon(link.icon)}
                      </a>
                    </Button>
                  ))
                )}
              </div>
            </StaggeredChildren>
            <StaggeredChildren
              className="space-y-6"
              animation="fadeIn"
              staggerAmount={0.1}
            >
              <div>
                <h3 className="text-base font-semibold mb-4">Navigation</h3>
                <ul className="space-y-2">
                  {navLinks.map((link) => (
                    <li key={link.id}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                        aria-label={link.ariaLabel}
                      >
                        <ChevronRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </StaggeredChildren>
            <StaggeredChildren
              className="space-y-6"
              animation="fadeIn"
              staggerAmount={0.1}
            >
              <div>
                <h3 className="text-base font-semibold mb-4">Contact Us</h3>
                <ul className="space-y-3">
                  <li>
                    <a
                      href={`mailto:${
                        contactDetails?.email || "email@support.com"
                      }`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <span>
                        {contactDetails?.email || "email@support.com"}
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={`tel:${
                        contactDetails?.phone?.replace(/\s+/g, "") ||
                        "+20950306935"
                      }`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <span>{contactDetails?.phone || "+20 950 306 935"}</span>
                    </a>
                  </li>
                  <li>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 group">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <span>
                        {contactDetails?.location || "Mansoura, Egypt"}
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </StaggeredChildren>
            <StaggeredChildren
              className="space-y-6"
              animation="fadeIn"
              staggerAmount={0.1}
            >
              <div>
                <h3 className="text-base font-semibold mb-4">Newsletter</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Subscribe to our newsletter to receive updates and creative
                  insights.
                </p>
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pr-10 bg-background/50 border-border focus:border-primary transition-colors"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full group"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Subscribing..." : "Subscribe"}
                    {!isSubmitting && (
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    )}
                  </Button>
                </form>
              </div>
            </StaggeredChildren>
          </div>
        </AnimatedSection>
        <div className="h-px bg-border/50 my-8"></div>
        <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
          <p>
            © {currentYear} {settings?.websiteName || ""}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
