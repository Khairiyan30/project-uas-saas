"use client";

import { useState, useRef } from "react";

interface WatermarkSettingsProps {
  projectId: string;
  currentUrl: string | null;
  currentPosition: string;
  currentOpacity: number;
  currentSize: number;
  onClose: () => void;
  onSaved: () => void;
}

const POSITIONS = [
  { value: "bottom-right", label: "Kanan Bawah" },
  { value: "bottom-left", label: "Kiri Bawah" },
  { value: "top-right", label: "Kanan Atas" },
  { value: "top-left", label: "Kiri Atas" },
  { value: "center", label: "Tengah" },
];

export function WatermarkSettings({
  projectId,
  currentUrl,
  currentPosition,
  currentOpacity,
  currentSize,
  onClose,
  onSaved,
}: WatermarkSettingsProps) {
  const [watermarkUrl, setWatermarkUrl] = useState<string | null>(currentUrl);
  const [position, setPosition] = useState(currentPosition);
  const [opacity, setOpacity] = useState(currentOpacity);
  const [size, setSize] = useState(currentSize);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const token = localStorage.getItem("sb-access-token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/projects/${projectId}/watermark`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setWatermarkUrl(data.watermark_url);
      } else {
        alert(data.error || "Gagal upload watermark");
      }
    } catch {
      alert("Gagal upload watermark");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("sb-access-token");
    try {
      const res = await fetch(`/api/projects/${projectId}/watermark`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ position, opacity, size }),
      });
      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menyimpan");
      }
    } catch {
      alert("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Hapus watermark?")) return;
    const token = localStorage.getItem("sb-access-token");
    try {
      const res = await fetch(`/api/projects/${projectId}/watermark`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setWatermarkUrl(null);
        onSaved();
        onClose();
      }
    } catch {
      alert("Gagal menghapus watermark");
    }
  };

  const positionStyle = () => {
    const base = "absolute pointer-events-none";
    switch (position) {
      case "bottom-right": return `${base} bottom-3 right-3`;
      case "bottom-left": return `${base} bottom-3 left-3`;
      case "top-right": return `${base} top-3 right-3`;
      case "top-left": return `${base} top-3 left-3`;
      case "center": return `${base} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`;
      default: return `${base} bottom-3 right-3`;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Pengaturan Watermark</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {/* Upload area */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">Logo Watermark</label>
          {watermarkUrl ? (
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <img src={watermarkUrl} alt="Watermark" className="h-10 w-auto rounded" />
              <span className="text-xs text-gray-500">Terkonfigurasi</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="ml-auto rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
              >
                Ganti
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6 transition hover:border-[#65195E]/40 hover:bg-[#65195E]/5">
              {uploading ? (
                <div className="flex items-center gap-2">
                  <i className="ri-loader-4-line animate-spin text-gray-400" />
                  <span className="text-xs text-gray-500">Mengupload…</span>
                </div>
              ) : (
                <>
                  <i className="ri-upload-2-line text-2xl text-gray-300" />
                  <span className="mt-1 text-xs text-gray-400">Klik untuk upload logo (PNG, WebP, SVG)</span>
                  <span className="text-[10px] text-gray-300">Maks 512KB</span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/webp,image/svg+xml"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/webp,image/svg+xml"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        {/* Position */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">Posisi</label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#65195E] cursor-pointer"
          >
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Opacity */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">
            Opacity ({Math.round(opacity * 100)}%)
          </label>
          <input
            type="range"
            min={0.1}
            max={1.0}
            step={0.05}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full accent-[#65195E]"
          />
        </div>

        {/* Size */}
        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-semibold text-gray-700">
            Ukuran ({size}%)
          </label>
          <input
            type="range"
            min={5}
            max={50}
            step={1}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full accent-[#65195E]"
          />
        </div>

        {/* Preview */}
        {watermarkUrl && (
          <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
            <div className="relative aspect-[16/9] bg-gradient-to-br from-gray-300 to-gray-400">
              <img
                src={watermarkUrl}
                alt="Preview watermark"
                className={positionStyle()}
                style={{
                  maxWidth: `${size}%`,
                  opacity,
                }}
              />
            </div>
            <p className="py-1.5 text-center text-[10px] text-gray-400">Preview</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {watermarkUrl && (
            <button
              onClick={handleRemove}
              className="rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
            >
              Hapus Watermark
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !watermarkUrl}
            className="flex-1 rounded-lg bg-[#65195E] py-2 text-xs font-semibold text-white transition hover:bg-[#91157E] disabled:bg-gray-400"
          >
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
