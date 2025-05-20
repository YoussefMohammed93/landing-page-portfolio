"use client";

import Link from "next/link";
import Image from "next/image";

import {
  Image as ImageIcon,
  Video,
  Layers,
  Music,
  Settings,
  Home,
  Film,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true;
    }
    if (path !== "/dashboard" && pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  const navigationItems = [
    {
      name: "Hero",
      href: "/dashboard/hero",
      icon: <ImageIcon className="size-4" />,
    },
    {
      name: "Video Editing",
      href: "/dashboard/video-editing",
      icon: <Video className="size-4" />,
    },
    {
      name: "2D Animations",
      href: "/dashboard/2d-animations",
      icon: <Layers className="size-4" />,
    },
    {
      name: "3D Animations",
      href: "/dashboard/3d-animations",
      icon: <Film className="size-4" />,
    },
    {
      name: "Music",
      href: "/dashboard/music",
      icon: <Music className="size-4" />,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="size-4" />,
    },
  ];

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="flex h-[57px] border-b px-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Media Team Logo"
                width={28}
                height={28}
                className="h-auto w-auto"
              />
              <span className="font-semibold">Dashboard</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref>
                    <SidebarMenuButton
                      isActive={isActive(item.href)}
                      tooltip={item.name}
                      className="pl-5 cursor-pointer"
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-0">
            <Button asChild variant="ghost" className="w-full">
              <Link href="/" className="flex items-center justify-start gap-2">
                <Home className="size-4 mt-0.5" />
                <span>Back to Website</span>
              </Link>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="w-full flex-1">
            <div className="bg-card p-3.5">
              <SidebarTrigger />
            </div>
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
