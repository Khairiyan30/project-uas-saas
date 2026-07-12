"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { AvatarUpload } from "@/components/AvatarUpload";
import { validateFullName, validatePassword, validatePasswordMatch } from "@/lib/auth-validation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const isAuthed = useRequireAuth();
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
  });
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // State untuk ganti password
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Sinkronisasi data user dari AuthContext ke form state
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || "",
        email: user.email || "",
      });
      setAvatarDataUrl(user.avatarUrl);
    }
  }, [user]);

  if (!isAuthed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Memeriksa sesi…</p>
      </main>
    );
  }

  // Loading state saat user profile belum ter-load dari database
  if (!user) {
    return (
      <main className="min-h-screen bg-[#F8F8F8]">
        <Sidebar />
<div className="lg:ml-64 min-h-screen">
          <div className="mx-auto max-w-3xl px-8 py-8">
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                <p className="text-sm text-gray-500">Memuat data profil…</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const nameError = validateFullName(form.fullName);
    if (nameError) {
      setError(nameError);
      return;
    }

    setIsSaving(true);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("sb-access-token")
          : null;

      if (token) {
        const res = await fetch("/api/auth/me", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: form.fullName,
            avatar_url: avatarDataUrl,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Gagal menyimpan perubahan");
          setIsSaving(false);
          return;
        }
      } else {
        // Fallback stub: simulasikan delay
        await new Promise((resolve) => setTimeout(resolve, 600));
        console.log("[STUB] Save profile:", {
          ...form,
          avatar: avatarDataUrl,
        });
        updateProfile({
          fullName: form.fullName,
          avatarUrl: avatarDataUrl,
        });
      }

      setIsSaving(false);
      setSaved(true);
      
      // Update profil di AuthContext agar Sidebar & Dashboard ikut berubah
      updateProfile({
        fullName: form.fullName,
        avatarUrl: avatarDataUrl,
      });
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setIsSaving(false);
    }
  };

  // Handle ganti password
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSaved(false);

    const passError = validatePassword(passwordForm.newPassword);
    const matchError = validatePasswordMatch(passwordForm.newPassword, passwordForm.confirmPassword);
    const firstError = passError || matchError;
    if (firstError) {
      setPasswordError(firstError);
      return;
    }

    setIsSavingPassword(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("sb-access-token") : null;
      if (!token) {
        setPasswordError("Sesi tidak ditemukan. Silakan login ulang.");
        setIsSavingPassword(false);
        return;
      }

      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: passwordForm.newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "Gagal mengubah kata sandi");
        setIsSavingPassword(false);
        return;
      }

      setPasswordSaved(true);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      setPasswordError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F8F8]">
      <Sidebar />

      <div className="lg:ml-64 min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-4 pt-14 sm:px-8 sm:py-8 sm:pt-8">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
            Pengaturan
          </h2>
          <p className="mb-8 text-sm text-gray-400">
            Kelola profil studio Anda. Data ini akan ditampilkan di Sidebar dan halaman Dashboard.
          </p>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            {/* Avatar section */}
          <div className="mb-8">
            <AvatarUpload
              initialUrl={user?.avatarUrl}
              initialName={form.fullName || user?.fullName || "U"}
                onChange={(dataUrl) => {
                  setAvatarDataUrl(dataUrl);
                  setSaved(false);
                }}
                onError={setError}
              />
            </div>

            {/* Success message */}
            {saved && (
              <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-600">
                Perubahan berhasil disimpan!
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="fullName" className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Nama Fotografer / Studio
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none transition-all duration-300 hover:border-gray-300 focus:border-[#65195E] focus:ring-1 focus:ring-[#65195E]"
                />
                <p className="mt-1 text-[10px] text-gray-400">
                  Nama ini diisi saat registrasi dan dapat diubah kapan saja.
                </p>
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  readOnly
                  className="w-full rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed select-none transition-all duration-300"
                />
                <p className="mt-1 text-[10px] text-gray-400">
                  Email tidak dapat diubah. Hubungi admin jika perlu mengubah email akun.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-[#65195E] px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-[#91157E] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isSaving ? "Menyimpan…" : "Simpan Perubahan"}
                </button>
              </div>
            </form>

            {/* Account Info Section */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="mb-4 text-sm font-bold text-gray-900">Informasi Akun</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">ID Akun</span>
                  <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[10px] text-gray-600">
                    {user.id?.slice(0, 8)}...{user.id?.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Status</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    Terverifikasi
                  </span>
                </div>
              </div>
            </div>

            {/* Ganti Password Section */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="mb-4 text-sm font-bold text-gray-900">Ganti Kata Sandi</h3>

              {passwordSaved && (
                <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-600">
                  Kata sandi berhasil diubah!
                </div>
              )}

              {passwordError && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Kata Sandi Baru
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }));
                      setPasswordError("");
                      setPasswordSaved(false);
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none transition-all duration-300 hover:border-gray-300 focus:border-[#65195E] focus:ring-1 focus:ring-[#65195E]"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => {
                      setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                      setPasswordError("");
                      setPasswordSaved(false);
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none transition-all duration-300 hover:border-gray-300 focus:border-[#65195E] focus:ring-1 focus:ring-[#65195E]"
                    placeholder="Ulangi kata sandi baru"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="rounded-lg bg-[#65195E] px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-[#91157E] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {isSavingPassword ? "Menyimpan…" : "Ubah Kata Sandi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
