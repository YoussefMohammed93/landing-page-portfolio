"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Image as ImageIcon,
  Video,
  Layers,
  Box,
  Music,
  Settings,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const dashboardCards = [
    {
      title: "Hero Section",
      description: "Manage your hero section content and appearance",
      icon: <ImageIcon className="size-5" />,
      href: "/dashboard/hero",
    },
    {
      title: "Video Editing",
      description: "Manage your video content and settings",
      icon: <Video className="size-5" />,
      href: "/dashboard/video-editing",
    },
    {
      title: "2D Animations",
      description: "Manage your 2D animation content",
      icon: <Layers className="size-5" />,
      href: "/dashboard/2d-animations",
    },
    {
      title: "3D Animations",
      description: "Manage your 3D animation content",
      icon: <Box className="size-5" />,
      href: "/dashboard/3d-animations",
    },
    {
      title: "Music",
      description: "Manage your music content and audio settings",
      icon: <Music className="size-5" />,
      href: "/dashboard/music",
    },
    {
      title: "Settings",
      description: "Configure your dashboard and website settings",
      icon: <Settings className="size-5" />,
      href: "/dashboard/settings",
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="h-full hover:bg-card/80 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xl font-medium">
                  {card.title}
                </CardTitle>
                <div className="bg-primary/10 p-2 rounded-full">
                  {card.icon}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
