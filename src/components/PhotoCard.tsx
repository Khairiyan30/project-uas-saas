"use client";

import { useState } from "react";
import Image from "next/image";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";

interface PhotoCardProps {
  photo: {
    id: string;
    url_original: string;
    url_edited: string | null;
    filename: string;
    is_favorite: boolean;
  };
  onToggleFavorite?: (photoId: string, isFavorite: boolean) => void;
}

/**
 * Kartu foto di galeri klien — menampilkan gambar dengan tombol favorit
 * dan tombol perbandingan sebelum-sesudah (jika url_edited tersedia).
 */
export function PhotoCard({ photo, onToggleFavorite }: PhotoCardProps) {
  const [isFavorite, setIsFavorite] = useState(photo.is_favorite);
  const [showCompare, setShowCompare] = useState(false);

  const handleToggleFavorite = () => {
    const newState = !isFavorite;
    setIsFavorite(newState);
    onToggleFavorite?.(photo.id, newState);
    // TODO: panggil API PATCH /api/projects/[id]/photos/[photoId]/favorite
  };

  return (
    <>
      <figure className="group relative overflow-hidden rounded-lg bg-gray-200 shadow-sm transition hover:shadow-md">
        {/* Gambar dengan aspect-ratio tetap */}
        <div className="relative aspect-[4/3]">
          <Image
            src={photo.url_original}
            alt={photo.filename}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Overlay info (hover) */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="text-xs text-white">{photo.filename}</span>
        </div>

        {/* Tombol Favorit */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? "Hapus dari favorit" : "Tambah ke favorit"}
          className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-200 ${
            isFavorite
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white/80 text-gray-400 hover:bg-white hover:text-red-400"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={isFavorite ? 0 : 2}
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>

        {/* Tombol Perbandingan Sebelum-Sesudah (hanya jika ada url_edited) */}
        {photo.url_edited && (
          <button
            type="button"
            onClick={() => setShowCompare(true)}
            aria-label="Bandingkan sebelum dan sesudah"
            className="absolute left-2 top-2 flex h-9 items-center gap-1 rounded-full bg-white/80 px-2.5 text-xs font-medium text-gray-600 shadow-md transition-all hover:bg-white hover:text-blue-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
              />
            </svg>
            <span className="hidden sm:inline">Bandingkan</span>
          </button>
        )}
      </figure>

      {/* Modal perbandingan sebelum-sesudah */}
      {showCompare && photo.url_edited && (
        <BeforeAfterSlider
          urlOriginal={photo.url_original}
          urlEdited={photo.url_edited}
          filename={photo.filename}
          onClose={() => setShowCompare(false)}
        />
      )}
    </>
  );
}
