"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F8F8F8]">
      {/* ── Header ── */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg shadow-sm">
              <img src="/logo.png" alt="Shootlink Logo" className="h-full w-full object-cover" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 font-serif">
              Shootlink
            </span>
          </div>
          <Link
            href="/login"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50 active:scale-95"
          >
            Masuk
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 text-center sm:px-8 sm:pt-28 sm:pb-20">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl shadow-md">
          <img src="/logo.png" alt="Shootlink Logo" className="h-full w-full object-cover" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl font-serif">
          Client Gallery & Proofing
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-gray-500 sm:text-lg">
          Platform modern untuk fotografer dan studio — bagikan galeri foto, kurasi favorit klien, dan kelola proyek dalam satu tempat.
        </p>

        {/* ── Role Cards ── */}
        <div className="mx-auto mt-12 grid max-w-2xl gap-6 sm:grid-cols-2">
          <Link
            href="/login?role=photographer"
            className="group rounded-2xl border border-gray-100 bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#65195E]/20 hover:shadow-lg"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#65195E]/5 text-[#65195E] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <i className="ri-camera-line text-2xl" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Fotografer / Studio</h2>
            <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">
              Kelola proyek, unggah foto, pantau progres, dan bagikan galeri ke klien.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#65195E] px-4 py-2 text-xs font-bold text-white transition-all group-hover:bg-[#91157E] group-hover:shadow-md">
              Masuk sebagai Fotografer
              <i className="ri-arrow-right-line text-xs transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link
            href="/login?role=client"
            className="group rounded-2xl border border-gray-100 bg-white p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#91157E]/20 hover:shadow-lg"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#91157E]/5 text-[#91157E] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <i className="ri-user-heart-line text-2xl" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Klien</h2>
            <p className="mt-1.5 text-sm text-gray-400 leading-relaxed">
              Lihat galeri foto, pilih favorit, unduh hasil, dan pantau progres proyek Anda.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#91157E] px-4 py-2 text-xs font-bold text-white transition-all group-hover:bg-[#65195E] group-hover:shadow-md">
              Masuk sebagai Klien
              <i className="ri-arrow-right-line text-xs transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* ── Feature Highlights ── */}
      <section className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
          <h2 className="text-center text-xl font-bold text-gray-900 sm:text-2xl font-serif">
            Kenapa Shootlink?
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-50 bg-[#F8F8F8] p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#65195E] shadow-sm">
                <i className="ri-gallery-line text-xl" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Galeri Privat</h3>
              <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                Setiap proyek punya tautan unik dan akses terbatas untuk klien.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-50 bg-[#F8F8F8] p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#91157E] shadow-sm">
                <i className="ri-heart-3-line text-xl" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Kurasi Favorit</h3>
              <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                Klien pilih foto favorit, fotografer tahu persis mana yang disukai.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-50 bg-[#F8F8F8] p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#C246C6] shadow-sm">
                <i className="ri-download-2-line text-xl" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">Unduh Sekaligus</h3>
              <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                Klien unduh semua foto dalam satu file ZIP, langsung dari galeri.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-8">
          <p className="text-[10px] text-gray-400">
            &copy; {new Date().getFullYear()} Shootlink. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/tos" className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
              Syarat & Ketentuan
            </Link>
            <Link href="/privacy" className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="/cookies" className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
              Cookie
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
