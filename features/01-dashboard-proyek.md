# Dashboard Proyek

Layar utama fotografer menampilkan daftar proyek yang sedang berjalan dan opsi membuat proyek baru.

## Spesifikasi

### Tujuan
Menyediakan layar utama bagi fotografer untuk melihat semua proyek yang sedang dan telah dibuat, serta memulai proyek baru dengan cepat.

### Selesai bila
- Fotografer dapat melihat daftar proyek yang pernah dibuat, lengkap dengan nama, jenis acara, dan status terkini.
- Terdapat tombol "Buat Proyek Baru" yang mudah ditemukan dan berfungsi menuju formulir pembuatan proyek.
- Setiap proyek dalam daftar menampilkan indikator visual status pengerjaan (contoh: badge atau teks berwarna) tanpa perlu membuka detail proyek.
- Daftar proyek tetap nyaman dilihat dan di-scroll di perangkat seluler maupun desktop.
- Jika belum ada proyek sama sekali, muncul pesan atau ilustrasi yang mengarahkan fotografer untuk membuat proyek pertama.

## Sub-fitur: Daftar Proyek

Melihat semua proyek yang pernah dibuat beserta status terkini dan jumlah klien terlibat.

### Tujuan
Menampilkan seluruh proyek yang pernah dibuat oleh fotografer agar mudah dipantau dan diakses.

### Selesai bila
- Semua proyek ditampilkan dalam bentuk daftar (kartu atau baris) yang mencakup nama proyek, jenis acara, dan status terkini.
- Tampilan daftar responsif; di perangkat seluler, informasi tetap terbaca tanpa terpotong atau perlu scroll horizontal.
- Jika fotografer memiliki banyak proyek, daftar bisa di-scroll atau di-page, dan tetap menampilkan informasi paling penting di layar pertama.

## Sub-fitur: Buat Proyek Baru

Menambahkan proyek fotografi baru dengan informasi seperti nama klien, jenis acara, dan deskripsi.

### Tujuan
Memungkinkan fotografer menambahkan proyek baru lewat formulir sederhana yang langsung terhubung ke dashboard.

### Selesai bila
- Terdapat tombol atau area aksi yang jelas (misal: tombol "+ Buat Proyek Baru") yang langsung membuka formulir pembuatan proyek.
- Formulir berisi kolom input untuk Nama Klien, Jenis Acara, dan Deskripsi yang mudah diisi dan dikirim.
- Setelah proyek berhasil dibuat, fotografer langsung melihat proyek baru tersebut muncul di daftar proyek tanpa harus memuat ulang halaman secara manual.

## Sub-fitur: Status Proyek Sekilas

Menampilkan indikator ringkas progress tiap proyek langsung di halaman dashboard.

### Tujuan
Memberi informasi sekilas tentang di tahap mana setiap proyek berada, langsung dari halaman dashboard.

### Selesai bila
- Setiap item proyek menampilkan indikator status yang mudah dikenali (misalnya teks "Proses Edit", "Menunggu Reviu", atau "Selesai" dengan warna berbeda).
- Indikator tersebut muncul bersamaan dengan informasi proyek lainnya, bukan di halaman terpisah.
- Status yang ditampilkan selalu sesuai dengan data terkini yang disimpan di sistem.

## Task

### 1. Buat halaman dashboard utama dengan layout dan data tiruan proyek

### 2. Implementasikan komponen daftar proyek responsif dari data tiruan

### 3. Tambahkan indikator status proyek warna pada item daftar

### 4. Buat tombol dan formulir pembuatan proyek baru dengan input dummy

### 5. Tangani submit form untuk menambah proyek ke state lokal langsung terlihat

### 6. Tampilkan pesan atau ilustrasi saat belumlah ada proyek

### 7. Desain skema tabel proyek di Supabase lengkap dengan migrasi

### 8. Buat API route GET /api/proyek untuk mengambil daftar proyek user

### 9. Buat API route POST /api/proyek untuk menyimpan proyek baru
