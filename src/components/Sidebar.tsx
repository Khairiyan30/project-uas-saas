"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Panggil API logout sesungguhnya
    fetch("/api/auth/logout", { method: "POST" })
      .then(() => {
        logout();
        localStorage.removeItem("sb-access-token");
        router.push("/login");
      })
      .catch(() => {
        logout();
        localStorage.removeItem("sb-access-token");
        router.push("/login");
      });
  };

  const menuItems = [
    {
      name: "Dasbor",
      href: "/dashboard",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      name: "Proyek",
      href: "/dashboard?tab=proyek", // Atau bisa tetap di dashboard dengan parameter / filter
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      name: "Pengaturan",
      href: "/settings",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-gray-100 bg-white px-4 py-6">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.74 19.74A9.75 9.75 0 0024 12c0-5.385-4.365-9.75-9.75-9.75S4.5 6.615 4.5 12c0 2.213.738 4.254 1.986 5.903L4.5 21l3.097-1.986A9.722 9.722 0 0012 19.75c2.213 0 4.254-.738 5.903-1.986L21 21l-1.26-1.26z" />
          </svg>
        </div>
        <span className="text-lg font-bold tracking-tight text-gray-900 font-serif">Freelens</span>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 space-y-1.5 px-1">
        {menuItems.map((item) => {
          // Menentukan apakah menu aktif.
          // Untuk "Proyek", dia aktif jika pathname = /dashboard dan ada parameter tab=proyek.
          // Untuk "Dasbor", aktif jika pathname = /dashboard dan tidak ada parameter tab=proyek.
          const isProjectTab = pathname === "/dashboard" && typeof window !== "undefined" && window.location.search.includes("tab=proyek");
          let isActive = false;
          if (item.name === "Proyek") {
            isActive = isProjectTab;
          } else if (item.name === "Dasbor") {
            isActive = pathname === "/dashboard" && !isProjectTab;
          } else {
            isActive = pathname === item.href;
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-150 ${
                isActive
                  ? "bg-[#1E1E1E] text-white"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="border-t border-gray-100 pt-6 px-1">
        {/* Profile Card */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white uppercase">
            FS
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-gray-900">Foto Studio</p>
            <p className="truncate text-[10px] text-gray-400">studio@email.com</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100/50 text-red-600">
            <span className="font-bold text-sm">N</span>
          </div>
          Keluar
        </button>
      </div>
    </aside>
  );
}