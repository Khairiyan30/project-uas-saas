"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

/**
 * Hook untuk subscribe ke perubahan progress_status pada proyek.
 * Mengembalikan status terkini secara real-time via Supabase Realtime.
 */
export function useProjectRealtime(projectId: string) {
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Initial fetch
    supabase
      .from("projects")
      .select("progress_status")
      .eq("id", projectId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setStatus(data.progress_status);
      });

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
  }, [projectId]);

  return status;
}
