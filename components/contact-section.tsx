"use client";

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
  CheckCircle,
  Send,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";

import type React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { Label } from "@/components/ui/label";
import { SiFreelancer } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { FaSquareUpwork } from "react-icons/fa6";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
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
    case "Upwork":
      return <FaSquareUpwork className="h-4 w-4" />;
    case "Freelancer":
      return <SiFreelancer className="h-4 w-4" />;
    default:
      return <LinkIcon className="h-4 w-4" />;
  }
}

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
    message: "",
  });
  const [formState, setFormState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const contactDetails = useQuery(api.contact.getContactDetails);
  const socialMediaLinks = useQuery(api.contact.getSocialMediaLinks);
  const submitContactForm = useMutation(api.contact.submitContactForm);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, service: value }));
  };

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");

    try {
      await submitContactForm({
        name: formData.name,
        email: formData.email,
        service: formData.service,
        message: formData.message,
      });

      setFormState("success");
      setTimeout(() => {
        setFormState("idle");
        setFormData({ name: "", email: "", service: "", message: "" });
      }, 3000);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setFormState("error");
      setTimeout(() => {
        setFormState("idle");
      }, 3000);
    }
  };

  return (
    <AnimatedSection
      id="contact"
      className="py-10 md:py-12 bg-gradient-to-b from-background via-background/98 to-background/95 relative overflow-hidden"
    >
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/10 blur-3xl rounded-full"></div>
      </div>
      <div className="max-w-[1360px] mx-auto px-5 md:px-10 relative z-10">
        <div className="text-center mb-12 md:mb-16 max-w-2xl mx-auto">
          <h2 className="flex items-center justify-center gap-3 md:gap-4 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
            <div className="hidden md:flex items-center mt-2">
              <div className="w-14 lg:w-20 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-primary"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary ml-1"></div>
              <div className="w-1 h-1 rounded-full bg-primary/70 ml-1"></div>
            </div>
            <span className="text-gradient">Contact Us</span>
            <div className="hidden md:flex items-center mt-2">
              <div className="w-1 h-1 rounded-full bg-primary/70 mr-1"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary mr-1"></div>
              <div className="w-14 lg:w-20 h-[1px] bg-gradient-to-l from-transparent via-primary/40 to-primary"></div>
            </div>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            Ready to elevate your social media content? Get in touch with us to
            discuss your project.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto bg-card/75 backdrop-blur-md p-7">
          <StaggeredChildren
            className="space-y-8"
            animation="slideLeft"
            staggerAmount={0.1}
          >
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Contact Information</h3>
              <p className="text-muted-foreground">
                Reach out to us directly or fill out the form to get started.
              </p>
            </div>
            {contactDetails === undefined ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-5 w-48" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 group">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <p className="group-hover:text-primary transition-colors">
                    {contactDetails?.email || "email@support.com"}
                  </p>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <p className="group-hover:text-primary transition-colors">
                    {contactDetails?.phone || "+20 950 306 935"}
                  </p>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <p className="group-hover:text-primary transition-colors">
                    {contactDetails?.location || "Mansoura, Egypt"}
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Follow Us</h3>
              <div className="flex gap-4">
                {socialMediaLinks === undefined ? (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-9 w-9 rounded-full" />
                    ))}
                  </>
                ) : socialMediaLinks.length === 0 ? (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                      asChild
                    >
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="h-4 w-4" />
                        <span className="sr-only">Instagram</span>
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                      asChild
                    >
                      <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="h-4 w-4" />
                        <span className="sr-only">Twitter</span>
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                      asChild
                    >
                      <a
                        href="https://youtube.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Youtube className="h-4 w-4" />
                        <span className="sr-only">YouTube</span>
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                      asChild
                    >
                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="h-4 w-4" />
                        <span className="sr-only">LinkedIn</span>
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
                      asChild
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getSocialIcon(link.icon)}
                        <span className="sr-only">{link.platform}</span>
                      </a>
                    </Button>
                  ))
                )}
              </div>
            </div>
          </StaggeredChildren>
          <AnimatePresence mode="wait">
            {contactDetails === undefined ? (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              </motion.div>
            ) : formState === "success" ? (
              <motion.div
                className="flex flex-col items-center justify-center h-full bg-secondary/30 rounded-lg p-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <CheckCircle className="h-16 w-16 text-primary mb-4" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                <p className="text-center text-muted-foreground">
                  Thank you for reaching out. We&apos;ll get back to you
                  shortly.
                </p>
              </motion.div>
            ) : (
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
              >
                <StaggeredChildren
                  className="space-y-6"
                  animation="slideRight"
                  staggerAmount={0.1}
                >
                  <div className="space-y-2 relative">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Name
                    </Label>
                    <div className="relative">
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => handleFocus("name")}
                        onBlur={handleBlur}
                        required
                        className="border-border focus:border-primary transition-colors"
                        aria-describedby="name-required"
                      />
                      <AnimatePresence>
                        {focusedField === "name" && (
                          <motion.span
                            className="absolute bottom-0 left-0 h-0.5 bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            exit={{ width: 0 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                    <span id="name-required" className="sr-only">
                      Name is required
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => handleFocus("email")}
                        onBlur={handleBlur}
                        required
                        className="border-border focus:border-primary transition-colors"
                        aria-describedby="email-required"
                      />
                      <AnimatePresence>
                        {focusedField === "email" && (
                          <motion.span
                            className="absolute bottom-0 left-0 h-0.5 bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            exit={{ width: 0 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                    <span id="email-required" className="sr-only">
                      Email is required
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service" className="text-sm font-medium">
                      Service
                    </Label>
                    <Select
                      onValueChange={handleSelectChange}
                      value={formData.service}
                    >
                      <SelectTrigger
                        id="service"
                        className="w-full border-border focus:border-primary transition-colors"
                      >
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectItem value="video-editing">
                          Video Editing
                        </SelectItem>
                        <SelectItem value="3d-animation">
                          3D Animation
                        </SelectItem>
                        <SelectItem value="2d-animation">
                          2D Animation
                        </SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">
                      Message
                    </Label>
                    <div className="relative">
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us about your project"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        onFocus={() => handleFocus("message")}
                        onBlur={handleBlur}
                        required
                        className="border-border focus:border-primary transition-colors resize-none"
                        aria-describedby="message-required"
                      />
                      <AnimatePresence>
                        {focusedField === "message" && (
                          <motion.span
                            className="absolute bottom-0 left-0 h-0.5 bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            exit={{ width: 0 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                    <span id="message-required" className="sr-only">
                      Message is required
                    </span>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={formState === "submitting"}
                  >
                    <span className="relative z-10">
                      {formState === "submitting"
                        ? "Sending..."
                        : "Send Message"}
                    </span>
                    {formState === "submitting" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </StaggeredChildren>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AnimatedSection>
  );
}
