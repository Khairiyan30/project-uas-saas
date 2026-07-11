# Autentikasi & Akun

Sistem login dan pengaturan akun untuk fotografer agar data proyek tersimpan aman.

## Spesifikasi

### Tujuan
Menyediakan sistem pendaftaran, masuk, keluar, pemulihan akses, dan pengelolaan profil bagi fotografer agar data proyek miliknya terlindungi dan hanya dapat diakses oleh pemilik sah akun.

### Selesai bila
- Fotografer dapat membuat akun baru dengan mengisi email dan kata sandi, lalu langsung diarahkan ke dashboard proyek.
- Fotografer dapat masuk ke akun terdaftar menggunakan email dan kata sandi yang benar, dan dapat keluar (logout) hingga kembali ke halaman login.
- Fotografer yang lupa kata sandi dapat meminta tautan reset via email, lalu membuat kata sandi baru melalui halaman yang disediakan.
- Fotografer dapat melihat dan mengubah nama tampilan, alamat email, serta foto profil dari halaman pengaturan akun.

## Sub-fitur: Daftar Akun

Fotografer membuat akun baru untuk mulai menggunakan platform.

### Tujuan
Memungkinkan fotografer membuat akun baru agar bisa menyimpan dan mengelola proyek secara pribadi di platform.

### Selesai bila
- Terdapat formulir pendaftaran yang meminta email, kata sandi, dan nama lengkap.
- Setelah mengisi formulir dengan data valid dan menekan tombol "Daftar", fotografer otomatis masuk dan diarahkan ke halaman dashboard.
- Muncul pesan error yang jelas jika email sudah terpakai atau format data tidak sesuai.

## Sub-fitur: Login & Logout

Masuk ke akun yang sudah terdaftar dan keluar dengan aman.

### Tujuan
Memberi akses masuk bagi fotografer terdaftar serta jalan keluar yang aman dari sesi akun.

### Selesai bila
- Halaman login menampilkan formulir input email dan kata sandi serta tombol "Masuk".
- Setelah login sukses, fotografer diarahkan ke dashboard proyek dan namanya muncul di pojok kanan atas.
- Tombol "Keluar" tersedia di navigasi, dan ketika diklik sesi berakhir lalu fotografer dikembalikan ke halaman login.

## Sub-fitur: Reset Password

Mengatur ulang kata sandi jika fotografer lupa atau ingin memperbarui.

### Tujuan
Membantu fotografer mendapatkan kembali akses ke akun saat lupa atau ingin mengganti kata sandi.

### Selesai bila
- Di halaman login tersedia tautan "Lupa kata sandi?" yang mengarah ke halaman permintaan reset.
- Fotografer dapat memasukkan email terdaftar dan menerima pesan "Jika email terdaftar, tautan reset telah dikirim" tanpa membocorkan informasi akun.
- Setelah mengklik tautan dari email, fotografer tiba di halaman untuk membuat kata sandi baru, dan begitu berhasil akan diarahkan ke halaman login.

## Sub-fitur: Pengaturan Profil

Mengubah nama, email, atau foto profil akun fotografer.

### Tujuan
Memungkinkan fotografer memperbarui informasi pribadi yang ditampilkan di akun.

### Selesai bila
- Halaman pengaturan profil menampilkan formulir berisi nama lengkap dan email saat ini yang dapat diubah.
- Tersedia area untuk mengunggah atau mengganti foto profil, dengan pratinjau langsung setelah dipilih.
- Setelah menekan tombol "Simpan Perubahan", data terbaru langsung tersimpan dan tampil di seluruh bagian aplikasi (seperti nama di pojok dashboard).

## Task

### 1. Buat halaman daftar akun dengan formulir dan data tiruan

### 2. Buat halaman login dengan formulir dan data tiruan

### 3. Buat halaman lupa password dengan formulir email

### 4. Buat halaman reset password dengan formulir kata sandi baru

### 5. Buat halaman pengaturan profil dengan formulir ubah data

### 6. Buat navigasi global dengan tombol keluar dan nama pengguna

### 7. Buat flow logout dan redirect ke halaman login

### 8. Buat validasi error lokal pada semua formulir autentikasi

### 9. Buat komponen unggah foto profil dengan pratinjau lokal

### 10. Buat rute dan proteksi halaman dashboard setelah login tiruan

### 11. Setup tabel users di Supabase dengan migrasi

### 12. Buat endpoint registrasi akun baru

### 13. Buat endpoint login dan session management

### 14. Buat endpoint logout dan penghapusan session

### 15. Buat endpoint permintaan reset password via email

### 16. Buat endpoint konfirmasi reset password dengan token

### 17. Buat endpoint ambil data profil pengguna saat ini

### 18. Buat endpoint perbarui profil pengguna termasuk foto

### 19. Buat middleware proteksi rute API berdasarkan session

### 20. Setup storage bucket Supabase untuk foto profil
