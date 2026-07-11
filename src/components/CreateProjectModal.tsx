"use client";

import { useState } from "react";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (project: any) => void;
}

/**
 * Modal / Form Buat Proyek Baru.
 */
export function CreateProjectModal({
  open,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const [form, setForm] = useState({
    name: "",
    event_type: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Nama proyek wajib diisi");
      return;
    }
    if (!form.event_type.trim()) {
      setError("Jenis acara wajib diisi");
      return;
    }

    setIsSubmitting(true);

    // Generate unique slug
    const slug =
      form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Math.random().toString(36).substring(2, 7);

    const newProject = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      event_type: form.event_type.trim(),
      description: form.description.trim(),
      progress_status: "Persiapan",
      unique_slug: slug,
      created_at: new Date().toISOString(),
      user_id: "mock-user",
    };

    // Simulasi delay
    await new Promise((r) => setTimeout(r, 500));

    onCreated(newProject);
    setForm({ name: "", event_type: "", description: "" });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Buat Proyek Baru
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nama Klien / Proyek
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Contoh: Prewedding Andi & Budi"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition-all duration-300 hover:border-gray-300 focus:border-[#65195E] focus:ring-1 focus:ring-[#65195E]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Jenis Acara
            </label>
            <select
              name="event_type"
              value={form.event_type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition-all duration-300 hover:border-gray-300 focus:border-[#65195E] focus:ring-1 focus:ring-[#65195E] cursor-pointer"
            >
              <option value="">Pilih jenis acara</option>
              <option>Wedding</option>
              <option>Graduation</option>
              <option>Engagement</option>
              <option>Portrait</option>
              <option>Event</option>
              <option>Lainnya</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Deskripsi <span className="text-gray-400">(opsional)</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Catatan atau deskripsi proyek..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition-all duration-300 hover:border-gray-300 focus:border-[#65195E] focus:ring-1 focus:ring-[#65195E]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-[#65195E] py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-[#91157E] hover:shadow-md active:scale-[0.98] disabled:bg-gray-400"
            >
              {isSubmitting ? "Menyimpan…" : "Buat Proyek"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
