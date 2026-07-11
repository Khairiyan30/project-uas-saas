import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Hook proteksi route — redirect ke /login jika user belum login.
 * Mengecek token Supabase di localStorage.
 * 
 * Returns `true` saat user terautentikasi (memiliki token), `false` saat sedang redirect.
 */
export function useRequireAuth(): boolean {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // Cek apakah user login (memiliki token)
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("sb-access-token")
        : null;

    if (!token) {
      router.replace("/login");
    } else {
      setIsAuthed(true);
    }
  }, [router]);

  return isAuthed;
}
