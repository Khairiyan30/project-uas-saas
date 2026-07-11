"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_USER, logout } from "@/lib/auth";

/* ── Mock user (nanti diganti context/auth provider) ── */

/**
 * Navigasi global untuk halaman terautentikasi.
 * Menampilkan nama pengguna, link profil, dan tombol keluar.
 */
export function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = MOCK_USER;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/dashboard" className="text-lg font-bold text-gray-900">
          Client Gallery Pro
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 sm:flex">
          <Link
            href="/settings"
            className="text-sm text-gray-500 transition hover:text-gray-700"
          >
            Pengaturan
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {initials}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {user.fullName}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
          >
            Keluar
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 sm:hidden"
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t bg-white px-4 py-3 sm:hidden">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <Link
            href="/settings"
            className="block rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
          >
            Pengaturan Profil
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
          >
            Keluar
          </button>
        </div>
      )}
    </nav>
  );
}
