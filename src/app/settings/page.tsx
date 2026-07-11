"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { AvatarUpload } from "@/components/AvatarUpload";
import { validateEmail, validateFullName } from "@/lib/auth-validation";
import { useRequireAuth } from "@/hooks/useRequireAuth";

/* ── Mock data profil ── */
const MOCK_PROFILE = {
  fullName: "Andi Pratama",
  email: "andi@email.com",
  avatarUrl: null,
};

/**
 * Halaman Pengaturan Profil — fotografer mengubah nama, email, dan foto profil.
 * Stub: perubahan disimpan di local state tanpa API call.
 */
export default function SettingsPage() {
  const isAuthed = useRequireAuth();

  const [form, setForm] = useState({
    fullName: MOCK_PROFILE.fullName,
    email: MOCK_PROFILE.email,
  });
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(
    MOCK_PROFILE.avatarUrl
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  if (!isAuthed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Memeriksa sesi…</p>
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
    const emailError = validateEmail(form.email);
    const firstError = nameError || emailError;
    if (firstError) {
      setError(firstError);
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
      }

      setIsSaving(false);
      setSaved(true);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      <Sidebar />

      <div className="ml-64 min-h-screen">
        <div className="mx-auto max-w-3xl px-8 py-8">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-gray-900">
            Pengaturan
          </h2>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            {/* Avatar section */}
            <div className="mb-8">
              <AvatarUpload
                initialUrl={MOCK_PROFILE.avatarUrl}
                initialName={form.fullName}
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
                  Nama Lengkap
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                />
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
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-[#1E1E1E] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isSaving ? "Menyimpan…" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
