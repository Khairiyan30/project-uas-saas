"use client";

import { useMemo, useState } from "react";
import { ClientSidebar } from "@/components/ClientSidebar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useProjects } from "@/hooks/useProjects";
import Link from "next/link";
import type { Project } from "@/lib/types";

const FILTER_TABS = [
  { label: "Semua", status: null as string | null },
  { label: "Review", status: "Menunggu Review" },
  { label: "Kurasi", status: "Tahap Kurasi Klien" },
  { label: "Completed", status: "Selesai" },
];

type SortOption = "name" | "date" | "status" | "progress";

const STATUS_ORDER = [
  "Persiapan", "Uploading", "Proses Edit",
  "Menunggu Review", "Tahap Kurasi Klien", "Selesai",
];

function sortProjects(projects: Project[], sort: SortOption): Project[] {
  const sorted = [...projects];
  switch (sort) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "date":
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case "status":
      return sorted.sort(
        (a, b) =>
          STATUS_ORDER.indexOf(a.progress_status) -
          STATUS_ORDER.indexOf(b.progress_status)
      );
    case "progress":
      return sorted.sort((a, b) => (b.progress_percent ?? 0) - (a.progress_percent ?? 0));
    default:
      return sorted;
  }
}

export default function ClientProjectsPage() {
  const isAuthed = useRequireAuth();
  const { projects, loading } = useProjects(isAuthed);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");

  const sortedProjects = useMemo(() => sortProjects(projects, sortBy), [projects, sortBy]);

  if (!isAuthed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Memeriksa sesi…</p>
      </main>
    );
  }

  const filteredProjects = sortedProjects.filter((p) => {
    const matchesFilter = !activeFilter || p.progress_status === activeFilter;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.event_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCountForTab = (status: string | null) => {
    if (!status) return sortedProjects.length;
    return sortedProjects.filter((p) => p.progress_status === status).length;
  };

  return (
    <main className="min-h-screen bg-[#F8F8F8]">
      <ClientSidebar />

      <div className="lg:ml-64 min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-4 pt-16 sm:px-8 sm:py-8 sm:pt-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 animate-fadeIn">
                Proyek Saya
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Semua proyek yang dibagikan oleh fotografer.
              </p>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {FILTER_TABS.map((tab) => {
                const count = getCountForTab(tab.status);
                const isActive = activeFilter === tab.status;
                return (
                  <button
                    key={tab.label}
                    onClick={() => setActiveFilter(tab.status)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#65195E] text-white"
                        : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 ${isActive ? "text-gray-300" : "text-gray-400"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex items-center">
                <i className="ri-sort-asc absolute left-3 text-base pointer-events-none text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none rounded-lg border border-gray-200 bg-white pl-9 pr-8 py-2 text-xs font-semibold text-gray-600 outline-none transition-all hover:border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 cursor-pointer"
                >
                  <option value="date">Terbaru</option>
                  <option value="name">Nama A-Z</option>
                  <option value="status">Status</option>
                  <option value="progress">Progress</option>
                </select>
                <i className="ri-arrow-down-s-line absolute right-2.5 text-base pointer-events-none text-gray-400" />
              </div>

              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 text-base -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari proyek..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-56 rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
                  <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-gray-100" />
                  <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-gray-100" />
                  <div className="mt-4 h-1.5 w-full animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
              <i className="ri-folder-line mb-4 text-6xl text-gray-200" />
              <h3 className="text-lg font-medium text-gray-900">
                Tidak ada proyek ditemukan
              </h3>
              <p className="mt-2 max-w-sm text-sm text-gray-500">
                {searchQuery
                  ? `Tidak ditemukan hasil untuk "${searchQuery}"`
                  : "Belum ada proyek yang dibagikan kepada Anda."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <Link href={`/${project.unique_slug}`}>
                    <div className="mb-4 flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
                      {project.cover_photo_url ? (
                        <img
                          src={project.cover_photo_url}
                          alt={project.name}
                          className="h-full w-full rounded-xl object-cover"
                        />
                      ) : (
                        <i className="ri-image-line text-4xl text-gray-300" />
                      )}
                    </div>
                  </Link>
                  <div className="mb-3">
                    <Link href={`/${project.unique_slug}`}>
                      <h3 className="text-sm font-bold text-gray-900 transition-colors hover:text-[#65195E]">
                        {project.name}
                      </h3>
                    </Link>
                    <p className="mt-0.5 text-xs text-gray-400">{project.event_type}</p>
                  </div>
                  <div className="mb-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-gray-400">Progress</span>
                      <span className="text-[10px] font-bold text-gray-500">{project.progress_percent}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-[#91157E] transition-all duration-700"
                        style={{ width: `${project.progress_percent}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600">
                      {project.progress_status}
                    </span>
                    <Link
                      href={`/${project.unique_slug}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-400 transition-all hover:bg-[#65195E] hover:text-white"
                      title="Lihat galeri"
                    >
                      <i className="ri-arrow-right-line text-base"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
