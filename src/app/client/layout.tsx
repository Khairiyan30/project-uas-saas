"use client";

import { useRequireRole } from "@/hooks/useRequireAuth";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAllowed = useRequireRole("client");

  if (!isAllowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Memeriksa sesi…</p>
      </main>
    );
  }

  return <>{children}</>;
}
