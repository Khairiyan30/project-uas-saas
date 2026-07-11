"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";

interface BeforeAfterSliderProps {
  urlOriginal: string;
  urlEdited: string;
  filename: string;
  onClose: () => void;
}

/**
 * Slider perbandingan sebelum-sesudah foto.
 * Klien dapat menggeser slider horizontal untuk melihat perbedaan
 * antara foto original (mentah) dan edited (sudah diedit).
 */
export function BeforeAfterSlider({
  urlOriginal,
  urlEdited,
  filename,
  onClose,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      updatePosition(e.touches[0].clientX);
    },
    [isDragging, updatePosition]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleTouchMove]);

  // Handle click on container to jump slider
  const handleContainerClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-slider-handle]")) return;
    updatePosition(e.clientX);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">{filename}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30"
            aria-label="Tutup perbandingan"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Slider container */}
        <div
          ref={containerRef}
          className="relative aspect-[4/3] w-full cursor-col-resize select-none overflow-hidden rounded-lg bg-gray-900"
          onClick={handleContainerClick}
        >
          {/* Layer belakang: Edited (full) */}
          <div className="absolute inset-0">
            <Image
              src={urlEdited}
              alt={`${filename} - Edited`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>

          {/* Layer depan: Original (clipped by slider) */}
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <Image
              src={urlOriginal}
              alt={`${filename} - Original`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>

          {/* Slider handle line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
            style={{ left: `${sliderPos}%` }}
          />

          {/* Slider handle circle */}
          <div
            data-slider-handle
            className="absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-col-resize items-center justify-center rounded-full bg-white shadow-lg transition-transform hover:scale-110"
            style={{ left: `${sliderPos}%` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>

          {/* Labels */}
          <span className="absolute left-3 top-3 rounded bg-black/50 px-2 py-1 text-xs font-medium text-white">
            Original
          </span>
          <span className="absolute right-3 top-3 rounded bg-black/50 px-2 py-1 text-xs font-medium text-white">
            Edited
          </span>
        </div>

        {/* Hint */}
        <p className="mt-2 text-center text-xs text-gray-400">
          Geser slider untuk membandingkan foto original dan edited
        </p>
      </div>
    </div>
  );
}
