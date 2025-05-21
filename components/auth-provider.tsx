"use client";

import {
  useState,
  useEffect,
  ReactNode,
  useContext,
  createContext,
} from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { ConvexReactClient } from "convex/react";
import { AdminValidationResult } from "@/convex/admin";
import { useRouter, usePathname } from "next/navigation";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem("auth");
      if (auth) {
        try {
          const authData = JSON.parse(auth);
          if (authData && authData.expiresAt > Date.now()) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem("auth");
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error parsing auth data:", error);
          localStorage.removeItem("auth");
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && pathname.startsWith("/dashboard")) {
        router.push("/admin");
        toast.error("Authentication required", {
          description: "Please log in to access the dashboard",
        });
      }

      if (isAuthenticated && pathname === "/admin") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const result = (await convex.query(api.admin.validateCredentials, {
        username,
        password,
      })) as AdminValidationResult;

      if (result.success && result.admin) {
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

        localStorage.setItem(
          "auth",
          JSON.stringify({
            username: result.admin.username,
            expiresAt,
          })
        );

        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setIsAuthenticated(false);
    router.push("/admin");
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
