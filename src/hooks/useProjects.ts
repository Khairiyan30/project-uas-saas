"use client";

import { useState, useEffect, useCallback } from "react";
import type { Project, ProjectsResponse } from "@/lib/types";

const STATUS_ORDER = [
  "Persiapan", "Uploading", "Proses Edit",
  "Menunggu Review", "Tahap Kurasi Klien", "Selesai",
];

function calcProgressPercent(status: string): number {
  switch (status) {
    case "Selesai": return 100;
    case "Tahap Kurasi Klien": return 80;
    case "Menunggu Review": return 60;
    case "Proses Edit": return 40;
    default: return 10;
  }
}

export function enrichProject(project: Project): Project {
  return {
    ...project,
    photo_count: project.photo_count ?? 0,
    favorite_count: project.favorite_count ?? 0,
    revision_count: 0,
    cover_photo_url: project.cover_photo_url || null,
    progress_percent: calcProgressPercent(project.progress_status),
  };
}

export function sortByStatus(projects: Project[]): Project[] {
  return [...projects].sort(
    (a, b) => STATUS_ORDER.indexOf(a.progress_status) - STATUS_ORDER.indexOf(b.progress_status)
  );
}

export function useProjects(enabled = true) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("sb-access-token") : null;
    if (!token) return;

    try {
      const res = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: ProjectsResponse = await res.json();
      if (res.ok && data.projects) {
        setProjects(data.projects.map(enrichProject));
      }
    } catch (err) {
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchProjects();
    }
  }, [fetchProjects, enabled]);

  return { projects, setProjects, loading, refetch: fetchProjects };
}
