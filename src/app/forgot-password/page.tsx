"use client";

import { useState } from "react";
import Link from "next/link";
import { validateEmail } from "@/lib/auth-validation";

/**
 * Halaman Lupa Password — form request reset password via email.
 * Stub: setelah submit menampilkan pesan konfirmasi tanpa mengirim email.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);
    try {
      await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Selalu tampilkan success (security: tidak bocorkan info akun)
      setIsLoading(false);
      setSent(true);
    } catch {
      setIsLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Client Gallery Pro</h1>
          <p className="mt-2 text-sm text-gray-500">
            Pulihkan akses akun Anda
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">Lupa Kata Sandi</h2>

          {sent ? (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
              <p className="font-medium">Tautan reset telah dikirim</p>
              <p className="mt-1 text-green-600">
                Jika email <strong>{email}</strong> terdaftar, kami telah mengirimkan
                tautan reset kata sandi. Periksa kotak masuk Anda.
              </p>
              <Link
                href="/login"
                className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Kembali ke halaman masuk
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                    Email Terdaftar
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {isLoading ? "Mengirim…" : "Kirim Tautan Reset"}
                </button>
              </form>
            </>
          )}

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
