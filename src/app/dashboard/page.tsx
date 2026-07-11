"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ProjectCard } from "@/components/ProjectCard";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { useRequireAuth } from "@/hooks/useRequireAuth";

/* ── Mock data proyek (akan diganti API call) ── */
const MOCK_PROJECTS = [
  {
    id: "1",
    name: "Prewedding Andi & Budi",
    event_type: "Engagement",
    description: "Sesi pemotretan di Pantai Kuta dengan tema sunset.",
    progress_status: "Menunggu Reviu",
    unique_slug: "prewedding-andi-budi",
    created_at: "2026-06-28T10:00:00Z",
    photo_count: 45,
    favorite_count: 12,
    revision_count: 2,
    progress_percent: 65,
  },
  {
    id: "2",
    name: "Wisuda Sari Universitas Udayana",
    event_type: "Graduation",
    description: "",
    progress_status: "Proses Edit",
    unique_slug: "wisuda-sari",
    created_at: "2026-07-01T14:30:00Z",
    photo_count: 32,
    favorite_count: 8,
    revision_count: 1,
    progress_percent: 45,
  },
  {
    id: "3",
    name: "Akad Nikah Rina & Dimas",
    event_type: "Wedding",
    description: "Dokumentasi pernikahan adat Bali di rumah keluarga.",
    progress_status: "Tahap Kurasi Klien",
    unique_slug: "wedding-rina-dimas",
    created_at: "2026-07-05T08:15:00Z",
    photo_count: 120,
    favorite_count: 35,
    revision_count: 5,
    progress_percent: 80,
  },
  {
    id: "4",
    name: "Potret Keluarga Besar Budiman",
    event_type: "Portrait",
    description: "Sesi foto keluarga tahunan di studio.",
    progress_status: "Selesai",
    unique_slug: "keluarga-budiman",
    created_at: "2026-06-15T09:00:00Z",
    photo_count: 25,
    favorite_count: 10,
    revision_count: 0,
    progress_percent: 100,
  },
  {
    id: "5",
    name: "Company Profile PT Maju Jaya",
    event_type: "Event",
    description: "Foto tim & produk untuk company profile.",
    progress_status: "Persiapan",
    unique_slug: "majujaya-profile",
    created_at: "2026-07-10T09:00:00Z",
    photo_count: 0,
    favorite_count: 0,
    revision_count: 0,
    progress_percent: 5,
  },
  {
    id: "6",
    name: "Engagement Putri & Reza",
    event_type: "Engagement",
    description: "Engagement outdoor di kebun teh.",
    progress_status: "Proses Edit",
    unique_slug: "engagement-putri-reza",
    created_at: "2026-07-08T11:00:00Z",
    photo_count: 60,
    favorite_count: 15,
    revision_count: 3,
    progress_percent: 40,
  },
];

const STATUS_ORDER = [
  "Persiapan",
  "Uploading",
  "Proses Edit",
  "Menunggu Reviu",
  "Tahap Kurasi Klien",
  "Selesai",
];

// Mapping status badge ke filter tab
const STATUS_TAB_MAP: Record<string, string> = {
  Booked: "Persiapan",
  Shooting: "Uploading",
  Editing: "Proses Edit",
  Review: "Menunggu Reviu",
  Curation: "Tahap Kurasi Klien",
  Completed: "Selesai",
};

const FILTER_TABS = [
  { label: "Semua", status: null },
  { label: "Booked", status: "Persiapan" },
  { label: "Shooting", status: "Uploading" },
  { label: "Editing", status: "Proses Edit" },
  { label: "Review", status: "Menunggu Reviu" },
  { label: "Completed", status: "Selesai" },
];

function sortByStatus(projects: typeof MOCK_PROJECTS) {
  return [...projects].sort(
    (a, b) =>
      STATUS_ORDER.indexOf(a.progress_status) -
      STATUS_ORDER.indexOf(b.progress_status)
  );
}

/**
 * Dashboard Proyek — halaman utama fotografer.
 * Layout sidebar kiri + konten utama.
 */
export default function DashboardPage() {
  const isAuthed = useRequireAuth();
  const [projects, setProjects] = useState(() => sortByStatus(MOCK_PROJECTS));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isAuthed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Memeriksa sesi…</p>
      </main>
    );
  }

  const handleProjectCreated = (newProject: any) => {
    setProjects((prev) =>
      sortByStatus([
        {
          ...newProject,
          photo_count: 0,
          favorite_count: 0,
          revision_count: 0,
          progress_percent: 5,
        },
        ...prev,
      ])
    );
  };

  // Filter & search
  const filteredProjects = projects.filter((p) => {
    const matchesFilter = !activeFilter || p.progress_status === activeFilter;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.event_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    (p) => p.progress_status !== "Selesai"
  ).length;
  const totalPhotos = projects.reduce((sum, p) => sum + p.photo_count, 0);
  const totalFavorites = projects.reduce((sum, p) => sum + p.favorite_count, 0);

  // Count per filter tab
  const getCountForTab = (status: string | null) => {
    if (!status) return projects.length;
    return projects.filter((p) => p.progress_status === status).length;
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        <div className="mx-auto max-w-6xl px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Dasbor Proyek
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                {totalProjects} proyek aktif
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-lg bg-[#1E1E1E] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Buat Proyek Baru
            </button>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-4 gap-4">
            {/* Total Proyek */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Total Proyek</p>
                  <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
                </div>
              </div>
            </div>

            {/* Proyek Aktif */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Proyek Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">{activeProjects}</p>
                </div>
              </div>
            </div>

            {/* Total Foto */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Total Foto</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPhotos}</p>
                </div>
              </div>
            </div>

            {/* Foto Favorit */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-50 text-pink-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Foto Favorit</p>
                  <p className="text-2xl font-bold text-gray-900">{totalFavorites}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs + Search */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {FILTER_TABS.map((tab) => {
                const count = getCountForTab(tab.status);
                const isActive = activeFilter === tab.status;
                return (
                  <button
                    key={tab.label}
                    onClick={() => setActiveFilter(tab.status)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#1E1E1E] text-white"
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

            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                placeholder="Cari proyek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              />
            </div>
          </div>

          {/* Daftar Proyek */}
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
              <svg className="mb-4 h-16 w-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">
                Tidak ada proyek ditemukan
              </h3>
              <p className="mt-2 max-w-sm text-sm text-gray-500">
                {searchQuery
                  ? `Tidak ditemukan hasil untuk "${searchQuery}"`
                  : "Belum ada proyek dengan status ini."}
              </p>
              {!searchQuery && !activeFilter && (
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-6 rounded-lg bg-[#1E1E1E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Buat Proyek Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Buat Proyek */}
      <CreateProjectModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleProjectCreated}
      />
    </main>
  );
}
