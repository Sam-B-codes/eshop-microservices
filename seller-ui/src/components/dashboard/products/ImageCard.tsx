"use client";

import Image from "next/image";

import {
  Star,
  Trash2,
} from "lucide-react";

/* ============================================================
   IMAGE TYPE
============================================================ */

export interface UploadedImage {
  url: string;
  publicId: string;

  width?: number;
  height?: number;

  format?: string;
  bytes?: number;
}

/* ============================================================
   PROPS
============================================================ */

interface ImageCardProps {
  image: UploadedImage;

  index: number;

  isPrimary: boolean;

  progress?: number;

  uploading?: boolean;

  onDelete: (index: number) => void;
}

/* ============================================================
   COMPONENT
============================================================ */

export default function ImageCard({
  image,
  index,
  isPrimary,
  progress = 0,
  uploading = false,
  onDelete,
}: ImageCardProps) {
  /* ==========================================================
     IMAGE SIZE
  ========================================================== */

  const imageSize =
    image.bytes != null
      ? image.bytes >= 1024 * 1024
        ? `${(
            image.bytes /
            (1024 * 1024)
          ).toFixed(1)} MB`
        : `${(
            image.bytes / 1024
          ).toFixed(1)} KB`
      : null;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-black/[0.07] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition duration-200 hover:border-black/[0.12] hover:shadow-[0_12px_32px_rgba(0,0,0,0.07)]">
      {/* ======================================================
          IMAGE
      ====================================================== */}

      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <Image
          src={image.url}
          alt={`Product image ${index + 1}`}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
        />

        {/* ====================================================
            PRIMARY BADGE
        ==================================================== */}

        {isPrimary && (
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#0b1220] px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm">
            <Star
              className="h-3 w-3"
              fill="currentColor"
              strokeWidth={1.8}
            />

            Primary
          </div>
        )}

        {/* ====================================================
            DELETE
        ==================================================== */}

        {!uploading && (
          <button
            type="button"
            onClick={() =>
              onDelete(index)
            }
            aria-label={`Remove product image ${index + 1}`}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.06] bg-white/95 text-neutral-500 opacity-100 shadow-sm backdrop-blur transition hover:border-red-100 hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Trash2
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          </button>
        )}

        {/* ====================================================
            UPLOADING OVERLAY
        ==================================================== */}

        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xs font-semibold text-neutral-950 shadow-lg">
              {Math.round(progress)}%
            </div>

            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">
              Uploading
            </p>
          </div>
        )}
      </div>

      {/* ======================================================
          IMAGE INFORMATION
      ====================================================== */}

      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-neutral-700">
              Image {index + 1}
            </p>

            <p className="mt-1 truncate text-[10px] text-neutral-400">
              {image.publicId}
            </p>
          </div>

          {image.format && (
            <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
              {image.format}
            </span>
          )}
        </div>

        {/* ====================================================
            METADATA
        ==================================================== */}

        {(image.width != null ||
          image.height != null ||
          imageSize) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-black/[0.05] pt-3 text-[10px] text-neutral-400">
            {image.width != null &&
              image.height != null && (
                <span>
                  {image.width} ×{" "}
                  {image.height}
                </span>
              )}

            {imageSize && (
              <span>
                {imageSize}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}