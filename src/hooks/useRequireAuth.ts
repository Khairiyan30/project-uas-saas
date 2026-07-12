import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook proteksi route — redirect ke /login jika user belum login atau sesi expired.
 * 
 * Returns `true` saat user terautentikasi (memiliki profil valid), `false` saat sedang memuat/redirect.
 */
export function useRequireAuth(): boolean {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Jika proses loading selesai dan user null (tidak login/token expired)
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  // Mengembalikan true hanya jika loading selesai dan user ada
  return !isLoading && !!user;
}
