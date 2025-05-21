"use client";

import Image from "next/image";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { HexColorPicker } from "react-colorful";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Upload, Check, Loader2 } from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { hexToOklch, oklchToHex, isValidOklch } from "@/lib/color-utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const settings = useQuery(api.settings.getSettings);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const updateAllSettings = useMutation(api.settings.updateAllSettings);
  const saveImage = useAction(api.files.saveImage);
  const deleteFile = useAction(api.files.deleteFile);

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    websiteName: "",
    logoUrl: "",
    primaryColor: "",
    sectionVisibility: {
      videoEditing: true,
      twoDAnimations: true,
      threeDAnimations: true,
      music: true,
    },
  });

  const [hexColor, setHexColor] = useState("#ff0000");

  useEffect(() => {
    if (settings) {
      setFormData({
        websiteName: settings.websiteName,
        logoUrl: settings.logoUrl,
        primaryColor: settings.primaryColor,
        sectionVisibility: {
          videoEditing: settings.sectionVisibility.videoEditing,
          twoDAnimations: settings.sectionVisibility.twoDAnimations,
          threeDAnimations: settings.sectionVisibility.threeDAnimations,
          music: settings.sectionVisibility.music,
        },
      });

      if (isValidOklch(settings.primaryColor)) {
        try {
          const hexValue = oklchToHex(settings.primaryColor);
          console.log(
            "Converting OKLCH to hex:",
            settings.primaryColor,
            "->",
            hexValue
          );
          setHexColor(hexValue);
        } catch (error) {
          console.error("Error converting OKLCH to hex:", error);
          setHexColor("#ff0000");
        }
      } else {
        console.warn("Invalid OKLCH color format:", settings.primaryColor);
        setHexColor("#ff0000");
      }
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setHasChanges(true);
  };

  const handleToggle = (section: keyof typeof formData.sectionVisibility) => {
    setFormData({
      ...formData,
      sectionVisibility: {
        ...formData.sectionVisibility,
        [section]: !formData.sectionVisibility[section],
      },
    });
    setHasChanges(true);
  };

  const handleColorChange = (color: string) => {
    try {
      if (!color.startsWith("#")) {
        color = "#" + color;
      }

      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
          color = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
        } else {
          console.warn("Invalid hex color format:", color);
          return;
        }
      }

      setHexColor(color);

      const oklchColor = hexToOklch(color);
      console.log("Converting hex to OKLCH:", color, "->", oklchColor);

      setFormData({
        ...formData,
        primaryColor: oklchColor,
      });

      document.documentElement.style.setProperty("--primary", oklchColor);
      document.documentElement.style.setProperty("--ring", oklchColor);

      setHasChanges(true);
    } catch (error) {
      console.error("Error handling color change:", error);
      toast.error("Error changing color", {
        description: "Please try a different color",
      });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setHasChanges(true);
    }
  };

  const uploadLogo = async (file: File): Promise<string> => {
    const uploadUrl = await generateUploadUrl();

    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!result.ok) {
      throw new Error("Failed to upload logo");
    }

    const { storageId } = await result.json();

    const { url } = await saveImage({
      storageId,
      destination: "settings",
    });

    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let logoUrl = formData.logoUrl;

      if (logoFile) {
        try {
          logoUrl = await uploadLogo(logoFile);

          if (
            settings?.logoUrl &&
            settings.logoUrl.includes("/storage/") &&
            settings.logoUrl !== logoUrl
          ) {
            try {
              const result = await deleteFile({ url: settings.logoUrl });
              if (!result.success) {
                console.warn(
                  "Failed to delete old logo, but continuing with update"
                );
              }
            } catch (deleteError) {
              console.error("Error deleting old logo:", deleteError);
            }
          }
        } catch (uploadError) {
          console.error("Error uploading logo:", uploadError);
          toast.error("Error uploading logo", {
            description: "Please try again",
          });
          setIsLoading(false);
          return;
        }
      }

      await updateAllSettings({
        websiteName: formData.websiteName,
        logoUrl: logoUrl,
        primaryColor: formData.primaryColor,
        sectionVisibility: formData.sectionVisibility,
      });

      toast.success("Settings updated successfully");
      setHasChanges(false);
      setLogoFile(null);
      setLogoPreview(null);
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  if (!settings) {
    return (
      <div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Card className="border-l-0">
          <CardHeader>
            <CardTitle>Website Settings</CardTitle>
            <CardDescription>
              Configure your website appearance and section visibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="sections">Sections</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="websiteName">Website Name</Label>
                  <Input
                    id="websiteName"
                    name="websiteName"
                    value={formData.websiteName}
                    onChange={handleChange}
                    placeholder="Enter website name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Website Logo</Label>
                  <div className="flex items-end gap-4">
                    <div className="relative h-32 w-32 overflow-hidden rounded-md border bg-background">
                      {logoPreview ? (
                        <Image
                          src={logoPreview}
                          alt="Logo preview"
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      ) : formData.logoUrl ? (
                        <Image
                          src={formData.logoUrl}
                          alt="Current logo"
                          fill
                          className="object-contain p-1"
                          unoptimized={
                            formData.logoUrl.includes("/storage/") ||
                            formData.logoUrl.endsWith(".svg")
                          }
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          No logo
                        </div>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="logo-upload"
                        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Logo
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="sr-only"
                        />
                      </Label>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="appearance" className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="space-y-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: formData.primaryColor }}
                          />
                          <span className="flex-1 truncate">{hexColor}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-4">
                        <div className="space-y-3">
                          <HexColorPicker
                            color={hexColor}
                            onChange={handleColorChange}
                          />
                          <div className="flex items-center">
                            <div className="flex-1">
                              <Input
                                value={hexColor}
                                onChange={(e) =>
                                  handleColorChange(e.target.value)
                                }
                                className="font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="sections" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-5">
                    <div className="space-y-0.5">
                      <Label htmlFor="video-editing">
                        Video Editing Section
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Show or hide the Video Editing section on your website
                      </p>
                    </div>
                    <Switch
                      id="video-editing"
                      checked={formData.sectionVisibility.videoEditing}
                      onCheckedChange={() => handleToggle("videoEditing")}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-5">
                    <div className="space-y-0.5">
                      <Label htmlFor="2d-animations">
                        2D Animations Section
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Show or hide the 2D Animations section on your website
                      </p>
                    </div>
                    <Switch
                      id="2d-animations"
                      checked={formData.sectionVisibility.twoDAnimations}
                      onCheckedChange={() => handleToggle("twoDAnimations")}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-5">
                    <div className="space-y-0.5">
                      <Label htmlFor="3d-animations">
                        3D Animations Section
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Show or hide the 3D Animations section on your website
                      </p>
                    </div>
                    <Switch
                      id="3d-animations"
                      checked={formData.sectionVisibility.threeDAnimations}
                      onCheckedChange={() => handleToggle("threeDAnimations")}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between gap-5">
                    <div className="space-y-0.5">
                      <Label htmlFor="music">Music Section</Label>
                      <p className="text-sm text-muted-foreground">
                        Show or hide the Music section on your website
                      </p>
                    </div>
                    <Switch
                      id="music"
                      checked={formData.sectionVisibility.music}
                      onCheckedChange={() => handleToggle("music")}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (settings) {
                  setFormData({
                    websiteName: settings.websiteName,
                    logoUrl: settings.logoUrl,
                    primaryColor: settings.primaryColor,
                    sectionVisibility: {
                      videoEditing: settings.sectionVisibility.videoEditing,
                      twoDAnimations: settings.sectionVisibility.twoDAnimations,
                      threeDAnimations:
                        settings.sectionVisibility.threeDAnimations,
                      music: settings.sectionVisibility.music,
                    },
                  });
                  setLogoFile(null);
                  setLogoPreview(null);
                  setHasChanges(false);
                }
              }}
              disabled={!hasChanges || isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!hasChanges || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
