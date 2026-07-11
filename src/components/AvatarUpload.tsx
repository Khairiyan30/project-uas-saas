"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface AvatarUploadProps {
  /** URL awal avatar (jika ada) */
  initialUrl?: string | null;
  /** Inisial nama (ditampilkan saat tidak ada foto) */
  initialName?: string;
  /** Callback ketika avatar berubah — menerima data URL lokal */
  onChange?: (dataUrl: string | null) => void;
  /** Callback error (misal file terlalu besar) */
  onError?: (message: string) => void;
}

/**
 * Komponen unggah foto profil dengan pratinjau lokal.
 * Mendukung: preview instant via FileReader, validasi tipe & ukuran.
 */
export function AvatarUpload({
  initialUrl = null,
  initialName = "",
  onChange,
  onError,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = (initialName || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input agar file yang sama bisa dipilih ulang
    e.target.value = "";

    if (!file.type.startsWith("image/")) {
      onError?.("File harus berupa gambar (JPG, PNG, atau GIF)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      onError?.("Ukuran file maksimal 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      onChange?.(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      {/* Preview */}
      <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gray-200">
        {preview ? (
          <Image
            src={preview}
            alt="Foto profil"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-gray-400">
            {initials}
          </div>
        )}
      </div>

      {/* Controls */}
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
        >
          {preview ? "Ganti Foto Profil" : "Unggah Foto Profil"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="mt-1 text-xs text-gray-400">
          JPG, PNG atau GIF. Maksimal 2MB.
        </p>
      </div>
    </div>
  );
}
