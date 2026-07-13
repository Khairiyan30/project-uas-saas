"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "Gratis",
    description: "Untuk memulai dengan 1-2 proyek",
    features: [
      "3 proyek aktif",
      "100 foto per proyek",
      "Gallery client standar",
      "Progress tracking",
      "Bagi tautan galeri",
    ],
    cta: "Mulai Gratis",
    popular: false,
  },
  {
    id: "basic",
    name: "Basic",
    price: "Rp199.000",
    period: "/bulan",
    description: "Untuk fotografer profesional",
    features: [
      "20 proyek aktif",
      "500 foto per proyek",
      "Gallery client + kurasi",
      "Progress tracking",
      "Undang klien via email",
      "Prioritas support",
    ],
    cta: "Langganan Basic",
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "Rp499.000",
    period: "/bulan",
    description: "Untuk studio fotografi",
    features: [
      "Proyek tak terbatas",
      "Foto tak terbatas",
      "Gallery client + kurasi",
      "Progress tracking",
      "Undang klien via email",
      "Custom branding",
      "Prioritas support 24/7",
    ],
    cta: "Langganan Pro",
    popular: false,
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === "free") {
      window.location.href = user ? "/dashboard" : "/signup";
      return;
    }

    setLoading(planId);

    try {
      const token = localStorage.getItem("sb-access-token");
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priceId: planId === "basic" ? "price_basic" : "price_pro" }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Gagal memproses langganan");
      }
    } catch {
      alert("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F8F8]">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden shadow-sm">
              <img src="/logo.png" alt="Shootlink" className="h-full w-full object-cover" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 font-serif">Shootlink</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href={user.role === "client" ? "/client/dashboard" : "/dashboard"}
                className="rounded-lg bg-[#65195E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#91157E]"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
                  Masuk
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-[#65195E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#91157E]"
                >
                  Daftar Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Pilih Paket yang Tepat
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Mulai gratis, tingkatkan kapan saja sesuai kebutuhan studio Anda.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                plan.popular
                  ? "border-[#65195E] ring-2 ring-[#65195E]/20"
                  : "border-gray-100"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#65195E] px-4 py-1 text-xs font-bold text-white">
                  Terpopuler
                </span>
              )}

              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-gray-400">{plan.description}</p>

              <div className="my-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-gray-400">{plan.period}</span>
                )}
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                    <i className="ri-check-line mt-0.5 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading !== null}
                className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-300 ${
                  plan.popular
                    ? "bg-[#65195E] text-white hover:bg-[#91157E] hover:shadow-md"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {loading === plan.id ? "Memproses…" : plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
