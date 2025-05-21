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
  MessageCircle,
  LogOut,
  LayoutDashboard,
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
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const settings = useQuery(api.settings.getSettings);
  const { logout } = useAuth();

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true;
    }
    if (path !== "/dashboard" && pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  const baseNavigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="size-4" />,
      id: "dashboard",
      alwaysVisible: true,
    },
    {
      name: "Hero",
      href: "/dashboard/hero",
      icon: <ImageIcon className="size-4" />,
      id: "hero",
      alwaysVisible: true,
    },
    {
      name: "Video Editing",
      href: "/dashboard/video-editing",
      icon: <Video className="size-4" />,
      id: "video-editing",
      alwaysVisible: false,
    },
    {
      name: "2D Animations",
      href: "/dashboard/2d-animations",
      icon: <Layers className="size-4" />,
      id: "2d-animations",
      alwaysVisible: false,
    },
    {
      name: "3D Animations",
      href: "/dashboard/3d-animations",
      icon: <Film className="size-4" />,
      id: "3d-animations",
      alwaysVisible: false,
    },
    {
      name: "Music",
      href: "/dashboard/music",
      icon: <Music className="size-4" />,
      id: "music",
      alwaysVisible: false,
    },
    {
      name: "Contact",
      href: "/dashboard/contact",
      icon: <MessageCircle className="size-4" />,
      id: "contact",
      alwaysVisible: false,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="size-4" />,
      id: "settings",
      alwaysVisible: true,
    },
  ];

  const navigationItems = baseNavigationItems.filter((item) => {
    if (item.alwaysVisible) return true;

    if (!settings) return true;

    const { sectionVisibility } = settings;

    switch (item.id) {
      case "video-editing":
        return sectionVisibility.videoEditing;
      case "2d-animations":
        return sectionVisibility.twoDAnimations;
      case "3d-animations":
        return sectionVisibility.threeDAnimations;
      case "music":
        return sectionVisibility.music;
      default:
        return true;
    }
  });

  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen w-full">
          <Sidebar>
            <SidebarHeader className="flex h-[57px] border-b px-4">
              <Link
                href="/"
                className="flex items-center gap-2 relative w-10 h-10"
              >
                <Image
                  src={settings?.logoUrl || "/logo.png"}
                  alt={`${settings?.websiteName || ""} Logo`}
                  fill
                  className="object-contain"
                  unoptimized={
                    settings?.logoUrl?.includes("/storage/") ||
                    settings?.logoUrl?.endsWith(".svg")
                  }
                />
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
            <SidebarFooter className="border-t p-0 flex flex-col gap-0">
              <Button asChild variant="ghost" className="w-full">
                <Link
                  href="/"
                  className="flex items-center justify-start gap-2"
                >
                  <Home className="size-4" />
                  <span>Back to Website</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="w-full text-destructive hover:text-destructive border-t"
              >
                <Link
                  href="/"
                  onClick={logout}
                  className="flex items-center justify-start gap-2"
                >
                  <LogOut className="size-4 mr-2" />
                  <span>Logout</span>
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
    </ProtectedRoute>
  );
}
