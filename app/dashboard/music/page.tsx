"use client";

import Image from "next/image";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUpload } from "@/components/ui/image-upload";
import { AudioUpload } from "@/components/ui/audio-upload";
import { useQuery, useMutation, useAction } from "convex/react";
import { useSectionTitles } from "@/components/section-titles-provider";
import { Loader2, Save, Plus, Trash2, Pencil, Music } from "lucide-react";

export default function MusicPage() {
  const saveImage = useAction(api.files.saveImage);
  const saveAudio = useAction(api.files.saveAudio);
  const deleteFile = useAction(api.files.deleteFile);

  const musicTracks = useQuery(api.music.getAllMusicTracks);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const updateMusicSection = useMutation(api.music.updateMusicSection);
  const createMusicTrack = useMutation(api.music.createMusicTrack);
  const updateMusicTrack = useMutation(api.music.updateMusicTrack);
  const deleteMusicTrack = useMutation(api.music.deleteMusicTrack);
  const musicSectionContent = useQuery(api.music.getMusicSectionContent);

  const { refreshTitles } = useSectionTitles();

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [isTrackDialogOpen, setIsTrackDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTrackId, setCurrentTrackId] =
    useState<Id<"musicTracks"> | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<Id<"musicTracks"> | null>(
    null
  );

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [trackFormData, setTrackFormData] = useState({
    title: "",
    duration: "",
    category: "",
    coverArt: "",
    audioUrl: "",
  });

  const [originalData, setOriginalData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    if (musicSectionContent) {
      setFormData({
        title: musicSectionContent.title,
        description: musicSectionContent.description,
      });
      setOriginalData({
        title: musicSectionContent.title,
        description: musicSectionContent.description,
      });
    }
  }, [musicSectionContent]);

  useEffect(() => {
    if (
      formData.title !== originalData.title ||
      formData.description !== originalData.description
    ) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [formData, originalData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTrackChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTrackFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges) return;

    try {
      setIsLoading(true);

      await updateMusicSection({
        title: formData.title,
        description: formData.description,
      });

      setOriginalData({
        ...formData,
      });
      setHasChanges(false);

      refreshTitles();

      toast.success("Music section updated", {
        description: "Your changes have been saved",
      });
    } catch (error) {
      console.error("Error updating music section:", error);
      toast.error("Error updating music section", {
        description: "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoverUpload = async (file: File) => {
    try {
      setSelectedCoverFile(file);

      const previewUrl = URL.createObjectURL(file);

      setTrackFormData((prev) => ({ ...prev, coverArt: previewUrl }));

      return previewUrl;
    } catch (error) {
      console.error("Error handling cover image:", error);
      toast.error("Error handling cover image", {
        description: "Please try again",
      });
      throw error;
    }
  };

  const handleAudioUpload = async (file: File) => {
    try {
      setSelectedAudioFile(file);

      const previewUrl = URL.createObjectURL(file);

      setTrackFormData((prev) => ({ ...prev, audioUrl: previewUrl }));

      return previewUrl;
    } catch (error) {
      console.error("Error handling audio file:", error);
      toast.error("Error handling audio file", {
        description: "Please try again",
      });
      throw error;
    }
  };

  const uploadCoverImage = async (
    file: File,
    trackId?: Id<"musicTracks">
  ): Promise<string> => {
    const uploadUrl = await generateUploadUrl();

    const toastId = toast.loading("Preparing to upload cover image...", {
      description: "0% complete",
    });

    try {
      const xhr = new XMLHttpRequest();

      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.open("POST", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100
            );
            toast.loading(`Uploading image... ${percentComplete}%`, {
              id: toastId,
              description: `${percentComplete}% complete`,
            });
          }
        });

        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const { storageId } = JSON.parse(xhr.responseText);

            toast.loading("Processing image...", {
              id: toastId,
              description: "Almost done",
            });

            const { url } = await saveImage({
              storageId,
              destination: "musicTrack",
              projectId: trackId,
            });

            toast.success("Image uploaded successfully", {
              id: toastId,
              description: "Your cover image is ready",
            });

            resolve(url);
          } else {
            toast.error("Failed to upload image", {
              id: toastId,
              description: "Please try again",
            });
            reject(new Error("Failed to upload image"));
          }
        };

        xhr.onerror = () => {
          toast.error("Upload failed", {
            id: toastId,
            description: "Network error occurred",
          });
          reject(new Error("Network error during upload"));
        };

        xhr.send(file);
      });

      return await uploadPromise;
    } catch (error) {
      toast.error("Upload failed", {
        id: toastId,
        description: "An error occurred during upload",
      });
      throw error;
    }
  };

  const uploadAudioFile = async (
    file: File,
    trackId?: Id<"musicTracks">
  ): Promise<string> => {
    const uploadUrl = await generateUploadUrl();

    const toastId = toast.loading("Preparing to upload audio...", {
      description: "0% complete",
    });

    try {
      const xhr = new XMLHttpRequest();

      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.open("POST", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round(
              (event.loaded / event.total) * 100
            );
            toast.loading(`Uploading audio... ${percentComplete}%`, {
              id: toastId,
              description: `${percentComplete}% complete`,
            });
          }
        });

        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const { storageId } = JSON.parse(xhr.responseText);

            toast.loading("Processing audio file...", {
              id: toastId,
              description: "Almost done",
            });

            const { url } = await saveAudio({
              storageId,
              trackId: trackId,
            });

            toast.success("Audio uploaded successfully", {
              id: toastId,
              description: "Your audio file is ready",
            });

            resolve(url);
          } else {
            toast.error("Failed to upload audio", {
              id: toastId,
              description: "Please try again",
            });
            reject(new Error("Failed to upload audio file"));
          }
        };

        xhr.onerror = () => {
          toast.error("Upload failed", {
            id: toastId,
            description: "Network error occurred",
          });
          reject(new Error("Network error during upload"));
        };

        xhr.send(file);
      });

      return await uploadPromise;
    } catch (error) {
      toast.error("Upload failed", {
        id: toastId,
        description: "An error occurred during upload",
      });
      throw error;
    }
  };

  const resetTrackForm = () => {
    setTrackFormData({
      title: "",
      duration: "",
      category: "",
      coverArt: "",
      audioUrl: "",
    });
    setSelectedCoverFile(null);
    setSelectedAudioFile(null);
    setIsEditMode(false);
    setCurrentTrackId(null);
  };

  const openNewTrackDialog = () => {
    resetTrackForm();
    setIsTrackDialogOpen(true);
  };

  const openEditTrackDialog = (track: {
    _id: Id<"musicTracks">;
    title: string;
    duration: string;
    category: string;
    coverArt: string;
    audioUrl: string;
  }) => {
    setTrackFormData({
      title: track.title,
      duration: track.duration,
      category: track.category,
      coverArt: track.coverArt,
      audioUrl: track.audioUrl,
    });
    setCurrentTrackId(track._id);
    setIsEditMode(true);
    setIsTrackDialogOpen(true);
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      let finalCoverArtUrl = trackFormData.coverArt;
      let finalAudioUrl = trackFormData.audioUrl;

      if (selectedCoverFile) {
        finalCoverArtUrl = await uploadCoverImage(
          selectedCoverFile,
          currentTrackId || undefined
        );
      }

      if (selectedAudioFile) {
        finalAudioUrl = await uploadAudioFile(
          selectedAudioFile,
          currentTrackId || undefined
        );
      }

      if (isEditMode && currentTrackId) {
        await updateMusicTrack({
          id: currentTrackId,
          title: trackFormData.title,
          duration: trackFormData.duration,
          category: trackFormData.category,
          coverArt: finalCoverArtUrl,
          audioUrl: finalAudioUrl,
        });

        toast.success("Track updated", {
          description: "Your changes have been saved",
        });
      } else {
        await createMusicTrack({
          title: trackFormData.title,
          duration: trackFormData.duration,
          category: trackFormData.category,
          coverArt: finalCoverArtUrl,
          audioUrl: finalAudioUrl,
        });

        toast.success("Track created", {
          description: "Your new track has been added",
        });
      }

      resetTrackForm();
      setIsTrackDialogOpen(false);
    } catch (error) {
      console.error("Error saving track:", error);
      toast.error("Error saving track", {
        description: "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (id: Id<"musicTracks">) => {
    setTrackToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTrack = async () => {
    if (!trackToDelete) return;

    try {
      setIsLoading(true);

      const track = musicTracks?.find((t) => t._id === trackToDelete);

      if (track) {
        if (track.coverArt && track.coverArt.includes("convex.cloud")) {
          await deleteFile({ url: track.coverArt });
        }

        if (track.audioUrl && track.audioUrl.includes("convex.cloud")) {
          await deleteFile({ url: track.audioUrl });
        }
      }

      await deleteMusicTrack({ id: trackToDelete });

      toast.success("Track deleted", {
        description: "The track has been removed",
      });

      setIsDeleteDialogOpen(false);
      setTrackToDelete(null);
    } catch (error) {
      console.error("Error deleting track:", error);
      toast.error("Error deleting track", {
        description: "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full bg-card">
      <Card className="border-l-0 border-b-0 border-r-0 shadow-none">
        <CardHeader>
          {musicSectionContent === undefined ? (
            <>
              <Skeleton className="h-7 w-64 mb-2" />
              <Skeleton className="h-5 w-full max-w-md" />
            </>
          ) : (
            <>
              <CardTitle>Music Section Management</CardTitle>
              <CardDescription>
                Update the content of your music section that appears on your
                homepage.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-6">
                {musicSectionContent === undefined ? (
                  <>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-36" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="title">Section Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter section title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Section Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter section description"
                        rows={3}
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            <CardFooter className="px-0 pt-6">
              {musicSectionContent === undefined ? (
                <div className="ml-auto">
                  <Skeleton className="h-10 w-32" />
                </div>
              ) : (
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
              )}
            </CardFooter>
          </form>
        </CardContent>
      </Card>
      <Card className="border-l-0 border-b-0 border-r-0 shadow-none">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <div>
            {musicTracks === undefined ? (
              <>
                <Skeleton className="h-7 w-32 mb-2" />
                <Skeleton className="h-5 w-full max-w-md" />
              </>
            ) : (
              <>
                <CardTitle>Music Tracks</CardTitle>
                <CardDescription>
                  Manage your music tracks. Only the 3 most recent tracks will
                  be displayed on the homepage.
                </CardDescription>
              </>
            )}
          </div>
          {musicTracks === undefined ? (
            <Skeleton className="h-10 w-40" />
          ) : (
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={openNewTrackDialog}
            >
              <Plus className="h-4 w-4" />
              Create New Track
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {musicTracks === undefined ? (
            <div className="w-full">
              <div className="mb-4">
                <Skeleton className="h-8 w-full mb-2" />
                <div className="grid grid-cols-5 gap-4">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-3 border-t border-border">
                  <div className="grid grid-cols-5 gap-4 items-center">
                    <Skeleton className="h-10 w-16 rounded" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-1/2" />
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : musicTracks.length === 0 ? (
            <div className="flex items-center flex-col gap-5 py-8">
              <Music className="h-24 w-24 text-muted-foreground bg-muted/50 p-5 rounded-full" />
              <p className="text-muted-foreground">
                No music tracks yet. Create your first one!
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cover</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {musicTracks.map((track) => (
                  <TableRow key={track._id}>
                    <TableCell>
                      <div className="relative w-24 h-24 overflow-hidden rounded">
                        <Image
                          src={track.coverArt || "/placeholder.svg"}
                          alt={track.title}
                          fill
                          className="object-cover"
                          unoptimized={
                            track.coverArt?.endsWith(".svg") ||
                            track.coverArt?.includes("image/svg")
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{track.title}</TableCell>
                    <TableCell>{track.duration}</TableCell>
                    <TableCell>{track.category}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditTrackDialog(track)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => openDeleteDialog(track._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={isTrackDialogOpen} onOpenChange={setIsTrackDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] sm:max-h-[85vh] md:max-h-[90vh] overflow-y-auto bg-[#111111] p-4 sm:p-6">
          <DialogHeader className="mb-4">
            <DialogTitle>
              {isEditMode ? "Edit Music Track" : "Create New Music Track"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the details of your music track."
                : "Add a new music track to your portfolio."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTrackSubmit}>
            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="trackTitle">Title</Label>
                <Input
                  id="trackTitle"
                  name="title"
                  value={trackFormData.title}
                  onChange={handleTrackChange}
                  placeholder="Enter track title"
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={trackFormData.duration}
                    onChange={handleTrackChange}
                    placeholder="e.g. 2:30"
                    required
                    disabled={isLoading}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: minutes:seconds (e.g., 2:30)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={trackFormData.category}
                    onChange={handleTrackChange}
                    placeholder="e.g. Corporate, Electronic"
                    required
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <ImageUpload
                  value={trackFormData.coverArt}
                  onChange={(url) => {
                    if (!url) {
                      setSelectedCoverFile(null);
                      setTrackFormData((prev) => ({
                        ...prev,
                        coverArt: "",
                      }));
                    }
                  }}
                  onUpload={handleCoverUpload}
                  disabled={isLoading}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 1:1 aspect ratio. SVG, PNG, JPG or GIF (max.
                  5MB).
                </p>
                {selectedCoverFile && (
                  <p className="text-xs text-primary">
                    New image selected. Click Save to upload.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Audio File</Label>
                <AudioUpload
                  value={trackFormData.audioUrl}
                  onChange={(url) => {
                    if (!url) {
                      setSelectedAudioFile(null);
                      setTrackFormData((prev) => ({
                        ...prev,
                        audioUrl: "",
                      }));
                    }
                  }}
                  onUpload={handleAudioUpload}
                  disabled={isLoading}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Upload an audio file in MP3, WAV, or OGG format (max. 10MB).
                </p>
                {selectedAudioFile && (
                  <p className="text-xs text-primary">
                    New audio file selected. Click Save to upload.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetTrackForm();
                  setIsTrackDialogOpen(false);
                }}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-[#111111] p-4 sm:p-6 max-w-[90vw] sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              track and remove the data from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTrack}
              disabled={isLoading}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
