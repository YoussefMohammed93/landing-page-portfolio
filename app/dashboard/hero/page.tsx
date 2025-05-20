"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/ui/image-upload";
import { useQuery, useMutation, useAction } from "convex/react";

export default function HeroPage() {
  const saveImage = useAction(api.files.saveImage);
  const deleteFile = useAction(api.files.deleteFile);

  const heroContent = useQuery(api.hero.getHeroContent);
  const updateHeroText = useMutation(api.hero.updateHeroText);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    mainHeading: "",
    highlightedText: "",
    description: "",
    achievement1: "",
    achievement2: "",
    achievement3: "",
    imageUrl: "",
  });
  const [originalData, setOriginalData] = useState({
    mainHeading: "",
    highlightedText: "",
    description: "",
    achievement1: "",
    achievement2: "",
    achievement3: "",
    imageUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (heroContent) {
      const initialData = {
        mainHeading: heroContent.mainHeading,
        highlightedText: heroContent.highlightedText,
        description: heroContent.description,
        achievement1: heroContent.achievements[0],
        achievement2: heroContent.achievements[1],
        achievement3: heroContent.achievements[2],
        imageUrl: heroContent.imageUrl,
      };

      setFormData(initialData);
      setOriginalData(initialData);
      setHasChanges(false);
      setSelectedFile(null);
    }
  }, [heroContent]);

  useEffect(() => {
    if (originalData && formData) {
      const hasTextChanges =
        originalData.mainHeading !== formData.mainHeading ||
        originalData.highlightedText !== formData.highlightedText ||
        originalData.description !== formData.description ||
        originalData.achievement1 !== formData.achievement1 ||
        originalData.achievement2 !== formData.achievement2 ||
        originalData.achievement3 !== formData.achievement3;

      const hasImageChanges = selectedFile !== null;

      setHasChanges(hasTextChanges || hasImageChanges);
    }
  }, [formData, originalData, selectedFile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (file: File) => {
    try {
      setSelectedFile(file);

      const previewUrl = URL.createObjectURL(file);

      setFormData((prev) => ({ ...prev, imageUrl: previewUrl }));

      return previewUrl;
    } catch (error) {
      console.error("Error handling image:", error);
      toast.error("Error handling image", {
        description: "Please try again",
      });
      throw error;
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const uploadUrl = await generateUploadUrl();

    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!result.ok) {
      throw new Error("Failed to upload image");
    }

    const { storageId } = await result.json();

    const { url } = await saveImage({ storageId });

    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges) return;

    try {
      setIsLoading(true);

      let finalImageUrl = formData.imageUrl;

      if (selectedFile) {
        try {
          finalImageUrl = await uploadImage(selectedFile);

          if (
            originalData.imageUrl &&
            originalData.imageUrl.includes("convex.cloud") &&
            originalData.imageUrl !== finalImageUrl
          ) {
            try {
              await deleteFile({ url: originalData.imageUrl });
            } catch (deleteError) {
              console.error("Error deleting old image:", deleteError);
            }
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          toast.error("Error uploading image", {
            description: "Please try again",
          });
          setIsLoading(false);
          return;
        }
      } else if (originalData.imageUrl && !formData.imageUrl) {
        if (originalData.imageUrl.includes("convex.cloud")) {
          try {
            await deleteFile({ url: originalData.imageUrl });
          } catch (deleteError) {
            console.error("Error deleting old image:", deleteError);
          }
        }

        finalImageUrl = "";
      }

      await updateHeroText({
        mainHeading: formData.mainHeading,
        highlightedText: formData.highlightedText,
        description: formData.description,
        achievements: [
          formData.achievement1,
          formData.achievement2,
          formData.achievement3,
        ],
      });

      if (selectedFile) {
        setFormData((prev) => ({ ...prev, imageUrl: finalImageUrl }));
      }

      setSelectedFile(null);
      setOriginalData({
        ...formData,
        imageUrl: finalImageUrl,
      });
      setHasChanges(false);

      toast.success("Hero section updated", {
        description: "Your changes have been saved",
      });
    } catch (error) {
      console.error("Error updating hero section:", error);
      toast.error("Error updating hero section", {
        description: "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!heroContent) {
    return (
      <div className="space-y-6 w-full">
        <Card className="border-l-0">
          <CardHeader>
            <Skeleton className="h-7 w-64 mb-2" />
            <Skeleton className="h-5 w-full max-w-md" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-full max-w-xs mt-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <div className="grid grid-cols-1 gap-4">
                        <Skeleton className="h-10 w-full" />{" "}
                        <Skeleton className="h-10 w-full" />{" "}
                        <Skeleton className="h-10 w-full" />{" "}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <div className="aspect-video w-full bg-muted/30 rounded-md border-2 border-dashed border-border flex items-center justify-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full max-w-xs mt-1" />{" "}
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-6">
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <Card className="border-l-0">
        <CardHeader>
          <CardTitle>Hero Section Management</CardTitle>
          <CardDescription>
            Update the content of your hero section that appears at the top of
            your homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mainHeading">Main Heading</Label>
                  <Input
                    id="mainHeading"
                    name="mainHeading"
                    value={formData.mainHeading}
                    onChange={handleChange}
                    placeholder="Enter main heading text"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="highlightedText">Highlighted Text</Label>
                  <Input
                    id="highlightedText"
                    name="highlightedText"
                    value={formData.highlightedText}
                    onChange={handleChange}
                    placeholder="Text to highlight within heading"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This text should be part of the main heading and will be
                    highlighted with the primary color.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description text"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <div className="space-y-2">
                    <Label>Achievement Statistics</Label>
                    <div className="grid grid-cols-1 gap-4">
                      <Input
                        name="achievement1"
                        value={formData.achievement1}
                        onChange={handleChange}
                        placeholder="First achievement"
                        required
                      />
                      <Input
                        name="achievement2"
                        value={formData.achievement2}
                        onChange={handleChange}
                        placeholder="Second achievement"
                        required
                      />
                      <Input
                        name="achievement3"
                        value={formData.achievement3}
                        onChange={handleChange}
                        placeholder="Third achievement"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Hero Image</Label>
                  <ImageUpload
                    value={formData.imageUrl}
                    onChange={(url) => {
                      if (!url) {
                        setSelectedFile(null);
                        setFormData((prev) => ({ ...prev, imageUrl: "" }));
                        if (originalData.imageUrl) {
                          setHasChanges(true);
                        }
                      }
                    }}
                    onUpload={handleImageUpload}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended size: 650x550px. SVG, PNG, JPG or GIF (max.
                    5MB).
                  </p>
                  {selectedFile && (
                    <p className="text-xs text-primary">
                      New image selected. Click Save Changes to upload.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <CardFooter className="px-0 pt-6">
              <Button
                type="submit"
                disabled={isLoading || !hasChanges}
                className="ml-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
