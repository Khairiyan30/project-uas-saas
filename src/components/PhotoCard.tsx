"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { ConfirmModal } from "@/components/ConfirmModal";
import type { Photo } from "@/lib/types";

interface WatermarkConfig {
  url: string;
  position: string;
  opacity: number;
  size: number;
}

interface PhotoCardProps {
  photo: Photo;
  isOwner?: boolean;
  isCover?: boolean;
  watermark?: WatermarkConfig | null;
  onToggleFavorite?: (photoId: string, isFavorite: boolean) => void;
  onSetCover?: (photoId: string, urlOriginal: string) => void;
  onDelete?: (photoId: string) => void;
  onApprove?: (photoId: string) => void;
  onReject?: (photoId: string) => void;
}

export function PhotoCard({ photo, isOwner, isCover, watermark, onToggleFavorite, onSetCover, onDelete, onApprove, onReject }: PhotoCardProps) {
  const [isFavorite, setIsFavorite] = useState(photo.is_favorite);
  const [status, setStatus] = useState(photo.status);
  const [showCompare, setShowCompare] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setIsFavorite(photo.is_favorite);
    setStatus(photo.status);
  }, [photo.is_favorite, photo.status]);

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

  const handleApprove = () => {
    setStatus("approved");
    onApprove?.(photo.id);
  };

  const handleReject = () => {
    setStatus("rejected");
    onReject?.(photo.id);
  };

  const statusBadge = () => {
    if (status === "approved") {
      return (
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-green-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
          <i className="ri-check-line text-xs" />
          Disetujui
        </span>
      );
    }
    if (status === "rejected") {
      return (
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
          <i className="ri-close-line text-xs" />
          Ditolak
        </span>
      );
    }
    return null;
  };

  return (
    <>
      <figure className="group relative overflow-hidden rounded-lg bg-gray-200 shadow-sm transition hover:shadow-md">
        <div className="relative aspect-[4/3]">
          <Image
            src={photo.url_original}
            alt={photo.filename}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="text-xs text-white">{photo.filename}</span>
        </div>

        {isOwner && (
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Hapus foto"
            className="absolute left-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-red-500 shadow-md opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-red-500 hover:text-white active:scale-90"
          >
            <i className="ri-delete-bin-6-line text-sm" />
          </button>
        )}

        {isOwner && !isCover && (
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

        {status === "approved" && isCover && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-green-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
            <i className="ri-check-line text-xs" />
            Cover
          </span>
        )}
        {status !== "approved" && isCover && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-[#65195E]/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
            <i className="ri-image-edit-line text-xs" />
            Cover
          </span>
        )}

        {!isCover && statusBadge()}

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

        {/* Approval buttons — only for clients */}
        {!isOwner && status === "pending" && (
          <div className="absolute inset-x-0 bottom-0 flex gap-1 p-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={handleApprove}
              className="flex flex-1 items-center justify-center gap-1 rounded-md bg-green-600 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-green-700 active:scale-95"
            >
              <i className="ri-check-line text-xs" />
              Setuju
            </button>
            <button
              type="button"
              onClick={handleReject}
              className="flex flex-1 items-center justify-center gap-1 rounded-md bg-red-600 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-95"
            >
              <i className="ri-close-line text-xs" />
              Tolak
            </button>
          </div>
        )}

        {/* Watermark overlay — only for clients */}
        {!isOwner && watermark && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              ...(watermark.position === "center"
                ? { display: "flex", alignItems: "center", justifyContent: "center" }
                : {}),
            }}
          >
            <img
              src={watermark.url}
              alt=""
              className="pointer-events-none select-none"
              style={{
                opacity: watermark.opacity,
                maxWidth: `${watermark.size}%`,
                position: watermark.position !== "center" ? "absolute" : "relative",
                bottom: watermark.position === "bottom-right" || watermark.position === "bottom-left" ? "8px" : "auto",
                top: watermark.position === "top-right" || watermark.position === "top-left" ? "8px" : "auto",
                right: watermark.position === "bottom-right" || watermark.position === "top-right" ? "8px" : "auto",
                left: watermark.position === "bottom-left" || watermark.position === "top-left" ? "8px" : "auto",
              }}
            />
          </div>
        )}
      </figure>

      {showCompare && photo.url_edited && (
        <BeforeAfterSlider
          urlOriginal={photo.url_original}
          urlEdited={photo.url_edited}
          filename={photo.filename}
          onClose={() => setShowCompare(false)}
        />
      )}

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
