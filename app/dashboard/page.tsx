"use client";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "convex/react";
import { ArrowRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const settings = useQuery(api.settings.getSettings);
  const contactMessages = useQuery(api.contact.getAllContactMessages);
  const newsletterSubscriptions = useQuery(
    api.contact.getAllNewsletterSubscriptions
  );
  const unreadMessages =
    contactMessages?.filter((msg) => !msg.isRead).length || 0;
  const unreadSubscriptions =
    newsletterSubscriptions?.filter((sub) => !sub.isRead).length || 0;

  return (
    <div className="p-6 space-y-6 bg-card border-t">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the {settings?.websiteName || "Media Portfolio"} admin
          dashboard
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Messages</CardTitle>
            <CardDescription>Contact form submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {contactMessages === undefined ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">
                    {contactMessages.length}
                  </span>
                  {unreadMessages > 0 && (
                    <span className="text-sm text-primary">
                      {unreadMessages} unread{" "}
                      {unreadMessages === 1 ? "message" : "messages"}
                    </span>
                  )}
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link
                    href="/dashboard/contact?tab=messages"
                    className="flex items-center gap-1"
                  >
                    View <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Newsletter</CardTitle>
            <CardDescription>Email subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            {newsletterSubscriptions === undefined ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold">
                    {newsletterSubscriptions.length}
                  </span>
                  {unreadSubscriptions > 0 && (
                    <span className="text-sm text-primary">
                      {unreadSubscriptions} new{" "}
                      {unreadSubscriptions === 1
                        ? "subscription"
                        : "subscriptions"}
                    </span>
                  )}
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link
                    href="/dashboard/contact?tab=newsletter"
                    className="flex items-center gap-1"
                  >
                    View <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Settings</CardTitle>
            <CardDescription>Website configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-lg font-medium">Customize your site</span>
                <span className="text-sm text-muted-foreground">
                  Theme, sections, and more
                </span>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-1"
                >
                  Manage <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <Button
            asChild
            variant="outline"
            className="h-auto py-4 justify-start"
          >
            <Link
              href="/dashboard/hero"
              className="flex flex-col items-start gap-1"
            >
              <span className="font-medium">Hero Section</span>
              <span className="text-xs text-muted-foreground">
                Edit main content
              </span>
            </Link>
          </Button>

          {settings?.sectionVisibility.videoEditing && (
            <Button
              asChild
              variant="outline"
              className="h-auto py-4 justify-start"
            >
              <Link
                href="/dashboard/video-editing"
                className="flex flex-col items-start gap-1"
              >
                <span className="font-medium">Video Projects</span>
                <span className="text-xs text-muted-foreground">
                  Manage video content
                </span>
              </Link>
            </Button>
          )}
          {settings?.sectionVisibility.twoDAnimations && (
            <Button
              asChild
              variant="outline"
              className="h-auto py-4 justify-start"
            >
              <Link
                href="/dashboard/2d-animations"
                className="flex flex-col items-start gap-1"
              >
                <span className="font-medium">2D Animations</span>
                <span className="text-xs text-muted-foreground">
                  Manage animation projects
                </span>
              </Link>
            </Button>
          )}
          {settings?.sectionVisibility.threeDAnimations && (
            <Button
              asChild
              variant="outline"
              className="h-auto py-4 justify-start"
            >
              <Link
                href="/dashboard/3d-animations"
                className="flex flex-col items-start gap-1"
              >
                <span className="font-medium">3D Animations</span>
                <span className="text-xs text-muted-foreground">
                  Manage 3D projects
                </span>
              </Link>
            </Button>
          )}
          {settings?.sectionVisibility.music && (
            <Button
              asChild
              variant="outline"
              className="h-auto py-4 justify-start"
            >
              <Link
                href="/dashboard/music"
                className="flex flex-col items-start gap-1"
              >
                <span className="font-medium">Music Tracks</span>
                <span className="text-xs text-muted-foreground">
                  Manage audio content
                </span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
