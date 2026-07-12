"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { PhotoCard } from "@/components/PhotoCard";
import { useAuth } from "@/contexts/AuthContext";

const STEPS = ["Persiapan", "Uploading", "Proses Edit", "Menunggu Reviu", "Tahap Kurasi Klien", "Selesai"] as const;

export default function GalleryPage() {
  const params = useParams();
  const router = useRouter();
  const { user: loggedInUser } = useAuth();
  const slug = params.slug as string;

  const [project, setProject] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State untuk mode Admin/Fotografer
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedInPhotographer, setIsLoggedInPhotographer] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  
  // State untuk edit detail proyek
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", event_type: "", description: "" });
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  
  // State untuk upload foto
  const [uploadQueue, setUploadQueue] = useState<{ name: string; progress: number; status: "waiting" | "uploading" | "success" | "error" }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Copy status
  const [copied, setCopied] = useState(false);

  // Fetch project detail & photos
  const fetchProjectData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Ambil data proyek secara publik via slug
      const res = await fetch(`/api/gallery/${slug}`);
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

      // Cek apakah ada token login di browser
      const token = localStorage.getItem("sb-access-token");
      if (token) {
        setIsLoggedInPhotographer(true);
        setIsAdmin(true); // Selama fotografer login, aktifkan admin toolbar untuk proyek ini
      } else {
        setIsLoggedInPhotographer(false);
        setIsAdmin(false);
      }
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
    if (!project || !isAdmin) return;

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
      if (res.ok) {
        setProject((prev: any) => ({ ...prev, progress_status: newStatus }));
        // Refresh data
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
    if (!project || !isAdmin) return;

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
        setProject((prev: any) => ({
          ...prev,
          name: data.project.name,
          event_type: data.project.event_type,
          description: data.project.description,
        }));
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

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !project || !isAdmin) return;

    setIsUploading(true);
    setUploadError("");

    const token = localStorage.getItem("sb-access-token");
    const fileList = Array.from(files);

    // Siapkan upload queue state
    const newQueue = fileList.map(f => ({ name: f.name, progress: 0, status: "waiting" as const }));
    setUploadQueue(newQueue);

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
        const res = await fetch(`/api/projects/${project.id}/photos`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
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
        // Jika foto yang dihapus adalah cover, hapus cover dari proyek
        if (deletedPhoto && deletedPhoto.url_original === project.cover_photo_url) {
          setProject((prev: any) => ({ ...prev, cover_photo_url: null }));
        }
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus foto");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi saat menghapus foto");
    }
  };

  // Handle set cover photo
  const handleSetCover = async (_photoId: string, urlOriginal: string) => {
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
        setProject((prev: any) => ({ ...prev, cover_photo_url: urlOriginal }));
      } else {
        const data = await res.json();
        alert(data.error || "Gagal mengatur foto profil proyek");
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi");
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F8F8]">
        <div className="flex items-center gap-3">
          <i className="ri-loader-4-line animate-spin text-2xl text-gray-500" />
          <p className="text-sm text-gray-500 font-semibold">Memuat galeri proyek…</p>
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

  // Filter foto berdasarkan tab pilihan klien
  const displayedPhotos = activeTab === "all"
    ? photos
    : photos.filter(p => p.is_favorite);

  return (
    <main className="min-h-screen bg-[#F8F8F8]">
      {/* ── Admin Toolbar (Hanya untuk pemilik proyek yang login untuk edit/upload) ── */}
      {isAdmin && (
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
                {isLoggedInPhotographer && (
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
      {isAdmin && uploadQueue.length > 0 && (
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
        <ProgressIndicator projectId={project.id} />
      </section>

      {/* ── Filter Tabs Khusus Admin ── */}
      {isAdmin && (
        <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="flex border-b border-gray-200">
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
            {isAdmin && activeTab === "all" && (
              <p className="mt-1 text-xs text-gray-400">Silakan klik "Upload Foto" di atas untuk menambahkan foto pertama.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 animate-fadeIn">
            {displayedPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                isAdmin={isAdmin}
                isCover={photo.url_original === project.cover_photo_url}
                onToggleFavorite={(photoId, isFav) => {
                  setPhotos(prev =>
                    prev.map(p => p.id === photoId ? { ...p, is_favorite: isFav } : p)
                  );
                }}
                onSetCover={handleSetCover}
                onDelete={handleDeletePhoto}
              />
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
    </main>
  );
}
