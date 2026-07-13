"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/types";

function hardRedirect(path: string) {
  if (typeof window !== "undefined") {
    window.location.href = path;
  }
}

export function useRequireAuth(): boolean {
  const { user, isLoading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      hardRedirect("/login");
    } else if (!isLoading && !!user) {
      setReady(true);
    }
  }, [user, isLoading]);

  return ready;
}

export function useRequireRole(allowedRole: UserRole | UserRole[]): boolean {
  const { user, isLoading } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      hardRedirect("/login");
      return;
    }

    const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];

    if (!roles.includes(user.role)) {
      if (user.role === "photographer") {
        hardRedirect("/dashboard");
      } else if (user.role === "client") {
        hardRedirect("/client/dashboard");
      } else {
        hardRedirect("/login");
      }
      return;
    }

    setReady(true);
  }, [user, isLoading, allowedRole]);

  return ready;
}
