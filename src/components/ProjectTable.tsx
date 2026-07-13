"use client";

import { useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/types";

interface ProjectTableProps {
  projects: Project[];
  onDelete?: (projectId: string) => void;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  Persiapan: { label: "Booked", className: "bg-sky-50 text-sky-600 border-sky-200" },
  Uploading: { label: "Shooting", className: "bg-amber-50 text-amber-600 border-amber-200" },
  "Proses Edit": { label: "Editing", className: "bg-violet-50 text-violet-600 border-violet-200" },
  "Menunggu Review": { label: "Review", className: "bg-pink-50 text-pink-600 border-pink-200" },
  "Tahap Kurasi Klien": { label: "Curation", className: "bg-orange-50 text-orange-600 border-orange-200" },
  Selesai: { label: "Completed", className: "bg-emerald-50 text-emerald-600 border-emerald-200" },
};

function getStatusBadge(status: string) {
  return STATUS_BADGE[status] || { label: status, className: "bg-gray-50 text-gray-600 border-gray-200" };
}

export function ProjectTable({ projects, onDelete }: ProjectTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  return (
    <><div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Proyek
            </th>
            <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Status
            </th>
            <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Foto
            </th>
            <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Favorit
            </th>
            <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Revisi
            </th>
            <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Progress
            </th>
            <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, index) => {
            const badge = getStatusBadge(project.progress_status);
            return (
              <tr
                key={project.id}
                className={`border-b border-gray-50 transition hover:bg-gray-50/50 ${
                  index % 2 === 0 ? "" : "bg-gray-50/30"
                }`}
              >
                {/* Proyek */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-400">
                      {project.cover_photo_url ? (
                        <img
                          src={project.cover_photo_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <i className="ri-image-line text-base" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                        {project.name}
                      </p>
                      <p className="text-[10px] text-gray-400">{project.event_type}</p>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </td>

                {/* Foto */}
                <td className="px-5 py-4 text-center">
                  <span className="text-sm font-semibold text-gray-700">{project.photo_count}</span>
                </td>

                {/* Favorit */}
                <td className="px-5 py-4 text-center">
                  <span className="text-sm font-semibold text-gray-700">{project.favorite_count}</span>
                </td>

                {/* Revisi */}
                <td className="px-5 py-4 text-center">
                  <span className={`text-sm font-semibold ${project.revision_count > 0 ? "text-orange-600" : "text-gray-400"}`}>
                    {project.revision_count}
                  </span>
                </td>

                {/* Progress */}
                <td className="px-5 py-4">
                  <div className="w-full max-w-[120px]">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-500">{project.progress_percent ?? 0}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          (project.progress_percent ?? 0) >= 100 ? "bg-[#65195E]" :
                          (project.progress_percent ?? 0) >= 60 ? "bg-[#91157E]" :
                          (project.progress_percent ?? 0) >= 30 ? "bg-[#C246C6]" : "bg-gray-300"
                        }`}
                        style={{ width: `${project.progress_percent ?? 0}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Aksi */}
                <td className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(project)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                      title="Hapus proyek"
                    >
                      <i className="ri-delete-bin-line text-base" />
                    </button>
                    <Link
                      href={`/${project.unique_slug}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-[#65195E] hover:text-white"
                      title="Buka proyek"
                    >
                      <i className="ri-arrow-right-line text-base" />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && onDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-fadeIn">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <i className="ri-delete-bin-6-line text-lg text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Hapus Proyek</h3>
                <p className="text-xs text-gray-400">Tindakan ini tidak bisa dibatalkan.</p>
              </div>
            </div>
            <p className="mb-5 text-sm text-gray-600">
              Apakah Anda yakin ingin menghapus <strong>{deleteTarget.name}</strong>? Semua foto dan data terkait akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => { onDelete(deleteTarget.id); setDeleteTarget(null); }}
                className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
  </>
  );
}
