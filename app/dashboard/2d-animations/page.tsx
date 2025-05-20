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
import { useQuery, useMutation, useAction } from "convex/react";
import { useSectionTitles } from "@/components/section-titles-provider";
import { Loader2, Save, Plus, Trash2, Pencil, Video } from "lucide-react";

export default function TwoDAnimationsPage() {
  const saveImage = useAction(api.files.saveImage);
  const deleteFile = useAction(api.files.deleteFile);

  const animationProjects = useQuery(
    api.twoDAnimations.getAll2DAnimationsProjects
  );
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const update2DAnimationsSection = useMutation(
    api.twoDAnimations.update2DAnimationsSection
  );
  const create2DAnimationProject = useMutation(
    api.twoDAnimations.create2DAnimationProject
  );
  const update2DAnimationProject = useMutation(
    api.twoDAnimations.update2DAnimationProject
  );
  const delete2DAnimationProject = useMutation(
    api.twoDAnimations.delete2DAnimationProject
  );
  const animationSectionContent = useQuery(
    api.twoDAnimations.get2DAnimationsSectionContent
  );

  const { refreshTitles } = useSectionTitles();

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProjectId, setCurrentProjectId] =
    useState<Id<"twoDAnimationsProjects"> | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] =
    useState<Id<"twoDAnimationsProjects"> | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [projectFormData, setProjectFormData] = useState({
    title: "",
    description: "",
    thumbnailUrl: "",
    videoUrl: "",
  });

  const [originalData, setOriginalData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    if (animationSectionContent) {
      setFormData({
        title: animationSectionContent.title,
        description: animationSectionContent.description,
      });
      setOriginalData({
        title: animationSectionContent.title,
        description: animationSectionContent.description,
      });
    }
  }, [animationSectionContent]);

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

  const handleProjectChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProjectFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges) return;

    try {
      setIsLoading(true);

      await update2DAnimationsSection({
        title: formData.title,
        description: formData.description,
      });

      setOriginalData({
        ...formData,
      });
      setHasChanges(false);

      refreshTitles();

      toast.success("2D Animations section updated", {
        description: "Your changes have been saved",
      });
    } catch (error) {
      console.error("Error updating 2D Animations section:", error);
      toast.error("Error updating 2D Animations section", {
        description: "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle thumbnail image upload
  const handleImageUpload = async (file: File) => {
    try {
      setSelectedFile(file);

      const previewUrl = URL.createObjectURL(file);

      setProjectFormData((prev) => ({ ...prev, thumbnailUrl: previewUrl }));

      return previewUrl;
    } catch (error) {
      console.error("Error handling image:", error);
      toast.error("Error handling image", {
        description: "Please try again",
      });
      throw error;
    }
  };

  const uploadImage = async (
    file: File,
    projectId?: Id<"twoDAnimationsProjects">
  ): Promise<string> => {
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

    const { url } = await saveImage({
      storageId,
      destination: "twoDAnimationProject",
      projectId: projectId,
    });

    return url;
  };

  const resetProjectForm = () => {
    setProjectFormData({
      title: "",
      description: "",
      thumbnailUrl: "",
      videoUrl: "",
    });
    setSelectedFile(null);
    setIsEditMode(false);
    setCurrentProjectId(null);
  };

  const openNewProjectDialog = () => {
    resetProjectForm();
    setIsProjectDialogOpen(true);
  };

  const openEditProjectDialog = (project: {
    _id: Id<"twoDAnimationsProjects">;
    title: string;
    description: string;
    thumbnailUrl: string;
    videoUrl: string;
  }) => {
    setProjectFormData({
      title: project.title,
      description: project.description,
      thumbnailUrl: project.thumbnailUrl,
      videoUrl: project.videoUrl,
    });
    setCurrentProjectId(project._id);
    setIsEditMode(true);
    setIsProjectDialogOpen(true);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      let finalThumbnailUrl = projectFormData.thumbnailUrl;

      if (selectedFile) {
        finalThumbnailUrl = await uploadImage(
          selectedFile,
          currentProjectId || undefined
        );
      }

      if (isEditMode && currentProjectId) {
        await update2DAnimationProject({
          id: currentProjectId,
          title: projectFormData.title,
          description: projectFormData.description,
          thumbnailUrl: finalThumbnailUrl,
          videoUrl: projectFormData.videoUrl,
        });

        toast.success("Project updated", {
          description: "Your changes have been saved",
        });
      } else {
        await create2DAnimationProject({
          title: projectFormData.title,
          description: projectFormData.description,
          thumbnailUrl: finalThumbnailUrl,
          videoUrl: projectFormData.videoUrl,
        });

        toast.success("Project created", {
          description: "Your new project has been added",
        });
      }

      resetProjectForm();
      setIsProjectDialogOpen(false);
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Error saving project", {
        description: "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (id: Id<"twoDAnimationsProjects">) => {
    setProjectToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      setIsLoading(true);

      const project = animationProjects?.find((p) => p._id === projectToDelete);

      if (
        project &&
        project.thumbnailUrl &&
        project.thumbnailUrl.includes("convex.cloud")
      ) {
        await deleteFile({ url: project.thumbnailUrl });
      }

      await delete2DAnimationProject({ id: projectToDelete });

      toast.success("Project deleted", {
        description: "The project has been removed",
      });

      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Error deleting project", {
        description: "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div className="space-y-6 w-full bg-card">
      <Card className="border-l-0 border-b-0 border-r-0 shadow-none">
        <CardHeader>
          {animationSectionContent === undefined ? (
            <>
              <Skeleton className="h-7 w-64 mb-2" />
              <Skeleton className="h-5 w-full max-w-md" />
            </>
          ) : (
            <>
              <CardTitle>2D Animations Section Management</CardTitle>
              <CardDescription>
                Update the content of your 2D animations section that appears on
                your homepage.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-6">
                {animationSectionContent === undefined ? (
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
              {animationSectionContent === undefined ? (
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
            {animationProjects === undefined ? (
              <>
                <Skeleton className="h-7 w-32 mb-2" />
                <Skeleton className="h-5 w-full max-w-md" />
              </>
            ) : (
              <>
                <CardTitle>2D Animation Projects</CardTitle>
                <CardDescription>
                  Manage your 2D animation projects. Only the 3 most recent
                  projects will be displayed on the homepage.
                </CardDescription>
              </>
            )}
          </div>
          {animationProjects === undefined ? (
            <Skeleton className="h-10 w-40" />
          ) : (
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={openNewProjectDialog}
            >
              <Plus className="h-4 w-4" />
              Create New Project
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {animationProjects === undefined ? (
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
          ) : animationProjects.length === 0 ? (
            <div className="flex items-center flex-col gap-5 py-8">
              <Video className="h-24 w-24 text-muted-foreground bg-muted/50 p-5 rounded-full" />
              <p className="text-muted-foreground">
                No 2D animation projects yet. Create your first one!
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thumbnail</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Video Link</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animationProjects.map((project) => (
                  <TableRow key={project._id}>
                    <TableCell>
                      <div className="relative w-24 h-16 overflow-hidden rounded">
                        <Image
                          src={project.thumbnailUrl || "/placeholder.svg"}
                          alt={project.title}
                          fill
                          className="object-cover"
                          unoptimized={
                            project.thumbnailUrl?.endsWith(".svg") ||
                            project.thumbnailUrl?.includes("image/svg")
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {project.title}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {project.description}
                    </TableCell>
                    <TableCell>
                      {getYouTubeVideoId(project.videoUrl) ? (
                        <a
                          href={project.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          YouTube
                        </a>
                      ) : (
                        <span className="text-muted-foreground">
                          Invalid URL
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditProjectDialog(project)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => openDeleteDialog(project._id)}
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
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] sm:max-h-[85vh] md:max-h-[90vh] overflow-auto bg-[#111111]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode
                ? "Edit 2D Animation Project"
                : "Create New 2D Animation Project"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the details of your 2D animation project."
                : "Add a new 2D animation project to your portfolio."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProjectSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="projectTitle">Title</Label>
                <Input
                  id="projectTitle"
                  name="title"
                  value={projectFormData.title}
                  onChange={handleProjectChange}
                  placeholder="Enter project title"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Description</Label>
                <Textarea
                  id="projectDescription"
                  name="description"
                  value={projectFormData.description}
                  onChange={handleProjectChange}
                  placeholder="Enter project description"
                  rows={3}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">YouTube Video URL</Label>
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  value={projectFormData.videoUrl}
                  onChange={handleProjectChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Enter a valid YouTube video URL (e.g.,
                  https://www.youtube.com/watch?v=XXXXXXXXXXX)
                </p>
              </div>
              <div className="space-y-2">
                <Label>Thumbnail Image</Label>
                <ImageUpload
                  value={projectFormData.thumbnailUrl}
                  onChange={(url) => {
                    if (!url) {
                      setSelectedFile(null);
                      setProjectFormData((prev) => ({
                        ...prev,
                        thumbnailUrl: "",
                      }));
                    }
                  }}
                  onUpload={handleImageUpload}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended size: 16:9 aspect ratio. SVG, PNG, JPG or GIF
                  (max. 5MB).
                </p>
                {selectedFile && (
                  <p className="text-xs text-primary">
                    New image selected. Click Save to upload.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetProjectForm();
                  setIsProjectDialogOpen(false);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
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
        <AlertDialogContent className="bg-[#111111]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project and remove the data from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
