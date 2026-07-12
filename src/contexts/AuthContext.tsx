"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean; // True while checking session, fetching profile
  login: (accessToken: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial session check
  const router = useRouter();

  const fetchUserProfile = useCallback(async (accessToken: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();

      if (res.ok && data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.full_name || data.user.email, // Fallback to email if name is empty
          avatarUrl: data.user.avatar_url,
        });
      } else {
        // If token is invalid or profile not found, clear session & redirect
        localStorage.removeItem("sb-access-token");
        setUser(null);
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      localStorage.removeItem("sb-access-token");
      setUser(null);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial check on mount
  useEffect(() => {
    const accessToken = localStorage.getItem("sb-access-token");
    if (accessToken) {
      fetchUserProfile(accessToken);
    } else {
      setIsLoading(false);
    }
  }, [fetchUserProfile]);

  const login = useCallback(async (accessToken: string) => {
    localStorage.setItem("sb-access-token", accessToken);
    setIsLoading(true);
    await fetchUserProfile(accessToken);
  }, [fetchUserProfile]);

  const logout = useCallback(() => {
    // Panggil API logout
    fetch("/api/auth/logout", { method: "POST" })
      .catch((err) => console.error("Error during API logout:", err))
      .finally(() => {
        localStorage.removeItem("sb-access-token");
        setUser(null);
        router.push("/login");
      });
  }, [router]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
