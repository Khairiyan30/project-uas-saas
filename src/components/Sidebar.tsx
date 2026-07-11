"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout: authLogout } = useAuth();

  const handleLogout = () => {
    authLogout();
  };

  const menuItems = [
    {
      name: "Dasbor",
      href: "/dashboard",
      icon: <div className="h-5 w-5 bg-current" style={{ maskImage: 'url(https://cdn.jsdelivr.net/npm/remixicon@4.9.1/icons/System/dashboard-line.svg)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskImage: 'url(https://cdn.jsdelivr.net/npm/remixicon@4.9.1/icons/System/dashboard-line.svg)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center' }} />,
    },
    {
      name: "Proyek",
      href: "/proyek",
      icon: <div className="h-5 w-5 bg-current" style={{ maskImage: 'url(https://cdn.jsdelivr.net/npm/remixicon@4.9.1/icons/Document/folders-line.svg)', maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskImage: 'url(https://cdn.jsdelivr.net/npm/remixicon@4.9.1/icons/Document/folders-line.svg)', WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center' }} />,
    },
    {
      name: "Pengaturan",
      href: "/settings",
      icon: <i className="ri-settings-3-line"></i>,
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-gray-100 bg-white px-4 py-6">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden shadow-sm transition-transform duration-300 hover:rotate-12">
          <img src="/logo.png" alt="Shootlink Logo" className="h-full w-full object-cover" />
        </div>
        <span className="text-lg font-bold tracking-tight text-gray-900 font-serif transition-colors hover:text-gray-700">Shootlink</span>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 space-y-1.5 px-1">
        {menuItems.map((item) => {
          let isActive = pathname === item.href;
          if (item.name === "Dasbor") {
            isActive = pathname === "/dashboard";
          } else if (item.name === "Proyek") {
            isActive = pathname === "/proyek";
          } else if (item.name === "Pengaturan") {
            isActive = pathname === "/settings";
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 active:scale-[0.98] ${
                isActive
                  ? "bg-[#65195E] text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className={`text-lg transition-transform duration-300 ${isActive ? "" : "group-hover:scale-110"}`}>
                {item.icon}
              </span>
              {item.name}
              {isActive && (
                <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="border-t border-gray-100 pt-6 px-1">
        {/* Profile Card */}
        <div className="mb-4 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-black text-xs font-bold text-white uppercase ring-2 ring-white shadow-sm">
            {user?.fullName
              ? user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-gray-900">{user?.fullName || "Loading..."}</p>
            <p className="truncate text-[10px] text-gray-400">{user?.email || "loading..."}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-50 active:scale-[0.98]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100/50 text-red-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-red-200/80">
            <i className="ri-logout-circle-line text-base"></i>
          </div>
          Keluar
        </button>
      </div>
    </aside>
  );
}