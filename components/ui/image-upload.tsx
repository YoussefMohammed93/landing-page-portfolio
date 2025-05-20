"use client";

import Image from "next/image";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<string>;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  className,
  disabled,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      toast.error("Invalid file type", {
        description: "Please upload an image file (JPG, PNG, SVG, etc.)",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      toast.error("File too large", {
        description: "Image must be less than 5MB",
      });
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const url = await onUpload(file);
      onChange(url);
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 transition-all",
        isUploading && "opacity-70 cursor-not-allowed",
        value ? "border-primary/50" : "border-border hover:border-primary/30",
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={isUploading || disabled}
      />
      {value && !isUploading ? (
        <div className="relative w-full aspect-square md:aspect-[3/2]">
          <div className="relative w-full h-full">
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover rounded-md"
              unoptimized={
                value.endsWith(".svg") || value.includes("image/svg")
              }
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 size-8 rounded-full"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="size-4" />
            <span className="sr-only">Remove image</span>
          </Button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={cn(
            "flex flex-col items-center justify-center w-full aspect-video cursor-pointer rounded-md bg-muted/30 hover:bg-muted/50 transition-colors",
            isUploading && "cursor-not-allowed"
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="relative w-20 h-20">
                <Skeleton className="w-full h-full rounded-full" />
                <Loader2 className="size-8 text-primary animate-spin absolute inset-0 m-auto" />
              </div>
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload an image
              </p>
              <p className="text-xs text-muted-foreground">
                SVG, PNG, JPG or GIF (max. 5MB)
              </p>
            </div>
          )}
        </div>
      )}
      {error && (
        <p className="text-sm text-destructive mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
