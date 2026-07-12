"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectTable } from "@/components/ProjectTable";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { useRequireAuth } from "@/hooks/useRequireAuth";

/* ── Data proyek kosong ── */
const MOCK_PROJECTS: any[] = [];

const STATUS_ORDER = [
  "Persiapan",
  "Uploading",
  "Proses Edit",
  "Menunggu Reviu",
  "Tahap Kurasi Klien",
  "Selesai",
];

const FILTER_TABS = [
  { label: "Semua", status: null },
  { label: "Booked", status: "Persiapan" },
  { label: "Shooting", status: "Uploading" },
  { label: "Editing", status: "Proses Edit" },
  { label: "Review", status: "Menunggu Reviu" },
  { label: "Completed", status: "Selesai" },
];

type SortOption = "name" | "date" | "status" | "progress";
type ViewMode = "grid" | "table";

function sortByStatus(projects: typeof MOCK_PROJECTS) {
  return [...projects].sort(
    (a, b) =>
      STATUS_ORDER.indexOf(a.progress_status) -
      STATUS_ORDER.indexOf(b.progress_status)
  );
}

function sortProjects(projects: typeof MOCK_PROJECTS, sort: SortOption) {
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
      return sorted.sort((a, b) => b.progress_percent - a.progress_percent);
    default:
      return sorted;
  }
}

/**
 * Halaman Proyek — manajemen proyek lengkap.
 * Fokus pada CRUD, filter, sort, dan switcher view.
 */
export default function ProyekPage() {
  const isAuthed = useRequireAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    async function fetchProjects() {
      const token = typeof window !== "undefined" ? localStorage.getItem("sb-access-token") : null;
      if (!token) return;

      try {
        const res = await fetch("/api/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.projects) {
          // Optimasi: hilangkan fetch foto per proyek, gunakan data proyek dasar langsung
          const projectsWithStats = data.projects.map((project: any) => ({
            ...project,
            photo_count: 0,
            favorite_count: 0,
            revision_count: 0,
            cover_photo_url: project.cover_photo_url || null,
            progress_percent: project.progress_status === "Selesai" ? 100 :
                              project.progress_status === "Tahap Kurasi Klien" ? 80 :
                              project.progress_status === "Menunggu Reviu" ? 60 :
                              project.progress_status === "Proses Edit" ? 40 : 10,
          }));
          setProjects(sortProjects(projectsWithStats, sortBy));
        }
      } catch (err) {
        console.error("Error loading projects:", err);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthed) {
      fetchProjects();
    }
  }, [isAuthed, sortBy]);

  if (!isAuthed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Memeriksa sesi…</p>
      </main>
    );
  }

  const handleProjectCreated = (newProject: any) => {
    setProjects((prev) =>
      sortProjects(
        [
          {
            ...newProject,
            photo_count: 0,
            favorite_count: 0,
            revision_count: 0,
            progress_percent: 5,
          },
          ...prev,
        ],
        sortBy
      )
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

  // Count per filter tab
  const getCountForTab = (status: string | null) => {
    if (!status) return projects.length;
    return projects.filter((p) => p.progress_status === status).length;
  };

  return (
    <main className="min-h-screen bg-[#F8F8F8]">
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        <div className="mx-auto max-w-6xl px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 animate-fadeIn">
                Daftar Proyek
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Kelola semua proyek studio Anda di sini.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="group flex items-center gap-2 rounded-lg bg-[#65195E] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-[#91157E] hover:shadow-md active:scale-[0.98]"
            >
              <i className="ri-add-line text-base transition-transform duration-500 group-hover:rotate-90" />
              Buat Proyek Baru
            </button>
          </div>

          {/* Filter Tabs + Search + View Switcher */}
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

            <div className="flex items-center gap-3">
              {/* Sort dropdown */}
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

              {/* View switcher */}
              <div className="flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-md px-2.5 py-1.5 transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-[#65195E] text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
                  title="Grid view"
                >
                  <i className="ri-grid-line text-base" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`rounded-md px-2.5 py-1.5 transition-all duration-200 ${
                    viewMode === "table"
                      ? "bg-[#65195E] text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
                  title="Table view"
                >
                  <i className="ri-list-check text-base" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 text-base -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari proyek..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-56 rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Daftar Proyek */}
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
                  : "Belum ada proyek dengan status ini."}
              </p>
              {!searchQuery && !activeFilter && (
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="mt-6 rounded-lg bg-[#65195E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#91157E]"
                >
                  Buat Proyek Pertama
                </button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <ProjectTable projects={filteredProjects} />
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