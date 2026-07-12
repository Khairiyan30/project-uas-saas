"use client";

import { useProjectRealtime } from "@/hooks/useProjectRealtime";

interface ProgressIndicatorProps {
  projectId: string;
  currentStatus?: string;
}

const STEPS = [
  { value: "Persiapan", label: "Persiapan" },
  { value: "Uploading", label: "Uploading" },
  { value: "Proses Edit", label: "Editing" },
  { value: "Menunggu Review", label: "Review" },
  { value: "Tahap Kurasi Klien", label: "Kurasi Klien" },
  { value: "Selesai", label: "Selesai" }
] as const;

/**
 * Indikator tahap pengerjaan proyek — subscribe Supabase Realtime,
 * auto-update saat fotografer mengubah status tanpa perlu refresh.
 */
export function ProgressIndicator({ projectId, currentStatus: propStatus }: ProgressIndicatorProps) {
  const currentStatus = useProjectRealtime(projectId, propStatus);

  const activeIndex = STEPS.findIndex(
    (step) => step.value.toLowerCase() === currentStatus.toLowerCase()
  );

  if (activeIndex === -1) {
    return (
      <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-700">Status: {currentStatus || "–"}</p>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-lg bg-white p-4 shadow-sm sm:p-6">
      <p className="mb-5 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Tahap Pengerjaan
      </p>
      <div className="flex items-center">
        {STEPS.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;
          return (
            <div key={step.value} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all sm:h-10 sm:w-10 sm:text-sm ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                        ? "bg-[#65195E] text-white ring-4 ring-[#C246C6]/20"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <i className="ri-check-line text-sm sm:text-base text-white" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`mt-2 text-center text-[9px] font-bold leading-tight tracking-tight sm:text-xs ${
                    isActive
                      ? "text-[#65195E]"
                      : isCompleted
                        ? "text-green-600"
                        : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`mx-1 h-0.5 flex-1 sm:mx-2 ${
                    index < activeIndex ? "bg-green-400" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
