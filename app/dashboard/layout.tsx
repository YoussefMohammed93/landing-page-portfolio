"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
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
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="size-4" />,
    },
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
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader className="flex h-14 border-b px-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Media Team Logo"
                width={28}
                height={28}
                className="h-auto w-auto"
              />
              <span className="font-semibold">Media Dashboard</span>
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
                      className="pl-5"
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <Link href="/" className="flex items-center gap-2">
              <Home className="size-4" />
              <span>Back to Website</span>
            </Link>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="flex-1 pt-3 pl-4">
            <div className="pb-3.5">
              <SidebarTrigger />
            </div>
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
