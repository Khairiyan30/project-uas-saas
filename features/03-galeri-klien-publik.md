# Galeri Klien Publik

Halaman publik yang bisa diakses klien tanpa login untuk menelusuri foto, melihat progres, dan memilih favorit.

## Spesifikasi

### Tujuan
Menyediakan halaman publik bebas akses bagi klien untuk melihat kumpulan foto proyek, memantau status pengerjaan terbaru, serta menandai foto pilihan tanpa perlu memiliki akun atau melakukan login.

### Selesai bila
- Klien dapat membuka tautan unik proyek tanpa perlu login dan langsung melihat galeri foto.
- Galeri menampilkan seluruh foto proyek dengan tata letak yang bersih dan responsif di desktop, tablet, dan ponsel.
- Bagian atas galeri menampilkan indikator tahap pengerjaan terkini yang berubah secara real-time sesuai pembaruan oleh fotografer.
- Setiap foto memiliki tombol favorit yang dapat diklik sekali untuk menandai foto tersebut, dan status favorit tersimpan permanen.
- Tersedia mode perbandingan dua versi foto (original vs. diedit) bagi foto yang memiliki kedua versi, untuk membantu klien memilih.

## Sub-fitur: Telusuri Galeri Foto

Klien menjelajahi seluruh foto dalam satu halaman dengan tampilan bersih dan responsif.

### Tujuan
Memungkinkan klien menjelajahi semua foto proyek dalam satu halaman dengan pengalaman visual yang bersih, cepat, dan nyaman di berbagai perangkat.

### Selesai bila
- Semua foto proyek ditampilkan dalam susunan grid atau masonry yang rapi tanpa perlu pindah halaman.
- Gambar dimuat secara cepat (aspek loading) dan dapat di-scroll dengan lancar.
- Tata letak menyesuaikan ukuran layar: jumlah kolom berkurang di tablet dan menjadi satu kolom di ponsel.
- Setiap foto terlihat jelas dengan rasio aspek yang proporsional (tanpa distorsi).

## Sub-fitur: Indikator Tahap Pengerjaan

Menampilkan status real-time proyek (mis. 'Sedang Dikerjakan' atau 'Tahap Kurasi') di bagian atas galeri.

### Tujuan
Memberi tahu klien posisi progres proyek secara langsung tanpa perlu bertanya ke fotografer.

### Selesai bila
- Di bagian atas galeri terdapat sebuah bar atau label yang menampilkan teks tahap pengerjaan (misalnya "Tahap Kurasi Klien", "Sedang Diedit", atau "Selesai").
- Teks tersebut selalu memperlihatkan nilai terbaru dari database, sehingga jika fotografer mengubah status, perubahan langsung terlihat di halaman klien setelah refresh atau secara real-time.
- Desain indikator sederhana, mudah dibaca, dan selaras dengan tema minimalis galeri.

## Sub-fitur: Pilih Foto Favorit

Klien menandai foto yang diinginkan dengan satu kali klik tanpa perlu mengetik nama file.

### Tujuan
Memberi cara mudah bagi klien untuk memilih foto yang diinginkan dengan satu kali klik, tanpa mengetik nama file, dan status pilihan tetap tercatat.

### Selesai bila
- Pada setiap foto tersedia ikon favorit (misal hati) yang bisa diklik oleh klien.
- Saat diklik, ikon berubah tampilan (misal dari kosong menjadi terisi penuh atau berubah warna) dan status favorit foto tersebut tersimpan ke database.
- Jika klien membuka kembali tautan galeri di lain waktu, foto yang sudah difavoritkan tetap menunjukkan status aktif (ikon tetap terisi).
- Tidak ada batasan jumlah foto yang bisa difavoritkan, dan proses penyimpanan tidak memerlukan registrasi atau konfirmasi tambahan.

## Sub-fitur: Perbandingan Sebelum-Sesudah

Melihat dua versi foto (mentah vs edit) secara berdampingan untuk memudahkan keputusan.

### Tujuan
Membantu klien membandingkan versi mentah dengan versi edit dari suatu foto secara visual agar dapat mengambil keputusan lebih baik.

### Selesai bila
- Pada foto yang memiliki dua versi (url_original dan url_edited), tersedia tombol atau penggeser (slider) untuk mengaktifkan mode perbandingan.
- Saat mode aktif, klien dapat melihat secara langsung perbedaan antara foto mentah dan foto edit, baik dalam tampilan berdampingan atau overlay dengan slider.
- Mode perbandingan mudah diakses, tidak mengganggu tampilan utama, dan dapat ditutup kembali ke tampilan foto tunggal.
- Jika foto hanya memiliki satu versi (tidak ada url_edited), tombol perbandingan tidak muncul atau dinonaktifkan.

## Task

### 1. Buat halaman galeri foto responsif

### 2. Tambahkan indikator tahap pengerjaan proyek

### 3. Implementasi tombol favorit foto dengan klik

### 4. Buat mode perbandingan sebelum-sesudah foto

### 5. Buat skema basis data galeri dan favorit

### 6. Buat API endpoint data galeri proyek

### 7. Buat API endpoint kelola favorit foto

### 8. Aktifkan langganan real-time status proyek
