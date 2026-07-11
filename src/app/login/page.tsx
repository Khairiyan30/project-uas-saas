"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { validateEmail, validatePassword } from "@/lib/auth-validation";
import { setStubAuth } from "@/hooks/useRequireAuth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailError = validateEmail(form.email);
    const passError = validatePassword(form.password);
    const firstError = emailError || passError;
    if (firstError) {
      setError(firstError);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Email atau kata sandi salah");
        setIsLoading(false);
        return;
      }

      setStubAuth(form.email);

      if (data.session?.access_token) {
        localStorage.setItem("sb-access-token", data.session.access_token);
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] px-4 py-12">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white shadow-sm">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.74 19.74A9.75 9.75 0 0024 12c0-5.385-4.365-9.75-9.75-9.75S4.5 6.615 4.5 12c0 2.213.738 4.254 1.986 5.903L4.5 21l3.097-1.986A9.722 9.722 0 0012 19.75c2.213 0 4.254-.738 5.903-1.986L21 21l-1.26-1.26z" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 font-serif">Masuk ke Freelens</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Kelola client gallery & proofing dengan mudah.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <h2 className="text-base font-bold text-gray-900">Log In</h2>
          <p className="mt-1 text-xs text-gray-400">Gunakan akun fotografer profesional Anda.</p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="contoh@email.com"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-gray-700">
                  Kata Sandi
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-gray-600 hover:underline"
                >
                  Lupa sandi?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 pl-3 pr-10 py-2 text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                    {!showPassword && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isLoading ? "Memproses…" : "Masuk"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            Belum punya akun?{" "}
            <Link href="/signup" className="font-bold text-black hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
