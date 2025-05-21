"use client";

import {
  Mail,
  Phone,
  MapPin,
  Search,
  Plus,
  Trash2,
  Pencil,
  Save,
  Loader2,
  MessageCircle,
  Users,
  Link as LinkIcon,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Facebook,
  Github,
  Dribbble,
  Figma,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "convex/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SocialMediaLink {
  _id: Id<"socialMedia">;
  platform: string;
  icon: string;
  url: string;
  createdAt: number;
  updatedAt: number;
}

interface ContactMessage {
  _id: Id<"contactMessages">;
  name: string;
  email: string;
  service: string;
  message: string;
  isRead: boolean;
  createdAt: number;
}

interface NewsletterSubscription {
  _id: Id<"newsletter">;
  email: string;
  isRead: boolean;
  createdAt: number;
}

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState("contact-details");

  const unreadMessageCount = useQuery(api.contact.getUnreadMessageCount) || 0;
  const unreadNewsletterCount =
    useQuery(api.contact.getUnreadNewsletterCount) || 0;

  const markAllMessagesAsRead = useMutation(api.contact.markAllMessagesAsRead);
  const markAllNewsletterAsRead = useMutation(
    api.contact.markAllNewsletterAsRead
  );

  const handleTabChange = async (value: string) => {
    setActiveTab(value);

    if (value === "messages" && unreadMessageCount > 0) {
      try {
        await markAllMessagesAsRead();
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    }

    if (value === "newsletter" && unreadNewsletterCount > 0) {
      try {
        await markAllNewsletterAsRead();
      } catch (error) {
        console.error("Error marking newsletter subscriptions as read:", error);
      }
    }
  };

  return (
    <div className="space-y-6 w-full bg-card border-t pt-4 px-4">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
        defaultValue="contact-details"
      >
        <TabsList className="w-full justify-start mb-6 overflow-x-auto">
          <TabsTrigger
            value="contact-details"
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            <span>Contact Details</span>
          </TabsTrigger>
          <TabsTrigger value="social-media" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            <span>Social Media</span>
          </TabsTrigger>
          <TabsTrigger
            value="messages"
            className="flex items-center gap-2 relative"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Messages</span>
            {unreadMessageCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-1 px-1.5 py-0 h-5 min-w-5 flex items-center justify-center text-xs"
              >
                {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="newsletter"
            className="flex items-center gap-2 relative"
          >
            <Users className="h-4 w-4" />
            <span>Newsletter</span>
            {unreadNewsletterCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-1 px-1.5 py-0 h-5 min-w-5 flex items-center justify-center text-xs"
              >
                {unreadNewsletterCount > 9 ? "9+" : unreadNewsletterCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="contact-details">
          <ContactDetailsTab />
        </TabsContent>
        <TabsContent value="social-media">
          <SocialMediaTab />
        </TabsContent>
        <TabsContent value="messages">
          <MessagesTab />
        </TabsContent>
        <TabsContent value="newsletter">
          <NewsletterTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ContactDetailsTab() {
  const contactDetails = useQuery(api.contact.getContactDetails);
  const updateContactDetails = useMutation(api.contact.updateContactDetails);

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (contactDetails) {
      setFormData({
        email: contactDetails.email,
        phone: contactDetails.phone,
        location: contactDetails.location,
      });
    }
  }, [contactDetails]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (
        contactDetails &&
        (newData.email !== contactDetails.email ||
          newData.phone !== contactDetails.phone ||
          newData.location !== contactDetails.location)
      ) {
        setHasChanges(true);
      } else {
        setHasChanges(false);
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateContactDetails({
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
      });
      setHasChanges(false);
      toast.success("Contact details updated successfully!");
    } catch (error) {
      console.error("Error updating contact details:", error);
      toast.error("Failed to update contact details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-0 border-0 shadow-none">
      <CardHeader className="p-0">
        <CardTitle>Contact Details</CardTitle>
        <CardDescription>
          Update your contact information that appears on your website.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {contactDetails === undefined ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  name="location"
                  placeholder="Enter your location"
                  value={formData.location}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter className="p-0 pb-4">
        {contactDetails === undefined ? (
          <Skeleton className="h-10 w-24 ml-auto" />
        ) : (
          <Button
            type="submit"
            onClick={handleSubmit}
            className="ml-auto"
            disabled={isSubmitting || !hasChanges}
          >
            {isSubmitting ? (
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
    </Card>
  );
}

function SocialMediaTab() {
  const socialMediaLinks = useQuery(api.contact.getSocialMediaLinks);
  const createSocialMediaLink = useMutation(api.contact.createSocialMediaLink);
  const updateSocialMediaLink = useMutation(api.contact.updateSocialMediaLink);
  const deleteSocialMediaLink = useMutation(api.contact.deleteSocialMediaLink);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialMediaLink | null>(null);
  const [linkToDelete, setLinkToDelete] = useState<SocialMediaLink | null>(
    null
  );

  const [formData, setFormData] = useState({
    platform: "",
    icon: "",
    url: "",
  });

  const socialIcons = [
    { name: "Instagram", icon: "Instagram" },
    { name: "Twitter", icon: "Twitter" },
    { name: "Youtube", icon: "Youtube" },
    { name: "LinkedIn", icon: "Linkedin" },
    { name: "Facebook", icon: "Facebook" },
    { name: "GitHub", icon: "Github" },
    { name: "Dribbble", icon: "Dribbble" },
    { name: "Figma", icon: "Figma" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, icon: value }));
  };

  const openNewLinkDialog = () => {
    setFormData({
      platform: "",
      icon: "",
      url: "",
    });
    setEditingLink(null);
    setIsDialogOpen(true);
  };

  const openEditLinkDialog = (link: SocialMediaLink) => {
    setFormData({
      platform: link.platform,
      icon: link.icon,
      url: link.url,
    });
    setEditingLink(link);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (link: SocialMediaLink) => {
    setLinkToDelete(link);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingLink) {
        await updateSocialMediaLink({
          id: editingLink._id,
          platform: formData.platform,
          icon: formData.icon,
          url: formData.url,
        });
        toast.success("Social media link updated successfully!");
      } else {
        await createSocialMediaLink({
          platform: formData.platform,
          icon: formData.icon,
          url: formData.url,
        });
        toast.success("Social media link added successfully!");
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving social media link:", error);
      toast.error("Failed to save social media link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!linkToDelete) return;

    try {
      await deleteSocialMediaLink({
        id: linkToDelete._id,
      });
      setIsDeleteDialogOpen(false);
      toast.success("Social media link deleted successfully!");
    } catch (error) {
      console.error("Error deleting social media link:", error);
      toast.error("Failed to delete social media link. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-none p-0">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-5 p-0 justify-between">
          <div>
            <CardTitle>Social Media Links</CardTitle>
            <CardDescription>
              Manage your social media links that appear on your website.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={openNewLinkDialog}
          >
            <Plus className="h-4 w-4 " />
            Add New Link
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {socialMediaLinks === undefined ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-9 w-20" />
                </div>
              ))}
            </div>
          ) : socialMediaLinks.length === 0 ? (
            <div className="flex items-center flex-col gap-5 py-8">
              <LinkIcon className="h-24 w-24 text-muted-foreground bg-muted/50 p-5 rounded-full" />
              <p className="text-muted-foreground">
                No social media links yet. Add your first one!
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {socialMediaLinks.map((link) => (
                <div
                  key={link._id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {getIconComponent(link.icon, "h-5 w-5 text-primary")}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{link.platform}</h4>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary truncate block"
                    >
                      {link.url}
                    </a>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditLinkDialog(link)}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => openDeleteDialog(link)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#111111]">
          <DialogHeader>
            <DialogTitle>
              {editingLink ? "Edit Social Media Link" : "Add Social Media Link"}
            </DialogTitle>
            <DialogDescription>
              {editingLink
                ? "Update your social media link details."
                : "Add a new social media link to your website."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform Name</Label>
              <Input
                id="platform"
                name="platform"
                placeholder="e.g. Instagram, Twitter, etc."
                value={formData.platform}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={handleSelectChange}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {socialIcons.map((icon) => (
                    <SelectItem key={icon.icon} value={icon.icon}>
                      <div className="flex items-center gap-2">
                        {getIconComponent(icon.icon, "h-4 w-4")}
                        <span>{icon.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                name="url"
                type="url"
                placeholder="https://..."
                value={formData.url}
                onChange={handleChange}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className=" h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className=" h-4 w-4" />
                    Save
                  </>
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
              This will permanently delete the social media link for{" "}
              {linkToDelete?.platform}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MessagesTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(
    null
  );
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);

  const isReadFilter =
    filterValue === "read"
      ? true
      : filterValue === "unread"
      ? false
      : undefined;

  const messages = useQuery(api.contact.searchContactMessages, {
    searchTerm: searchTerm || undefined,
    isRead: isReadFilter,
  });
  const unreadMessageCount = useQuery(api.contact.getUnreadMessageCount) || 0;
  const markMessageAsRead = useMutation(api.contact.markMessageAsRead);
  const markAllMessagesAsRead = useMutation(api.contact.markAllMessagesAsRead);
  const deleteContactMessage = useMutation(api.contact.deleteContactMessage);

  const handleMarkAllAsRead = async () => {
    if (unreadMessageCount === 0) return;

    setIsMarkingAllAsRead(true);
    try {
      await markAllMessagesAsRead();
      toast.success("All messages marked as read");
    } catch (error) {
      console.error("Error marking all messages as read:", error);
      toast.error("Failed to mark messages as read");
    } finally {
      setIsMarkingAllAsRead(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (value: string) => {
    setFilterValue(value === "all" ? null : value);
  };

  const openMessageDialog = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);

    if (!message.isRead) {
      markMessageAsRead({ id: message._id })
        .then(() => {})
        .catch((error) => {
          console.error("Error marking message as read:", error);
        });
    }
  };

  const openDeleteDialog = (message: ContactMessage) => {
    setMessageToDelete(message);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;

    try {
      await deleteContactMessage({
        id: messageToDelete._id,
      });
      setIsDeleteDialogOpen(false);
      toast.success("Message deleted successfully!");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message. Please try again.");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 p-0 shadow-none">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center p-0 gap-5 justify-between">
          <div>
            <CardTitle>Contact Messages</CardTitle>
            <CardDescription>
              View and manage messages submitted through your contact form.
            </CardDescription>
          </div>
          {unreadMessageCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllAsRead}
            >
              {isMarkingAllAsRead ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Marking as read...
                </>
              ) : (
                <>
                  Mark all as read
                  <Badge
                    variant="destructive"
                    className="ml-2 px-1.5 py-0 h-5 min-w-5 flex items-center justify-center text-xs"
                  >
                    {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                  </Badge>
                </>
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <Select
              value={filterValue || "all"}
              onValueChange={handleFilterChange}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter messages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {messages === undefined ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full max-w-md mb-2" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center flex-col gap-5 py-8">
              <MessageCircle className="h-24 w-24 text-muted-foreground bg-muted/50 p-5 rounded-full" />
              <p className="text-muted-foreground">
                No messages found. Adjust your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-4">
              {messages.map((message) => (
                <Card
                  key={message._id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    !message.isRead ? "border-primary/50" : ""
                  }`}
                  onClick={() => openMessageDialog(message)}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">
                        {message.name}
                      </CardTitle>
                      {!message.isRead && (
                        <Badge variant="default" className="ml-2">
                          New
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      {formatDate(message.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm text-muted-foreground mb-1">
                      {message.email}
                    </p>
                    <p className="text-sm line-clamp-2">{message.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] sm:max-h-[85vh] md:max-h-[90vh] overflow-auto bg-[#111111]">
          {selectedMessage && (
            <>
              <DialogHeader>
                <div>
                  <DialogTitle>{selectedMessage.name}</DialogTitle>
                </div>
                <DialogDescription>
                  {formatDate(selectedMessage.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Email:</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedMessage.email}
                  </p>
                </div>
                {selectedMessage.service && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Service:</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedMessage.service}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium mb-1">Message:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteDialog(selectedMessage);
                }}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </>
          )}
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
              This will permanently delete this message. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NewsletterTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] =
    useState<NewsletterSubscription | null>(null);

  const subscriptions = useQuery(api.contact.searchNewsletterSubscriptions, {
    searchTerm: searchTerm || undefined,
  });
  const unreadNewsletterCount =
    useQuery(api.contact.getUnreadNewsletterCount) || 0;
  const deleteSubscription = useMutation(
    api.contact.deleteNewsletterSubscription
  );
  const markAllNewsletterAsRead = useMutation(
    api.contact.markAllNewsletterAsRead
  );

  const handleMarkAllAsRead = async () => {
    if (unreadNewsletterCount === 0) return;

    setIsMarkingAllAsRead(true);
    try {
      await markAllNewsletterAsRead();
      toast.success("All newsletter subscriptions marked as read");
    } catch (error) {
      console.error(
        "Error marking all newsletter subscriptions as read:",
        error
      );
      toast.error("Failed to mark newsletter subscriptions as read");
    } finally {
      setIsMarkingAllAsRead(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const openDeleteDialog = (subscription: NewsletterSubscription) => {
    setSubscriptionToDelete(subscription);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!subscriptionToDelete) return;

    try {
      await deleteSubscription({
        id: subscriptionToDelete._id,
      });
      setIsDeleteDialogOpen(false);
      toast.success("Subscription deleted successfully!");
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast.error("Failed to delete subscription. Please try again.");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 p-0 shadow-none">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center p-0 gap-5 justify-between">
          <div>
            <CardTitle>Newsletter Subscriptions</CardTitle>
            <CardDescription>
              Manage email addresses subscribed to your newsletter.
            </CardDescription>
          </div>
          {unreadNewsletterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllAsRead}
            >
              {isMarkingAllAsRead ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Marking as read...
                </>
              ) : (
                <>
                  Mark all as read
                  <Badge
                    variant="destructive"
                    className="ml-2 px-1.5 py-0 h-5 min-w-5 flex items-center justify-center text-xs"
                  >
                    {unreadNewsletterCount > 9 ? "9+" : unreadNewsletterCount}
                  </Badge>
                </>
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          {subscriptions === undefined ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="flex items-center flex-col gap-5 py-8">
              <Users className="h-24 w-24 text-muted-foreground bg-muted/50 p-5 rounded-full" />
              <p className="text-muted-foreground">
                No subscriptions found. Adjust your search criteria.
              </p>
            </div>
          ) : (
            <div className="rounded-md border mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Date Subscribed</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription._id}>
                      <TableCell>{subscription.email}</TableCell>
                      <TableCell>
                        {formatDate(subscription.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => openDeleteDialog(subscription)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-[#111111]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subscription for{" "}
              {subscriptionToDelete?.email}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function getIconComponent(iconName: string, className: string) {
  switch (iconName) {
    case "Instagram":
      return <Instagram className={className} />;
    case "Twitter":
      return <Twitter className={className} />;
    case "Youtube":
      return <Youtube className={className} />;
    case "Linkedin":
      return <Linkedin className={className} />;
    case "Facebook":
      return <Facebook className={className} />;
    case "Github":
      return <Github className={className} />;
    case "Dribbble":
      return <Dribbble className={className} />;
    case "Figma":
      return <Figma className={className} />;
    default:
      return <LinkIcon className={className} />;
  }
}
