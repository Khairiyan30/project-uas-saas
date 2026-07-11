"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { validatePassword, validatePasswordMatch } from "@/lib/auth-validation";

function ResetPasswordForm() {
  const router = useRouter();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Extract access_token dari URL hash (Supabase mengirim via hash fragment)
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", ""));
    const token = params.get("access_token");
    if (token) {
      setAccessToken(token);
      // Bersihkan hash dari URL
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const passError = validatePassword(form.password);
    const matchError = validatePasswordMatch(form.password, form.confirmPassword);
    const firstError = passError || matchError;
    if (firstError) {
      setError(firstError);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: form.password,
          access_token: accessToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal memperbarui kata sandi");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
      setIsLoading(false);
    }
  };

  if (!accessToken) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
        <p className="font-medium">Tautan tidak valid</p>
        <p className="mt-1 text-red-500">
          Tautan reset kata sandi tidak valid atau sudah kedaluwarsa.
        </p>
        <Link
          href="/forgot-password"
          className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Minta tautan baru
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
        <p className="font-medium">Kata sandi berhasil diubah!</p>
        <p className="mt-1 text-green-600">
          Anda akan diarahkan ke halaman masuk…
        </p>
        <Link
          href="/login"
          className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Masuk sekarang
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Kata Sandi Baru
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Minimal 6 karakter"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
            Konfirmasi Kata Sandi
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Ulangi kata sandi baru"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {isLoading ? "Menyimpan…" : "Simpan Kata Sandi Baru"}
        </button>
      </form>
    </>
  );
}

/**
 * Halaman Reset Password — form buat kata sandi baru setelah klik tautan email.
 * Stub: submit langsung sukses tanpa API call, redirect ke /login.
 */
export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Client Gallery Pro</h1>
          <p className="mt-2 text-sm text-gray-500">Buat kata sandi baru</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Reset Kata Sandi
          </h2>

          <Suspense
            fallback={
              <p className="text-center text-sm text-gray-400">Memuat…</p>
            }
          >
            <ResetPasswordForm />
          </Suspense>

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Kembali ke halaman masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
