"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { PhotoCard } from "@/components/PhotoCard";
import { PhotoDetailModal } from "@/components/PhotoDetailModal";
import { WatermarkSettings } from "@/components/WatermarkSettings";
import { InviteClientModal } from "@/components/InviteClientModal";
import { useAuth } from "@/contexts/AuthContext";
import type { Project, Photo, UploadQueueItem } from "@/lib/types";

const STEPS = ["Persiapan", "Uploading", "Proses Edit", "Menunggu Review", "Tahap Kurasi Klien", "Selesai"] as const;

export default function GalleryPage() {
  const params = useParams();
  const router = useRouter();
  const { user: loggedInUser, isLoading: authLoading } = useAuth();
  const slug = params.slug as string;

  const [project, setProject] = useState<Project | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State untuk mode akses
  const [isOwner, setIsOwner] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  
  // State untuk edit detail proyek
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", event_type: "", description: "" });
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  
  // State untuk upload foto
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Copy status
  const [copied, setCopied] = useState(false);

  // State untuk invite client
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Fetch project detail & photos
  const fetchProjectData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Ambil data proyek secara publik via slug (sertakan token jika login)
      const token = typeof window !== "undefined" ? localStorage.getItem("sb-access-token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`/api/gallery/${slug}`, { headers });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mengambil data proyek");
        setLoading(false);
        return;
      }

      setProject(data.project);
      setPhotos(data.photos || []);
      setEditForm({
        name: data.project.name,
        event_type: data.project.event_type || "",
        description: data.project.description || "",
      });

      setIsOwner(data.isOwner || false);
      setIsClient(data.isClient || false);
    } catch (err) {
      setError("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  }, [slug, loggedInUser]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  // Handle progress status change
  const handleProgressChange = async (newStatus: string) => {
    if (!project || !isOwner) return;

    try {
      const token = localStorage.getItem("sb-access-token");
      const res = await fetch(`/api/projects/${project.id}/progress`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ progress_status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && project) {
        setProject({ ...project, progress_status: newStatus });
        router.refresh();
      } else {
        alert(data.error || "Gagal mengubah status progres");
      }
    } catch {
      alert("Terjadi kesalahan koneksi");
    }
  };

  // Handle save detail proyek
  const handleSaveDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !isOwner) return;

    setIsSavingDetail(true);
    try {
      const token = localStorage.getItem("sb-access-token");
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name.trim(),
          event_type: editForm.event_type.trim(),
          description: editForm.description.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.project) {
        setProject((prev) => prev ? {
          ...prev,
          name: data.project.name,
          event_type: data.project.event_type,
          description: data.project.description,
        } : prev);
        setIsEditing(false);
      } else {
        alert(data.error || "Gagal menyimpan detail proyek");
      }
    } catch {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setIsSavingDetail(false);
    }
  };

  // Handle file upload dengan validasi client-side
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !project || !isOwner) return;

    const fileList = Array.from(files);
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    const maxSize = 20 * 1024 * 1024; // 20MB

    for (const file of fileList) {
      if (!allowedTypes.includes(file.type)) {
        setUploadError(`Tipe file "${file.type}" tidak didukung. Gunakan JPEG, PNG, WebP, atau AVIF.`);
        e.target.value = "";
        return;
      }
      if (file.size > maxSize) {
        setUploadError(`File "${file.name}" terlalu besar (maks 20MB).`);
        e.target.value = "";
        return;
      }
    }

    setIsUploading(true);
    setUploadError("");

    const token = localStorage.getItem("sb-access-token");
    if (!token && fileList.length > 0) return;

    // Siapkan upload queue state
    const newQueue = fileList.map(f => ({ name: f.name, progress: 0, status: "waiting" as const }));
    setUploadQueue(newQueue);

    // Refresh token helper — baca ulang dari localStorage setiap kali
    // (supaya tidak expired saat upload banyak file berurutan)
    const getToken = () => localStorage.getItem("sb-access-token");

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setUploadQueue(prev => {
        const copy = [...prev];
        copy[i].status = "uploading";
        return copy;
      });

      const formData = new FormData();
      formData.append("file", file);

      try {
        const t = getToken();
        if (!t) {
          setUploadError("Sesi login habis. Silakan refresh halaman.");
          break;
        }
        const res = await fetch(`/api/projects/${project.id}/photos`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${t}`,
          },
          body: formData,
        });

        const data = await res.json();

        if (res.ok && data.photo) {
          setPhotos(prev => [...prev, data.photo]);
          setUploadQueue(prev => {
            const copy = [...prev];
            copy[i].status = "success";
            copy[i].progress = 100;
            return copy;
          });
        } else {
          setUploadQueue(prev => {
            const copy = [...prev];
            copy[i].status = "error";
            return copy;
          });
          setUploadError(data.error || `Gagal mengunggah file ${file.name}`);
        }
      } catch (err) {
        setUploadQueue(prev => {
          const copy = [...prev];
          copy[i].status = "error";
          return copy;
        });
        setUploadError("Kesalahan jaringan saat mengunggah foto");
      }
    }

    setIsUploading(false);
    // Bersihkan file input
    e.target.value = "";
  };

  // Salin Tautan
  const handleCopyLink = () => {
    if (typeof window === "undefined" || !project) return;
    const galleryUrl = `${window.location.origin}/${project.unique_slug}`;
    navigator.clipboard.writeText(galleryUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Handle hapus foto
  const handleDeletePhoto = async (photoId: string) => {
    try {
      const token = localStorage.getItem("sb-access-token");
      if (!token) return;

      const res = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const deletedPhoto = photos.find(p => p.id === photoId);
        setPhotos(prev => prev.filter(p => p.id !== photoId));
        if (deletedPhoto && deletedPhoto.url_original === project?.cover_photo_url) {
          setProject((prev) => prev ? { ...prev, cover_photo_url: null } : prev);
        }
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus foto");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi saat menghapus foto");
    }
  };

  // Handle toggle favorit — panggil API biar tersimpan
  const handleToggleFavorite = async (photoId: string, isFavorite: boolean) => {
    // Optimistic update lokal
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, is_favorite: isFavorite } : p))
    );

    try {
      const token = localStorage.getItem("sb-access-token");
      const res = await fetch(`/api/photos/${photoId}/favorite`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ is_favorite: isFavorite }),
      });

      if (!res.ok) {
        // Rollback jika gagal
        setPhotos((prev) =>
          prev.map((p) => (p.id === photoId ? { ...p, is_favorite: !isFavorite } : p))
        );
      }
    } catch {
      // Rollback jika error jaringan
      setPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, is_favorite: !isFavorite } : p))
      );
    }
  };

  // Handle set cover photo
  const handleSetCover = async (_photoId: string, urlOriginal: string) => {
    if (!project) return;
    try {
      const token = localStorage.getItem("sb-access-token");
      if (!token) return;

      const res = await fetch(`/api/projects/${project.id}/cover`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url_original: urlOriginal }),
      });

      if (res.ok) {
        setProject((prev) => prev ? { ...prev, cover_photo_url: urlOriginal } : prev);
      } else {
        const data = await res.json();
        alert(data.error || "Gagal mengatur foto profil proyek");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi");
    }
  };

  // State untuk modal detail foto
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // State untuk modal watermark
  const [showWatermark, setShowWatermark] = useState(false);

  // State untuk download
  const [downloading, setDownloading] = useState(false);

  const handleDownloadZip = async () => {
    if (!project || downloading) return;
    setDownloading(true);
    const token = localStorage.getItem("sb-access-token");
    try {
      const res = await fetch(`/api/projects/${project.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Gagal mengunduh");
        setDownloading(false);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name.toLowerCase().replace(/\s+/g, "-")}-foto.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal mengunduh file");
    } finally {
      setDownloading(false);
    }
  };

  // Auth loading — show spinner
  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F8F8]">
        <div className="flex items-center gap-3">
          <i className="ri-loader-4-line animate-spin text-2xl text-gray-500" />
          <p className="text-sm text-gray-500 font-semibold">Memuat galeri proyek…</p>
        </div>
      </main>
    );
  }

  // Project ditemukan tapi user belum login — minta login dulu
  const needsAuth = project && !loggedInUser;
  if (needsAuth) {
    const galleryUrl = typeof window !== "undefined" ? window.location.href : `/${slug}`;
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#F8F8F8] px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl shadow-md">
            <img src="/logo.png" alt="Shootlink Logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-serif">
            {project.name}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Galeri ini dilindungi. Masuk untuk melihat dan mengunduh foto.
          </p>

          <div className="mt-8 space-y-3">
            <Link
              href={`/login?role=photographer`}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#65195E]/20 bg-[#65195E] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#91157E] hover:shadow-md active:scale-[0.98]"
            >
              <i className="ri-camera-line" />
              Masuk sebagai Fotografer / Studio
            </Link>
            <Link
              href={`/login?role=client`}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md active:scale-[0.98]"
            >
              <i className="ri-user-heart-line" />
              Masuk sebagai Klien
            </Link>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            Punya tautan ini? Fotografer atau klien yang terdaftar dapat mengakses galeri setelah masuk.
          </p>
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F8F8] px-4">
        <div className="text-center">
          <i className="ri-error-warning-line text-5xl text-red-500 mb-3 block" />
          <h3 className="text-lg font-bold text-gray-900">Gagal Membuka Galeri</h3>
          <p className="mt-1 text-sm text-gray-500">{error || "Proyek tidak ditemukan"}</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#65195E] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#91157E]"
          >
            <i className="ri-arrow-left-line" />
            Kembali ke Dasbor
          </Link>
        </div>
      </main>
    );
  }

  // Filter foto berdasarkan tab pilihan
  const displayedPhotos = activeTab === "all"
    ? photos
    : photos.filter(p => p.is_favorite);

  return (
    <main className="min-h-screen bg-[#F8F8F8]">
      {/* ── Admin Toolbar (Hanya untuk pemilik proyek yang login untuk edit/upload) ── */}
      {isOwner && (
        <div className="border-b border-[#65195E]/10 bg-white px-4 py-3 sm:px-6 lg:px-8 shadow-sm">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-end gap-4">
            {/* Quick Actions (Upload & Copy Link) */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50 active:scale-95"
              >
                <i className={copied ? "ri-checkbox-circle-line text-emerald-500" : "ri-file-copy-2-line"} />
                {copied ? "Tersalin!" : "Salin Tautan Klien"}
              </button>

              {/* Invite Client */}
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-[#65195E]/30 bg-white px-3.5 py-1.5 text-xs font-bold text-[#65195E] transition hover:bg-[#65195E]/5 active:scale-95"
              >
                <i className="ri-user-add-line" />
                Undang Klien
              </button>

              {/* Progress dropdown */}
              <div className="relative flex items-center">
                <i className="ri-settings-3-line absolute left-3 pointer-events-none text-gray-400" />
                <select
                  value={project.progress_status}
                  onChange={(e) => handleProgressChange(e.target.value)}
                  className="appearance-none rounded-lg border border-gray-200 bg-white pl-8 pr-7 py-1.5 text-xs font-bold text-gray-600 outline-none transition hover:border-gray-300 cursor-pointer"
                >
                  {STEPS.map(step => (
                    <option key={step} value={step}>{step}</option>
                  ))}
                </select>
                <i className="ri-arrow-down-s-line absolute right-2 pointer-events-none text-gray-400" />
              </div>

              {/* Edit Detail */}
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 rounded-lg border border-[#65195E] bg-white px-3.5 py-1.5 text-xs font-bold text-[#65195E] transition hover:bg-[#65195E]/5 active:scale-95"
              >
                <i className="ri-edit-line" />
                Edit Detail
              </button>

              {/* Watermark */}
              <button
                onClick={() => setShowWatermark(true)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50 active:scale-95"
              >
                <i className="ri-copyright-line" />
                Watermark
              </button>

              {/* Download ZIP */}
              <button
                onClick={handleDownloadZip}
                disabled={downloading || photos.length === 0}
                className="flex items-center gap-1.5 rounded-lg border border-[#65195E]/30 bg-white px-3.5 py-1.5 text-xs font-bold text-[#65195E] transition hover:bg-[#65195E]/5 disabled:opacity-40 active:scale-95"
              >
                {downloading ? (
                  <i className="ri-loader-4-line animate-spin" />
                ) : (
                  <i className="ri-download-2-line" />
                )}
                {downloading ? "Mempersiapkan…" : `Download ZIP (${photos.length})`}
              </button>

              {/* Upload Input */}
              <label className="flex items-center gap-1.5 rounded-lg bg-[#65195E] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#91157E] cursor-pointer active:scale-95">
                <i className="ri-upload-cloud-line" />
                Upload Foto
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── Header Proyek ── */}
      <header className="bg-white border-b border-gray-100 py-8 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {isOwner && (
                  <Link
                    href="/proyek"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all duration-200 hover:bg-[#65195E] hover:text-white hover:scale-105 active:scale-95 shadow-sm"
                    title="Kembali ke Daftar Proyek"
                  >
                    <i className="ri-arrow-left-line text-lg" />
                  </Link>
                )}
                <span>{project.name}</span>
              </h1>
              {project.description && (
                <p className="mt-2 text-sm text-gray-500 sm:text-base leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <i className="ri-calendar-line" />
              <span>
                {new Date(project.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Upload Queue Progress */}
      {isOwner && uploadQueue.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <h4 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-1.5">
              <i className="ri-loader-4-line animate-spin" />
              Mengunggah file ({uploadQueue.filter(q => q.status === "success").length}/{uploadQueue.length})
            </h4>
            {uploadError && <p className="text-xs text-red-500 mb-2 font-medium">{uploadError}</p>}
            <div className="max-h-24 overflow-y-auto space-y-1.5 pr-2">
              {uploadQueue.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px] text-gray-500">
                  <span className="truncate max-w-md">{file.name}</span>
                  <div className="flex items-center gap-2">
                    {file.status === "success" && <span className="text-emerald-500 font-bold">Sukses</span>}
                    {file.status === "error" && <span className="text-red-500 font-bold">Gagal</span>}
                    {file.status === "uploading" && <span className="text-blue-500 font-bold">Proses</span>}
                    {file.status === "waiting" && <span className="text-gray-400">Antre</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Indikator Tahap Pengerjaan ── */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 animate-fadeIn">
        <ProgressIndicator projectId={project.id} currentStatus={project.progress_status} />
      </section>

      {/* ── Filter Tabs ── */}
      {(isOwner || isClient) && (
        <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("all")}
                className={`border-b-2 px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === "all"
                    ? "border-[#65195E] text-[#65195E]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Semua Foto ({photos.length})
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`border-b-2 px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === "favorites"
                    ? "border-[#65195E] text-[#65195E]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                Pilihan Klien ({photos.filter(p => p.is_favorite).length})
              </button>
            </div>
            {isClient && photos.length > 0 && (
              <button
                onClick={handleDownloadZip}
                disabled={downloading}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 active:scale-95"
              >
                {downloading ? (
                  <i className="ri-loader-4-line animate-spin" />
                ) : (
                  <i className="ri-download-2-line" />
                )}
                {downloading ? "Mempersiapkan…" : `Download ${photos.length} Foto`}
              </button>
            )}
          </div>
        </section>
      )}

      {/* ── Grid Galeri Foto ── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {displayedPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <i className="ri-gallery-line text-6xl text-gray-200 mb-4" />
            <p className="text-sm font-semibold text-gray-400">
              {activeTab === "favorites" ? "Belum ada foto yang difavoritkan klien." : "Belum ada foto dalam proyek ini."}
            </p>
            {isOwner && activeTab === "all" && (
              <p className="mt-1 text-xs text-gray-400">Silakan klik "Upload Foto" di atas untuk menambahkan foto pertama.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 animate-fadeIn">
            {displayedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <PhotoCard
                  photo={photo}
                  isOwner={isOwner}
                  isCover={photo.url_original === project.cover_photo_url}
                  watermark={project.watermark_url ? {
                    url: project.watermark_url,
                    position: project.watermark_position ?? "bottom-right",
                    opacity: project.watermark_opacity ?? 0.5,
                    size: project.watermark_size ?? 15,
                  } : null}
                  onToggleFavorite={handleToggleFavorite}
                  onSetCover={handleSetCover}
                  onDelete={handleDeletePhoto}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Modal Edit Detail Proyek ── */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => e.target === e.currentTarget && setIsEditing(false)}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-8 animate-fadeIn">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Edit Detail Proyek</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <i className="ri-close-line text-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveDetail} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Nama Proyek</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition hover:border-gray-300 focus:border-[#65195E] focus:ring-1 focus:ring-[#65195E]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Jenis Acara</label>
                <select
                  required
                  value={editForm.event_type}
                  onChange={(e) => setEditForm(prev => ({ ...prev, event_type: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition hover:border-gray-300 focus:border-[#65195E] focus:ring-1 focus:ring-[#65195E] cursor-pointer"
                >
                  <option value="Wedding">Wedding</option>
                  <option value="Graduation">Graduation</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Portrait">Portrait</option>
                  <option value="Event">Event</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Deskripsi</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition hover:border-gray-300 focus:border-[#65195E] focus:ring-1 focus:ring-[#65195E]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingDetail}
                  className="flex-1 rounded-lg bg-[#65195E] py-2.5 text-sm font-semibold text-white transition hover:bg-[#91157E] disabled:bg-gray-400"
                >
                  {isSavingDetail ? "Menyimpan…" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Watermark */}
      {showWatermark && project && (
        <WatermarkSettings
          projectId={project.id}
          currentUrl={project.watermark_url ?? null}
          currentPosition={project.watermark_position ?? "bottom-right"}
          currentOpacity={project.watermark_opacity ?? 0.5}
          currentSize={project.watermark_size ?? 15}
          onClose={() => setShowWatermark(false)}
          onSaved={() => {
            fetchProjectData();
          }}
        />
      )}

      {/* Modal Detail Foto */}
      {selectedPhoto && (
        <PhotoDetailModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      {/* Modal Undang Klien */}
      {project && (
        <InviteClientModal
          open={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          projectId={project.id}
          onInvited={() => setShowInviteModal(false)}
        />
      )}
    </main>
  );
}
