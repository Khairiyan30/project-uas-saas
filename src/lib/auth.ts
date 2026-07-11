/**
 * Utilitas autentikasi tiruan (stub).
 * Nanti akan diintegrasikan dengan Supabase Auth + session management.
 */

const AUTH_STORAGE_KEY = "cgp.auth.user";

export interface MockUser {
  fullName: string;
  email: string;
}

export const MOCK_USER: MockUser = {
  fullName: "Andi Pratama",
  email: "andi@email.com",
};

/**
 * Logout — hapus session dan redirect ke /login.
 */
export function logout(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  // Stub: panggil API logout di sini saat backend siap
  // await fetch("/api/auth/logout", { method: "POST" });
}

/**
 * Get current user (stub — selalu return MOCK_USER).
 */
export function getCurrentUser(): MockUser {
  return MOCK_USER;
}
