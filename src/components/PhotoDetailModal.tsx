"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { Photo, Comment } from "@/lib/types";

interface PhotoDetailModalProps {
  photo: Photo;
  isOwner: boolean;
  onClose: () => void;
}

export function PhotoDetailModal({ photo, isOwner, onClose }: PhotoDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchComments();
  }, [photo.id]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (!loadingComments) inputRef.current?.focus();
  }, [loadingComments]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/photos/${photo.id}/comments`);
      const data = await res.json();
      setComments(data.comments ?? []);
    } catch {
      // silent
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSend = async () => {
    if (!newComment.trim() || sending) return;
    setSending(true);
    const token = localStorage.getItem("sb-access-token");
    try {
      const res = await fetch(`/api/photos/${photo.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        setNewComment("");
        await fetchComments();
      }
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    const token = localStorage.getItem("sb-access-token");
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch {
      // silent
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex h-full w-full max-h-[95vh] max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:flex-row">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
        >
          <i className="ri-close-line text-lg" />
        </button>

        {/* Photo area */}
        <div className="relative flex min-h-48 flex-1 items-center justify-center bg-black">
          <Image
            src={photo.url_original}
            alt={photo.filename}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 100vw, 70vw"
          />
          {photo.url_edited && (
            <a
              href={photo.url_edited}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-white"
            >
              <i className="ri-arrow-right-left-line mr-1" />
              Lihat Editan
            </a>
          )}
        </div>

        {/* Comments panel */}
        <div className="flex w-full flex-col sm:w-80 lg:w-96">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-xs font-semibold text-gray-500 truncate">{photo.filename}</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-0 px-4 py-3">
            {loadingComments ? (
              <div className="flex items-center justify-center py-8">
                <i className="ri-loader-4-line animate-spin text-gray-400" />
              </div>
            ) : comments.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-400">
                Belum ada komentar. Mulai diskusi!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="group flex items-start gap-2 py-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#65195E]/10 text-[10px] font-bold text-[#65195E]">
                    {((comment.user?.full_name ?? "U")[0]).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-gray-900">
                        {comment.user?.full_name ?? "User"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-600 break-words">{comment.content}</p>
                  </div>
                  {(isOwner || comment.user_id === comment.user?.id) && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="shrink-0 rounded p-1 text-gray-300 opacity-0 transition hover:text-red-500 group-hover:opacity-100"
                      title="Hapus komentar"
                    >
                      <i className="ri-delete-bin-5-line text-xs" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-100 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tulis komentar…"
                maxLength={1000}
                className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#65195E] focus:ring-1 focus:ring-[#65195E]"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || sending}
                className="flex items-center gap-1 rounded-lg bg-[#65195E] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#91157E] disabled:opacity-50"
              >
                {sending ? (
                  <i className="ri-loader-4-line animate-spin" />
                ) : (
                  <i className="ri-send-plane-fill" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
