/**
 * Utilitas validasi untuk formulir autentikasi.
 * Mengembalikan string error jika tidak valid, atau null jika valid.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 72; // bcrypt limit

export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) return "Email wajib diisi";
  if (!EMAIL_REGEX.test(email.trim())) return "Format email tidak valid";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Kata sandi wajib diisi";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Kata sandi maksimal ${MAX_PASSWORD_LENGTH} karakter`;
  }
  return null;
}

export function validateFullName(name: string): string | null {
  if (!name || !name.trim()) return "Nama lengkap wajib diisi";
  if (name.trim().length < 2) return "Nama terlalu pendek";
  return null;
}

export function validatePasswordMatch(
  password: string,
  confirm: string
): string | null {
  if (password !== confirm) return "Konfirmasi kata sandi tidak cocok";
  return null;
}
