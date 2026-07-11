"use client";

import { useParams } from "next/navigation";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { PhotoCard } from "@/components/PhotoCard";

/* ── Mock data (akan diganti API call saat backend siap) ── */
const MOCK_PROJECT = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  name: "Prewedding Andi & Budi",
  description:
    "Sesi pemotretan prewedding di Bali dengan tema sunset dan pantai.",
  progress_status: "Proses Edit",
  unique_slug: "prewedding-andi-budi-x7k9",
};

const MOCK_PHOTOS = Array.from({ length: 12 }, (_, i) => ({
  id: `photo-${i + 1}`,
  url_original: `https://picsum.photos/seed/gallery${i + 1}/800/600`,
  url_edited:
    i % 3 === 0
      ? `https://picsum.photos/seed/edited${i + 1}/800/600`
      : null,
  filename: `IMG_${String(i + 1).padStart(4, "0")}.jpg`,
  is_favorite: i === 2 || i === 5,
}));

/**
 * Galeri Klien Publik — halaman utama galeri foto responsif.
 * Diakses klien tanpa login via tautan unik (/:slug).
 */
export default function GalleryPage() {
  const params = useParams();
  const slug = params.slug as string;

  // TODO: ganti fetch dari API /api/gallery/[slug]
  const project = MOCK_PROJECT;
  const photos = MOCK_PHOTOS;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Header proyek ── */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {project.name}
          </h1>
          {project.description && (
            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              {project.description}
            </p>
          )}
        </div>
      </header>

      {/* ── Indikator Tahap Pengerjaan ── */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <ProgressIndicator projectId={project.id} />
      </section>

      {/* ── Grid galeri foto ── */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        {photos.length === 0 ? (
          <p className="text-center text-gray-400">
            Belum ada foto tersedia.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        )}
      </section>

      {/* ── Footer slug info (dev only) ── */}
      <footer className="py-4 text-center text-xs text-gray-300">
        slug: {slug}
      </footer>
    </main>
  );
}
