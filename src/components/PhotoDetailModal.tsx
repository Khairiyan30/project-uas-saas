"use client";

import { useEffect } from "react";
import Image from "next/image";
import type { Photo } from "@/lib/types";

interface PhotoDetailModalProps {
  photo: Photo;
  onClose: () => void;
}

export function PhotoDetailModal({ photo, onClose }: PhotoDetailModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative flex h-full w-full max-h-[95vh] max-w-5xl flex-col overflow-hidden rounded-2xl bg-black shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
        >
          <i className="ri-close-line text-lg" />
        </button>

        {/* Photo area */}
        <div className="relative flex min-h-48 flex-1 items-center justify-center bg-black">
          <Image
            src={photo.url_original}
            alt={photo.filename}
            fill
            className="object-contain"
            sizes="100vw"
          />
          {photo.url_edited && (
            <a
              href={photo.url_edited}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-white"
            >
              <i className="ri-arrow-right-left-line mr-1" />
              Lihat Editan
            </a>
          )}
        </div>

        {/* Info bar */}
        <div className="border-t border-white/10 bg-black/80 px-4 py-2.5">
          <p className="text-xs text-white/70 truncate">{photo.filename}</p>
        </div>
      </div>
    </div>
  );
}
