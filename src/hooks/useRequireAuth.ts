import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AUTH_STORAGE_KEY = "cgp.auth.user";

/**
 * Hook proteksi route — redirect ke /login jika user belum login.
 * Stub: mengecek localStorage (akan diganti Supabase session check).
 *
 * Returns `true` saat user terautentikasi, `false` saat sedang redirect.
 */
export function useRequireAuth(): boolean {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // Cek apakah user "login" (stub: key ada di localStorage)
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(AUTH_STORAGE_KEY)
        : null;

    if (!token) {
      router.replace("/login");
    } else {
      setIsAuthed(true);
    }
  }, [router]);

  return isAuthed;
}

/**
 * Helper untuk "login" secara stub — set key di localStorage.
 * Dipanggil dari halaman login/signup setelah submit berhasil.
 */
export function setStubAuth(email: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ email, loggedInAt: new Date().toISOString() })
    );
  }
}
