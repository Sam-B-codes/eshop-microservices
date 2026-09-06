"use client";

import { useState } from "react";

import { useFormContext } from "react-hook-form";

import {
  ImagePlus,
  Images,
  Loader2,
} from "lucide-react";

import { toast } from "sonner";

import ImageCard from "./ImageCard";
import UploadDropzone from "./UploadDropzone";

import {
  uploadImage,
} from "@/services/upload.service";

import { ProductFormValues } from "@/schema/product.schema";

const MAX_IMAGES = 8;

export default function ImageUploader() {
  const {
    watch,
    setValue,
  } =
    useFormContext<ProductFormValues>();

  const images =
    watch("images") || [];

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    progress,
    setProgress,
  ] = useState(0);

  /* ============================================================
     UPLOAD IMAGES
  ============================================================ */

  const handleFiles = async (
    files: File[]
  ) => {
    if (!files.length) return;

    if (
      images.length +
        files.length >
      MAX_IMAGES
    ) {
      toast.warning(
        `Maximum ${MAX_IMAGES} images allowed.`
      );

      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      let completed = 0;

      const uploadedImages =
        await Promise.all(
          files.map(
            async (file) => {
              const image =
                await uploadImage(
                  file
                );

              completed++;

              setProgress(
                Math.round(
                  (completed /
                    files.length) *
                    100
                )
              );

              return image;
            }
          )
        );

      setValue(
        "images",
        [
          ...images,
          ...uploadedImages,
        ],
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      );
    } catch (error) {
      console.error(
        "Image upload error:",
        error
      );

      toast.error(
        "One or more images failed to upload."
      );
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  /* ============================================================
     REMOVE IMAGE
  ============================================================ */

  const removeImage = (
    index: number
  ) => {
    const updated = [
      ...images,
    ];

    updated.splice(index, 1);

    setValue(
      "images",
      updated,
      {
        shouldValidate: true,
        shouldDirty: true,
      }
    );
  };

  return (
    <section className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between gap-4 border-b border-black/[0.06] px-5 py-5 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-[#0b1220]">
            <ImagePlus
              className="h-5 w-5"
              strokeWidth={1.8}
            />
          </div>

          <div>
            <h2 className="text-base font-semibold tracking-[-0.02em] text-neutral-950">
              Product media
            </h2>

            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Upload clear,
              high-quality images of
              your product.
            </p>
          </div>
        </div>

        <span className="hidden rounded-full bg-neutral-100 px-3 py-1.5 text-[10px] font-semibold text-neutral-600 sm:inline-flex">
          {images.length}/
          {MAX_IMAGES}
        </span>
      </div>

      {/* ======================================================
          BODY
      ====================================================== */}

      <div className="space-y-6 p-5 sm:p-6">
        <UploadDropzone
          onFilesSelected={
            handleFiles
          }
          disabled={
            uploading ||
            images.length >=
              MAX_IMAGES
          }
        />

        {/* ====================================================
            UPLOAD PROGRESS
        ==================================================== */}

        {uploading && (
          <div className="rounded-2xl border border-black/[0.06] bg-neutral-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />

                <span className="text-xs font-semibold text-neutral-600">
                  Uploading
                  images
                </span>
              </div>

              <span className="text-xs font-semibold text-neutral-700">
                {progress}%
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-[#0b1220] transition-all duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* ====================================================
            IMAGES
        ==================================================== */}

        {images.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Images className="h-4 w-4 text-neutral-400" />

                <h3 className="text-xs font-semibold text-neutral-700">
                  Uploaded
                  images
                </h3>
              </div>

              <span className="text-[11px] text-neutral-400">
                First image is
                primary
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {images.map(
                (
                  image,
                  index
                ) => (
                  <div
                    key={
                      image.publicId
                    }
                    className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white transition hover:border-black/[0.12]"
                  >
                    <ImageCard
                      image={
                        image
                      }
                      index={
                        index
                      }
                      isPrimary={
                        index ===
                        0
                      }
                      uploading={
                        uploading
                      }
                      progress={
                        progress
                      }
                      onDelete={
                        removeImage
                      }
                    />
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <div className="flex flex-col gap-1 border-t border-black/[0.05] bg-neutral-50/70 px-5 py-3.5 text-[10px] text-neutral-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>
          Maximum {MAX_IMAGES}{" "}
          images
        </span>

        <span>
          PNG · JPG · WEBP ·
          AVIF
        </span>
      </div>
    </section>
  );
}