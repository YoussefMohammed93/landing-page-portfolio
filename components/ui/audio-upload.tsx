"use client";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, X, Loader2, Music } from "lucide-react";
import { WavesurferPlayer } from "@/components/ui/wavesurfer-player";

interface AudioUploadProps {
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<string>;
  className?: string;
  disabled?: boolean;
}

export function AudioUpload({
  value,
  onChange,
  onUpload,
  className,
  disabled,
}: AudioUploadProps) {
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

    if (!file.type.startsWith("audio/")) {
      setError("Please upload an audio file");
      toast.error("Invalid file type", {
        description: "Please upload an audio file (MP3, WAV, etc.)",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Audio file must be less than 10MB");
      toast.error("File too large", {
        description: "Audio file must be less than 10MB",
      });
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const url = await onUpload(file);
      onChange(url);
    } catch (error) {
      console.error("Error uploading audio:", error);
      setError("Failed to upload audio. Please try again.");
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
        accept="audio/*"
        onChange={handleChange}
        className="hidden"
        disabled={isUploading || disabled}
      />
      {value && !isUploading ? (
        <div className="relative w-full">
          <div className="flex items-center justify-center p-4 bg-muted/30 rounded-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Music className="h-8 w-8 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Audio file uploaded</p>
                  <p className="text-xs text-muted-foreground truncate max-w-full">
                    {value.split("/").pop()}
                  </p>
                </div>
              </div>
              <div className="w-full mt-3 sm:mt-0">
                <WavesurferPlayer
                  audioSrc={value}
                  playerId="audio-upload-player"
                  waveColor="rgba(255, 255, 255, 0.3)"
                  progressColor="var(--primary)"
                  height={40}
                  barWidth={2}
                  barGap={2}
                  barRadius={3}
                />
              </div>
            </div>
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
            <span className="sr-only">Remove audio</span>
          </Button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={cn(
            "flex flex-col items-center justify-center w-full py-8 cursor-pointer rounded-md bg-muted/30 hover:bg-muted/50 transition-colors",
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
                Click to upload an audio file
              </p>
              <p className="text-xs text-muted-foreground">
                MP3, WAV, or OGG (max. 10MB)
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
