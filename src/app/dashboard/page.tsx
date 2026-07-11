"use client";

import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuth } from "@/contexts/AuthContext";

/* ── Data proyek kosong (akan diisi dari API/database) ── */
const MOCK_PROJECTS: any[] = [];

const STATUS_ORDER = [
  "Persiapan",
  "Uploading",
  "Proses Edit",
  "Menunggu Reviu",
  "Tahap Kurasi Klien",
  "Selesai",
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
  const { user } = useAuth();
  const projects = sortByStatus(MOCK_PROJECTS);

  if (!isAuthed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Memeriksa sesi…</p>
      </main>
    );
  }

  // Stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    (p) => p.progress_status !== "Selesai"
  ).length;
  const totalPhotos = projects.reduce((sum, p) => sum + p.photo_count, 0);
  const totalFavorites = projects.reduce((sum, p) => sum + p.favorite_count, 0);

  // Proyek Butuh Perhatian: aktif (belum selesai), urutkan berdasarkan revision_count desc
  const projectsNeedingAttention = projects
    .filter((p) => p.progress_status !== "Selesai")
    .sort((a, b) => b.revision_count - a.revision_count);

  return (
    <main className="min-h-screen bg-[#F8F8F8]">
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        <div className="mx-auto max-w-6xl px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Selamat Datang, {user?.fullName?.split(" ")[0] || "Pengguna"}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Berikut ringkasan aktivitas studio Anda hari ini.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-4 gap-4">
            {/* Total Proyek */}
            <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8F8F8] text-[#65195E] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <i className="ri-folder-line text-xl"></i>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Total Proyek</p>
                  <p className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-[#65195E]">{totalProjects}</p>
                </div>
              </div>
            </div>

            {/* Proyek Aktif */}
            <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8F8F8] text-[#91157E] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <i className="ri-time-line text-xl"></i>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Proyek Aktif</p>
                  <p className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-[#91157E]">{activeProjects}</p>
                </div>
              </div>
            </div>

            {/* Total Foto */}
            <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8F8F8] text-[#91157E] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <i className="ri-camera-3-line text-xl"></i>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Total Foto</p>
                  <p className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-[#91157E]">{totalPhotos}</p>
                </div>
              </div>
            </div>

            {/* Foto Favorit */}
            <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8F8F8] text-[#C246C6] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <i className="ri-heart-fill text-xl"></i>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400">Foto Favorit</p>
                  <p className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-[#C246C6]">{totalFavorites}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Proyek Butuh Perhatian */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Proyek Butuh Perhatian
                </h3>
                <p className="mt-0.5 text-xs text-gray-400">
                  Proyek aktif yang perlu ditindaklanjuti segera.
                </p>
              </div>
              <Link
                href="/proyek"
                className="group inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900"
              >
                Lihat Semua
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </Link>
            </div>

            {projectsNeedingAttention.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <i className="ri-check-line text-2xl"></i>
                </div>
                <p className="text-sm font-medium text-gray-900">Semua proyek sudah tertangani!</p>
                <p className="mt-1 text-xs text-gray-400">Tidak ada proyek yang butuh perhatian saat ini.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {projectsNeedingAttention.map((project, idx) => (
                  <div
                    key={project.id}
                    style={{ animationDelay: `${idx * 50}ms` }}
                    className="group flex items-center justify-between rounded-xl border border-gray-50 bg-gray-50/50 px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-200 hover:bg-white hover:shadow-md animate-fadeIn"
                  >
                    <div className="flex items-center gap-4">
                      {/* Thumbnail placeholder */}
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 transition-transform duration-300 group-hover:scale-110">
                        <i className="ri-image-line text-xl"></i>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-black">
                          {project.name}
                        </p>
                        <p className="text-xs text-gray-400">{project.event_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Progress */}
                      <div className="w-32">
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
                      {/* Status */}
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600 transition-colors group-hover:bg-gray-200">
                        {project.progress_status}
                      </span>
                      {/* Action */}
                      <Link
                        href={`/${project.unique_slug}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all duration-300 hover:bg-[#65195E] hover:text-white hover:scale-110 active:scale-95"
                        title="Buka proyek"
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
      </div>
    </main>
  );
}
