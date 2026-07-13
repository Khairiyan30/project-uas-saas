import Link from "next/link";

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
        <Link href="/" className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
          <i className="ri-arrow-left-line" />
          Kembali
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Kebijakan Cookie</h1>
        <p className="mt-2 text-sm text-gray-400">Terakhir diperbarui: Juli 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-600">
          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">1. Apa itu Cookie?</h2>
            <p>
              Cookie adalah file teks kecil yang disimpan di perangkat Anda saat mengunjungi website.
              Cookie membantu kami mengingat preferensi Anda dan meningkatkan pengalaman browsing.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">2. Cookie yang Kami Gunakan</h2>

            <h3 className="mt-4 mb-2 font-bold text-gray-800">Cookie Esensial</h3>
            <p>Diperlukan untuk fungsi dasar platform:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>sb-access-token</strong>: token sesi autentikasi</li>
              <li><strong>sb-refresh-token</strong>: token penyegaran sesi</li>
            </ul>

            <h3 className="mt-4 mb-2 font-bold text-gray-800">Cookie Analitik</h3>
            <p>Membantu kami memahami penggunaan platform (jika diaktifkan):</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Vercel Analytics: data kunjungan aggregated (anonim)</li>
            </ul>

            <h3 className="mt-4 mb-2 font-bold text-gray-800">Cookie Pihak Ketiga</h3>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Stripe</strong>: cookie untuk pemrosesan pembayaran yang aman</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">3. Tujuan Penggunaan</h2>
            <p>Cookie digunakan untuk:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Menjaga sesi login Anda tetap aktif</li>
              <li>Mengingat preferensi tampilan</li>
              <li>Menganalisis pola penggunaan untuk perbaikan layanan</li>
              <li>Memproses pembayaran dengan aman</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">4. Kontrol Cookie</h2>
            <p>
              Anda dapat mengontrol cookie melalui pengaturan browser Anda. Sebagian besar browser
              memungkinkan Anda untuk:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Melihat cookie yang tersimpan</li>
              <li>Menghapus cookie individu atau semua cookie</li>
              <li>Memblokir cookie dari situs tertentu</li>
              <li>Memblokir cookie pihak ketiga</li>
            </ul>
            <p className="mt-2">
              Catatan: Menonaktifkan cookie esensial dapat memengaruhi fungsionalitas platform,
              termasuk kemampuan untuk login.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">5. Cookie Consent</h2>
            <p>
              Saat pertama kali mengunjungi Shootlink, Anda akan melihat banner cookie yang meminta
              persetujuan Anda. Anda dapat mengubah preferensi kapan saja melalui pengaturan browser.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">6. Kontak</h2>
            <p>
              Untuk pertanyaan lebih lanjut tentang penggunaan cookie, hubungi{" "}
              <a href="mailto:privacy@shootlink.app" className="text-[#65195E] hover:underline">
                privacy@shootlink.app
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
