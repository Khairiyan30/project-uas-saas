"use client";

import { useState } from "react";
import Image from "next/image";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { ConfirmModal } from "@/components/ConfirmModal";

interface PhotoCardProps {
  photo: {
    id: string;
    url_original: string;
    url_edited: string | null;
    filename: string;
    is_favorite: boolean;
  };
  isAdmin?: boolean;
  isCover?: boolean;
  onToggleFavorite?: (photoId: string, isFavorite: boolean) => void;
  onSetCover?: (photoId: string, urlOriginal: string) => void;
  onDelete?: (photoId: string) => void;
}

/**
 * Kartu foto di galeri klien — menampilkan gambar dengan tombol favorit,
 * tombol perbandingan sebelum-sesudah (jika url_edited tersedia),
 * dan tombol hapus (khusus admin/fotografer).
 */
export function PhotoCard({ photo, isAdmin, isCover, onToggleFavorite, onSetCover, onDelete }: PhotoCardProps) {
  const [isFavorite, setIsFavorite] = useState(photo.is_favorite);
  const [showCompare, setShowCompare] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggleFavorite = () => {
    const newState = !isFavorite;
    setIsFavorite(newState);
    onToggleFavorite?.(photo.id, newState);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.(photo.id);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
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

        {/* Tombol Hapus (khusus admin) */}
        {isAdmin && (
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Hapus foto"
            className="absolute left-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-red-500 shadow-md opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-red-500 hover:text-white active:scale-90"
          >
            <i className="ri-delete-bin-6-line text-sm" />
          </button>
        )}

        {/* Tombol Set as Cover (khusus admin) */}
        {isAdmin && !isCover && (
          <button
            type="button"
            onClick={() => onSetCover?.(photo.id, photo.url_original)}
            aria-label="Jadikan foto profil proyek"
            title="Jadikan foto profil proyek"
            className="absolute right-2 bottom-2 flex h-8 items-center gap-1 rounded-full bg-white/80 px-2.5 text-xs font-medium text-gray-600 shadow-md opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-white hover:text-[#65195E] active:scale-90"
          >
            <i className="ri-image-edit-line text-sm" />
            <span className="hidden sm:inline">Cover</span>
          </button>
        )}

        {/* Badge Cover */}
        {isCover && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-[#65195E]/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
            <i className="ri-image-edit-line text-xs" />
            Cover
          </span>
        )}

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
          <i className={isFavorite ? "ri-heart-fill text-lg" : "ri-heart-line text-lg"} />
        </button>

        {/* Tombol Perbandingan Sebelum-Sesudah (hanya jika ada url_edited) */}
        {photo.url_edited && (
          <button
            type="button"
            onClick={() => setShowCompare(true)}
            aria-label="Bandingkan sebelum dan sesudah"
            className="absolute left-2 top-2 flex h-8 items-center gap-1 rounded-full bg-white/80 px-2.5 text-xs font-medium text-gray-600 shadow-md transition-all hover:bg-white hover:text-[#65195E]"
          >
            <i className="ri-arrow-left-right-line text-sm" />
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

      {/* Modal konfirmasi hapus foto */}
      <ConfirmModal
        open={showDeleteConfirm}
        title="Hapus Foto"
        message={`Apakah Anda yakin ingin menghapus foto "${photo.filename}" dari proyek ini? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        danger
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
}