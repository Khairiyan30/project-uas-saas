"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  validateEmail,
  validatePassword,
  validateFullName,
  validatePasswordMatch,
} from "@/lib/auth-validation";
import { useAuth } from "@/contexts/AuthContext";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const isClientRole = role === "client";

  const roleLabel = useMemo(() => isClientRole ? "Klien" : "Fotografer / Studio", [isClientRole]);
  const nameLabel = useMemo(() => isClientRole ? "Nama Lengkap" : "Nama Fotografer / Studio", [isClientRole]);
  const descText = useMemo(
    () => isClientRole
      ? "Buat akun klien Anda untuk melihat galeri proyek dari fotografer."
      : "Buat akun studio Anda untuk mulai mengunggah proyek.",
    [isClientRole]
  );
  const headingText = useMemo(
    () => isClientRole ? "Daftar Akun Klien" : "Daftar Akun Fotografer",
    [isClientRole]
  );

  const { login: authLogin } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const nameError = validateFullName(form.fullName);
    const emailError = validateEmail(form.email);
    const passError = validatePassword(form.password);
    const matchError = validatePasswordMatch(form.password, form.confirmPassword);

    const firstError = nameError || emailError || passError || matchError;
    if (firstError) {
      setError(firstError);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          role: isClientRole ? "client" : "photographer",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal membuat akun");
        setIsLoading(false);
        return;
      }

      if (data.session?.access_token) {
        await authLogin(data.session.access_token, data.session.refresh_token);
        router.push("/dashboard");
      } else {
        router.push("/login?registered=true");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8F8F8] px-4 py-12">
      <div className="w-full max-w-[440px]">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden shadow-sm">
            <img src="/logo.png" alt="Shootlink Logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 font-serif">{headingText}</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Platform modern untuk client gallery & proofing.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <h2 className="text-base font-bold text-gray-900">Registrasi — {roleLabel}</h2>
          <p className="mt-1 text-xs text-gray-400">{descText}</p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Nama Lengkap */}
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-xs font-semibold text-gray-700">
                {nameLabel}
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={form.fullName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-gray-700">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 pl-3 pr-10 py-2 text-sm text-gray-900 placeholder-gray-300 outline-none transition-all duration-300 hover:border-gray-300 focus:border-[#65195E] focus:ring-1 focus:ring-[#65195E]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className={showPassword ? "ri-eye-off-line text-lg" : "ri-eye-line text-lg"} />
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-semibold text-gray-700">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Ulangi kata sandi"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 pl-3 pr-10 py-2 text-sm text-gray-900 placeholder-gray-300 outline-none transition-all duration-300 hover:border-gray-300 focus:border-[#65195E] focus:ring-1 focus:ring-[#65195E]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className={showConfirmPassword ? "ri-eye-off-line text-lg" : "ri-eye-line text-lg"} />
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-lg bg-[#65195E] py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-[#91157E] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isLoading ? "Mendaftar…" : "Daftar"}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-xs text-gray-500">
            Sudah memiliki akun?{" "}
            <Link href="/login" className="font-bold text-[#65195E] hover:underline">
              Masuk Sekarang
            </Link>
          </p>

          {/* Legal Links */}
          <div className="mt-6 flex items-center justify-center gap-4 border-t border-gray-50 pt-4 text-[10px] text-gray-400">
            <Link href="/tos" className="hover:text-gray-600 transition-colors">Syarat & Ketentuan</Link>
            <Link href="/privacy" className="hover:text-gray-600 transition-colors">Kebijakan Privasi</Link>
            <Link href="/cookies" className="hover:text-gray-600 transition-colors">Cookie</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpContent />
    </Suspense>
  );
}
