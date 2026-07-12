"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

/**
 * Hook untuk subscribe ke perubahan progress_status pada proyek.
 * @param projectId - ID proyek
 * @param initialStatus - Status awal dari props parent (optional)
 */
export function useProjectRealtime(projectId: string, initialStatus?: string) {
  const [status, setStatus] = useState<string>(initialStatus ?? "");

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Initial fetch (sebagai fallback jika initialStatus tidak diberikan)
    if (!initialStatus) {
      supabase
        .from("projects")
        .select("progress_status")
        .eq("id", projectId)
        .single()
        .then(({ data, error }) => {
          if (!error && data) setStatus(data.progress_status);
        });
    }

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "projects",
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          const newStatus = (payload.new as any).progress_status;
          setStatus(newStatus);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, initialStatus]);

  // Update status jika initialStatus berubah dari parent
  useEffect(() => {
    if (initialStatus) setStatus(initialStatus);
  }, [initialStatus]);

  return status;
}
