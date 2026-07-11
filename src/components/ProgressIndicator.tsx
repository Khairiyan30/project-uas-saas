"use client";

import { useProjectRealtime } from "@/hooks/useProjectRealtime";

interface ProgressIndicatorProps {
  projectId: string;
}

const STEPS = ["Persiapan", "Proses Edit", "Menunggu Reviu", "Selesai"] as const;

/**
 * Indikator tahap pengerjaan proyek — subscribe Supabase Realtime,
 * auto-update saat fotografer mengubah status tanpa perlu refresh.
 */
export function ProgressIndicator({ projectId }: ProgressIndicatorProps) {
  const currentStatus = useProjectRealtime(projectId);

  const activeIndex = STEPS.findIndex(
    (step) => step.toLowerCase() === currentStatus.toLowerCase()
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
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400">
        Tahap Pengerjaan
      </p>
      <div className="flex items-center">
        {STEPS.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;
          return (
            <div key={step} className="flex flex-1 items-center">
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
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`mt-1.5 text-center text-[10px] leading-tight sm:text-xs ${
                    isActive
                      ? "font-semibold text-[#65195E]"
                      : isCompleted
                        ? "font-medium text-green-600"
                        : "text-gray-400"
                  }`}
                >
                  {step}
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
