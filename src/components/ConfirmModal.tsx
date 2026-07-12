"use client";

import { useEffect, useRef } from "react";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmModal({
  open,
  title = "Konfirmasi",
  message,
  confirmLabel = "Ya, Hapus",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-xl animate-fadeIn">
        {/* Icon area */}
        <div className="mb-4 flex justify-center">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              danger ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-500"
            }`}
          >
            <i className={danger ? "ri-delete-bin-6-line text-xl" : "ri-question-line text-xl"} />
          </div>
        </div>

        {/* Title & Message */}
        <h3 className="mb-1 text-center text-sm font-bold text-gray-900">
          {title}
        </h3>
        <p className="mb-6 text-center text-xs leading-relaxed text-gray-500">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-200 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-gray-50 active:scale-[0.98]"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-lg py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-[0.98] ${
              danger
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[#65195E] hover:bg-[#91157E]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}