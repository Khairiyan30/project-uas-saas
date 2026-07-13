import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
        <Link href="/" className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
          <i className="ri-arrow-left-line" />
          Kembali
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Kebijakan Privasi</h1>
        <p className="mt-2 text-sm text-gray-400">Terakhir diperbarui: Juli 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-600">
          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">1. Informasi yang Kami Kumpulkan</h2>
            <p>
              Kami mengumpulkan informasi berikut saat Anda menggunakan Shootlink:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Informasi akun: nama, email, kata sandi (dienkripsi)</li>
              <li>Foto dan konten yang Anda unggah</li>
              <li>Data penggunaan: halaman yang dikunjungi, fitur yang digunakan</li>
              <li>Data cookie dan perangkat (lihat Kebijakan Cookie)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">2. Penggunaan Informasi</h2>
            <p>Informasi Anda digunakan untuk:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Menyediakan dan memelihara Layanan</li>
              <li>Memproses pembayaran melalui Stripe</li>
              <li>Mengirim notifikasi terkait proyek dan akun</li>
              <li>Meningkatkan pengalaman pengguna</li>
              <li>Mendeteksi dan mencegah penyalahgunaan</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">3. Penyimpanan Data</h2>
            <p>
              Data Anda disimpan di server Supabase yang berlokasi di [Region]. Kami menerapkan
              langkah-langkah keamanan standar industri untuk melindungi data Anda, termasuk enkripsi
              saat transit (TLS) dan saat istirahat.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">4. Berbagi Data dengan Pihak Ketiga</h2>
            <p>
              Kami tidak menjual data pribadi Anda. Kami berbagi data hanya dengan:
            </p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li><strong>Stripe</strong>: untuk pemrosesan pembayaran</li>
              <li><strong>Supabase</strong>: untuk penyimpanan database dan autentikasi</li>
              <li><strong>Vercel</strong>: untuk hosting aplikasi</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">5. Hak Anda</h2>
            <p>Anda memiliki hak untuk:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Mengakses data pribadi yang kami simpan</li>
              <li>Memperbaiki data yang tidak akurat</li>
              <li>Menghapus akun dan data Anda</li>
              <li>Menarik persetujuan pemrosesan data</li>
              <li>Mengunduh data Anda (portabilitas data)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">6. Retensi Data</h2>
            <p>
              Kami menyimpan data Anda selama akun Anda aktif. Setelah akun dihapus, data akan
              dihapus dalam waktu 30 hari, kecuali diwajibkan oleh hukum untuk menyimpannya lebih lama.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">7. Perubahan Kebijakan</h2>
            <p>
              Kebijakan privasi ini dapat diperbarui. Perubahan signifikan akan diberitahukan melalui
              email atau notifikasi di platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">8. Kontak</h2>
            <p>
              Untuk pertanyaan mengenai privasi data, hubungi{" "}
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
