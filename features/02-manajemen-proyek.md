# Manajemen Proyek

Halaman detail proyek tempat fotografer mengunggah foto, mengelola tautan galeri, dan mengatur progres.

## Spesifikasi

### Tujuan
Menyediakan halaman pusat bagi fotografer untuk mengelola seluruh aspek proyek foto, mulai dari mengunggah file, mengatur detail, hingga membagikan galeri ke klien.

### Selesai bila
- Fotografer dapat mengunggah foto mentah ke dalam proyek secara massal dan melihat daftar foto yang sudah terunggah.
- Fotografer dapat mengedit nama proyek, jenis acara, dan deskripsi, lalu melihat perubahan tersimpan.
- Fotografer dapat menghasilkan, melihat, dan menyalin tautan unik galeri milik proyek tersebut dengan satu klik.
- Tersedia tombol yang membuka tampilan pratinjau galeri seolah-olah fotografer adalah klien.
- Fotografer dapat memilih status progres dari daftar yang tersedia, dan status terbaru langsung tampil di halaman detail proyek ini.

## Sub-fitur: Unggah Foto

Fotografer mengunggah kumpulan foto mentah ke dalam proyek untuk dikurasi oleh klien.

### Tujuan
Memungkinkan fotografer mengunggah banyak foto mentah sekaligus ke dalam proyek agar siap dikurasi oleh klien.

### Selesai bila
- Ada area atau tombol unggah yang jelas terlihat di halaman Manajemen Proyek.
- Fotografer dapat memilih dan mengunggah beberapa file foto sekaligus dari perangkatnya.
- Setelah unggahan berhasil, daftar foto yang baru ditambahkan langsung muncul di halaman tanpa perlu memuat ulang secara manual.

## Sub-fitur: Kelola Detail Proyek

Mengedit nama, deskripsi, dan jenis acara proyek agar sesuai dengan kebutuhan.

### Tujuan
Memungkinkan fotografer memperbarui informasi dasar proyek seperti nama, deskripsi, dan jenis acara kapan saja.

### Selesai bila
- Formulir edit untuk nama proyek, jenis acara, dan deskripsi dapat diakses dari halaman Manajemen Proyek.
- Fotografer dapat mengubah isi formulir dan menyimpannya.
- Setelah disimpan, detail proyek yang baru langsung diperbarui dan ditampilkan di halaman yang sama.

## Sub-fitur: Tautan Galeri Unik

Menghasilkan dan menyalin tautan publik khusus proyek yang bisa dibagikan langsung ke klien.

### Tujuan
Menyediakan dan menyalin tautan rahasia unik yang dapat dibagikan fotografer kepada klien untuk mengakses galeri.

### Selesai bila
- Sebuah tautan unik untuk galeri proyek ditampilkan secara otomatis di halaman Manajemen Proyek.
- Tersedia tombol 'Salin Tautan' di samping tautan tersebut.
- Saat tombol diklik, tautan tersalin ke papan klip dan muncul notifikasi atau perubahan teks singkat (contoh: 'Tersalin!') sebagai konfirmasi.

## Sub-fitur: Pratinjau Galeri

Melihat tampilan galeri dari sudut pandang klien sebelum tautan dibagikan.

### Tujuan
Memberi fotografer akses cepat untuk melihat pratinjau galeri klien dari tampilan yang persis sama seperti yang akan dilihat kliennya.

### Selesai bila
- Ada tombol 'Pratinjau Galeri' yang mudah ditemukan di halaman Manajemen Proyek.
- Saat tombol diklik, halaman galeri publik proyek tersebut terbuka di tab atau jendela baru.
- Tampilan yang muncul adalah halaman galeri klien yang sebenarnya, lengkap dengan foto-foto yang sudah diunggah.

## Sub-fitur: Pengaturan Progress

Memperbarui tahapan pengerjaan proyek (mis. 'Proses Edit' atau 'Selesai') yang tampil di galeri klien.

### Tujuan
Memungkinkan fotografer mengatur dan memperbarui status pengerjaan proyek yang akan ditampilkan kepada klien di galeri.

### Selesai bila
- Ada menu pilihan (dropdown/tombol pilih) yang menampilkan daftar status progres, misalnya 'Persiapan', 'Proses Edit', 'Menunggu Reviu', 'Selesai'.
- Fotografer dapat memilih salah satu status dan perubahannya langsung tersimpan.
- Status progres yang aktif saat ini langsung terlihat jelas di halaman Manajemen Proyek setelah diperbarui.

## Task

### 1. Buat halaman detail proyek dengan layout lengkap dan data tiruan

### 2. Implementasikan area unggah foto multi-file dengan mock unggahan dan daftar foto tiruan

### 3. Tambahkan form edit detail proyek dengan penyimpanan state lokal

### 4. Implementasikan tombol salin tautan galeri dan notifikasi tersalin

### 5. Buat dropdown status progres proyek dengan pembaruan state lokal

### 6. Buat migrasi tabel projects beserta kolom yang dibutuhkan

### 7. Buat migrasi tabel project_photos untuk menyimpan metadata foto

### 8. Buat endpoint POST /api/projects/[id]/photos untuk unggah foto ke Supabase Storage

### 9. Buat endpoint GET /api/projects/[id]/photos untuk mengambil daftar foto

### 10. Buat endpoint PUT /api/projects/[id] untuk memperbarui detail proyek

### 11. Buat endpoint PATCH /api/projects/[id]/progress untuk memperbarui status progres

### 12. Buat endpoint GET /api/projects/[id] untuk mengambil detail proyek termasuk unique_slug
