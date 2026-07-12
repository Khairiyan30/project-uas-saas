"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (accessToken: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "sb-access-token";
const REFRESH_KEY = "sb-refresh-token";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function storeSession(accessToken: string, refreshToken?: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_KEY, refreshToken);
  }
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = await res.json();
    if (res.ok && data.session?.access_token) {
      storeSession(data.session.access_token, data.session.refresh_token);
      return data.session.access_token;
    }
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAll = useCallback((redirect = true) => {
    clearSession();
    setUser(null);
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    if (redirect) {
      router.push("/login");
    }
  }, [router]);

  const fetchUserProfile = useCallback(async (accessToken: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();

      if (res.ok && data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.full_name || data.user.email,
          avatarUrl: data.user.avatar_url,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const attemptLogin = useCallback(async (accessToken: string) => {
    setIsLoading(true);
    const ok = await fetchUserProfile(accessToken);
    if (!ok) {
      clearAll();
    }
    setIsLoading(false);
    return ok;
  }, [fetchUserProfile, clearAll]);

  useEffect(() => {
    const init = async () => {
      const accessToken = getStoredToken();
      if (!accessToken) {
        const refreshToken = localStorage.getItem(REFRESH_KEY);
        if (refreshToken) {
          const newToken = await refreshAccessToken(refreshToken);
          if (newToken) {
            await fetchUserProfile(newToken);
          } else {
            clearAll(true);
          }
        } else {
          clearAll(false);
        }
        setIsLoading(false);
        return;
      }

      const ok = await fetchUserProfile(accessToken);
      if (!ok) {
        const refreshToken = localStorage.getItem(REFRESH_KEY);
        if (refreshToken) {
          const newToken = await refreshAccessToken(refreshToken);
          if (newToken) {
            await fetchUserProfile(newToken);
          } else {
            clearAll(true);
          }
        } else {
          clearAll(true);
        }
      }
      setIsLoading(false);
    };

    init();
  }, [fetchUserProfile, clearAll]);

  useEffect(() => {
    if (user) {
      refreshIntervalRef.current = setInterval(async () => {
        const refreshToken = localStorage.getItem(REFRESH_KEY);
        if (refreshToken) {
          const newToken = await refreshAccessToken(refreshToken);
          if (newToken) {
            await fetchUserProfile(newToken);
          }
        }
      }, 14 * 60 * 1000);
    }
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [user, fetchUserProfile]);

  const login = useCallback(async (accessToken: string, refreshToken?: string) => {
    storeSession(accessToken, refreshToken);
    await attemptLogin(accessToken);
  }, [attemptLogin]);

  const logout = useCallback(async () => {
    const token = getStoredToken();
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // silent — clear local anyway
      }
    }
    clearAll(true);
  }, [clearAll]);

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
