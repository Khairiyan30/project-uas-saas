"use client";

import Link from "next/link";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    event_type: string;
    description: string;
    progress_status: string;
    unique_slug: string;
    created_at: string;
    photo_count: number;
    favorite_count: number;
    revision_count: number;
    progress_percent: number;
  };
}

// Mapping progress_status ke badge label + warna soft
const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  Persiapan: {
    label: "Booked",
    className: "bg-sky-50 text-sky-600 border-sky-200",
  },
  Uploading: {
    label: "Shooting",
    className: "bg-amber-50 text-amber-600 border-amber-200",
  },
  "Proses Edit": {
    label: "Editing",
    className: "bg-violet-50 text-violet-600 border-violet-200",
  },
  "Menunggu Reviu": {
    label: "Review",
    className: "bg-pink-50 text-pink-600 border-pink-200",
  },
  "Tahap Kurasi Klien": {
    label: "Curation",
    className: "bg-orange-50 text-orange-600 border-orange-200",
  },
  Selesai: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
};

function getStatusBadge(status: string) {
  return STATUS_BADGE[status] || {
    label: status,
    className: "bg-gray-50 text-gray-600 border-gray-200",
  };
}

// Progress bar color based on percent
function getProgressColor(percent: number): string {
  if (percent >= 100) return "bg-[#65195E]";
  if (percent >= 60) return "bg-[#91157E]";
  if (percent >= 30) return "bg-[#C246C6]";
  return "bg-gray-300";
}

export function ProjectCard({ project }: ProjectCardProps) {
  const badge = getStatusBadge(project.progress_status);
  const progressColor = getProgressColor(project.progress_percent);

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-lg">
      {/* Thumbnail + Status Badge */}
      <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {/* Placeholder thumbnail pattern */}
        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
          <i className="ri-image-line text-5xl text-gray-300 transition-colors duration-300 group-hover:text-gray-400" />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Status Badge */}
        <span
          className={`absolute right-3 top-3 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-all duration-300 shadow-sm group-hover:scale-105 ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-5">
        {/* Title + Event Type */}
        <h3 className="text-sm font-bold text-gray-900 truncate transition-colors duration-200 group-hover:text-black">
          {project.name}
        </h3>
        <p className="mt-0.5 text-xs text-gray-400">{project.event_type}</p>

        {/* Client slug */}
        <p className="mt-2 text-[10px] text-gray-300 font-mono transition-colors duration-200 group-hover:text-gray-400">
          /{project.unique_slug}
        </p>

        {/* Info badges row */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600 transition-colors duration-200 group-hover:bg-gray-200">
            <i className="ri-check-line text-xs" />
            {project.favorite_count} Dipilih
          </span>
          {project.revision_count > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-orange-600 transition-colors duration-200 group-hover:bg-orange-100">
              <i className="ri-refresh-line text-xs" />
              {project.revision_count} Revisi
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-medium text-gray-400">Progress</span>
            <span className="text-[10px] font-bold text-gray-500">{project.progress_percent}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${project.progress_percent}%` }}
            />
          </div>
        </div>

        {/* Bottom stats + action */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
          <div className="flex items-center gap-3">
            {/* Foto count */}
            <div className="flex items-center gap-1 text-gray-400 transition-colors duration-200 group-hover:text-gray-500">
              <i className="ri-camera-3-line text-sm" />
              <span className="text-[10px] font-semibold">{project.photo_count}</span>
            </div>
            {/* Favorite count */}
            <div className="flex items-center gap-1 text-gray-400 transition-colors duration-200 group-hover:text-gray-500">
              <i className="ri-heart-fill text-sm" />
              <span className="text-[10px] font-semibold">{project.favorite_count}</span>
            </div>
            {/* Revision count */}
            <div className="flex items-center gap-1 text-gray-400 transition-colors duration-200 group-hover:text-gray-500">
              <i className="ri-refresh-line text-sm" />
              <span className="text-[10px] font-semibold">{project.revision_count}</span>
            </div>
          </div>

          {/* Detail link */}
          <Link
            href={`/${project.unique_slug}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-400 transition-all duration-300 hover:bg-[#65195E] hover:text-white hover:scale-110 active:scale-95"
            title="Lihat detail proyek"
          >
            <i className="ri-arrow-right-line text-base" />
          </Link>
        </div>
      </div>
    </div>
  );
}
