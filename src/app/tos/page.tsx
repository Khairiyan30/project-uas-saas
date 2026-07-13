import Link from "next/link";

export default function TosPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
        <Link href="/" className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
          <i className="ri-arrow-left-line" />
          Kembali
        </Link>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Syarat & Ketentuan</h1>
        <p className="mt-2 text-sm text-gray-400">Terakhir diperbarui: Juli 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-600">
          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">1. Penerimaan Ketentuan</h2>
            <p>
              Dengan mengakses atau menggunakan platform Shootlink ("Layanan"), Anda menyetujui untuk terikat
              oleh Syarat & Ketentuan ini. Jika Anda tidak setuju, jangan gunakan Layanan.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">2. Deskripsi Layanan</h2>
            <p>
              Shootlink adalah platform client gallery & proofing untuk fotografer. Pengguna dapat
              mengunggah foto, membuat galeri, mengundang klien, dan mengelola proses kurasi foto.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">3. Akun Pengguna</h2>
            <p>
              Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda. Segala aktivitas yang
              terjadi dalam akun Anda adalah tanggung jawab Anda. Berikan informasi yang akurat dan
              terkini.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">4. Paket & Pembayaran</h2>
            <p>
              Shootlink menawarkan paket Free, Basic, dan Pro. Pembayaran untuk paket berbayar diproses
              melalui Stripe. Pembatalan dapat dilakukan kapan saja melalui portal billing. Tidak ada
              pengembalian dana untuk periode yang telah terpakai.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">5. Konten Pengguna</h2>
            <p>
              Anda mempertahankan hak kepemilikan atas foto dan konten yang Anda unggah. Dengan
              mengunggah konten, Anda memberikan Shootlink izin untuk menyimpan, memproses, dan
              menampilkan konten tersebut untuk tujuan penyediaan Layanan.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">6. Pembatasan Tanggung Jawab</h2>
            <p>
              Shootlink tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau
              konsekuensial yang timbul dari penggunaan Layanan. Layanan disediakan "sebagaimana adanya"
              tanpa jaminan tersurat maupun tersirat.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">7. Penghentian</h2>
            <p>
              Kami berhak menangguhkan atau menghentikan akun Anda jika melanggar ketentuan ini. Anda
              dapat menghentikan akun kapan saja. Data akan dihapus dalam 30 hari setelah penghentian.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">8. Perubahan Ketentuan</h2>
            <p>
              Kami dapat memperbarui ketentuan ini sewaktu-waktu. Perubahan akan diumumkan melalui
              email atau pemberitahuan di platform. Penggunaan berlanjut setelah perubahan berarti
              penerimaan ketentuan baru.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900">9. Kontak</h2>
            <p>
              Untuk pertanyaan mengenai ketentuan ini, hubungi kami di{" "}
              <a href="mailto:support@shootlink.app" className="text-[#65195E] hover:underline">
                support@shootlink.app
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
