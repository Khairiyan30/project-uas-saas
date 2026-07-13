"use client";

import { useState } from "react";

interface InviteClientModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onInvited?: () => void;
}

export function InviteClientModal({ open, onClose, projectId, onInvited }: InviteClientModalProps) {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!open) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSending(true);
    setStatus("idle");
    setMessage("");

    try {
      const token = localStorage.getItem("sb-access-token");
      const res = await fetch(`/api/projects/${projectId}/clients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("Undangan berhasil dikirim!");
        setEmail("");
        onInvited?.();
      } else {
        setStatus("error");
        setMessage(data.error || "Gagal mengirim undangan.");
      }
    } catch {
      setStatus("error");
      setMessage("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Undang Klien</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          Masukkan email klien untuk mengirim undangan akses ke proyek ini.
        </p>

        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label htmlFor="clientEmail" className="mb-1.5 block text-xs font-semibold text-gray-700">
              Email Klien
            </label>
            <input
              id="clientEmail"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setStatus("idle");
                setMessage("");
              }}
              placeholder="klien@email.com"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none transition-all duration-300 hover:border-gray-300 focus:border-[#65195E] focus:ring-1 focus:ring-[#65195E]"
              autoFocus
            />
          </div>

          {status === "success" && (
            <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-600">
              {message}
            </div>
          )}

          {status === "error" && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {message}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={isSending || !email.trim()}
              className="flex-1 rounded-lg bg-[#65195E] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#91157E] hover:shadow-md disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSending ? "Mengirim…" : "Kirim Undangan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
