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
  if (percent >= 100) return "bg-emerald-500";
  if (percent >= 60) return "bg-blue-500";
  if (percent >= 30) return "bg-amber-400";
  return "bg-gray-300";
}

export function ProjectCard({ project }: ProjectCardProps) {
  const badge = getStatusBadge(project.progress_status);
  const progressColor = getProgressColor(project.progress_percent);

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:border-gray-200 hover:shadow-md">
      {/* Thumbnail + Status Badge */}
      <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {/* Placeholder thumbnail pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Status Badge */}
        <span
          className={`absolute right-3 top-3 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-5">
        {/* Title + Event Type */}
        <h3 className="text-sm font-bold text-gray-900 truncate">
          {project.name}
        </h3>
        <p className="mt-0.5 text-xs text-gray-400">{project.event_type}</p>

        {/* Client slug */}
        <p className="mt-2 text-[10px] text-gray-300 font-mono">
          /{project.unique_slug}
        </p>

        {/* Info badges row */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {project.favorite_count} Dipilih
          </span>
          {project.revision_count > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-orange-600">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
              </svg>
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
            <div className="flex items-center gap-1 text-gray-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[10px] font-semibold">{project.photo_count}</span>
            </div>
            {/* Favorite count */}
            <div className="flex items-center gap-1 text-gray-400">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <span className="text-[10px] font-semibold">{project.favorite_count}</span>
            </div>
            {/* Revision count */}
            <div className="flex items-center gap-1 text-gray-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.182" />
              </svg>
              <span className="text-[10px] font-semibold">{project.revision_count}</span>
            </div>
          </div>

          {/* Detail link */}
          <Link
            href={`/${project.unique_slug}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-400 transition-colors hover:bg-[#1E1E1E] hover:text-white"
            title="Lihat detail proyek"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
