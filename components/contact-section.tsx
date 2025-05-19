"use client";

import {
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedSection } from "@/components/animated-section";
import { StaggeredChildren } from "@/components/staggered-children";

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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setFormState("success");
    setTimeout(() => {
      setFormState("idle");
      setFormData({ name: "", email: "", service: "", message: "" });
    }, 3000);
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
            <span className="text-gradient">Contact</span> Us
            <div className="hidden md:flex items-center mt-2">
              <div className="w-1 h-1 rounded-full bg-primary/70 mr-1"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary mr-1"></div>
              <div className="w-14 lg:w-20 h-[1px] bg-gradient-to-l from-transparent via-primary/40 to-primary"></div>
            </div>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            Ready to elevate your social media content? Get in touch with our
            team to discuss your project.
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
            <div className="space-y-4">
              <div className="flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <p className="group-hover:text-primary transition-colors">
                  email@support.com
                </p>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <p className="group-hover:text-primary transition-colors">
                  +20 950 306 935
                </p>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <p className="group-hover:text-primary transition-colors">
                  Mansoura, Egypt
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Follow Us</h3>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                  <span className="sr-only">Instagram</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                  <span className="sr-only">Twitter</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Youtube className="h-4 w-4" />
                  <span className="sr-only">YouTube</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                  <span className="sr-only">LinkedIn</span>
                </Button>
              </div>
            </div>
          </StaggeredChildren>
          <AnimatePresence mode="wait">
            {formState === "success" ? (
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
                        <SelectItem value="video">Video Editing</SelectItem>
                        <SelectItem value="3d">3D Animation</SelectItem>
                        <SelectItem value="2d">2D Animation</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="all">Full Package</SelectItem>
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
                    className="w-full group relative overflow-hidden"
                    disabled={formState === "submitting"}
                  >
                    <span className="relative z-10">
                      {formState === "submitting"
                        ? "Sending..."
                        : "Send Message"}
                    </span>
                    <span className="absolute inset-0 bg-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
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
