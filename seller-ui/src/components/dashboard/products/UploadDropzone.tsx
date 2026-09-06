"use client";

import {
  useCallback,
} from "react";

import {
  useDropzone,
} from "react-dropzone";

import {
  CloudUpload,
  ImageIcon,
  Sparkles,
} from "lucide-react";

interface UploadDropzoneProps {
  onFilesSelected: (
    files: File[]
  ) => void;

  disabled?: boolean;
}

const ACCEPTED_TYPES = {
  "image/png": [],
  "image/jpeg": [],
  "image/jpg": [],
  "image/webp": [],
  "image/avif": [],
};

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

export default function UploadDropzone({
  onFilesSelected,
  disabled = false,
}: UploadDropzoneProps) {
  const onDrop = useCallback(
    (
      acceptedFiles: File[]
    ) => {
      onFilesSelected(
        acceptedFiles
      );
    },
    [onFilesSelected]
  );

  const {
    getRootProps,
    getInputProps,
    open,
    isDragActive,
    fileRejections,
  } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
    disabled,
    maxSize:
      MAX_FILE_SIZE,
    accept:
      ACCEPTED_TYPES,
  });

  return (
    <div className="space-y-3">
      {/* ======================================================
          DROPZONE
      ====================================================== */}

      <div
        {...getRootProps()}
        className={`relative overflow-hidden rounded-[22px] border border-dashed px-5 py-10 transition sm:px-8 sm:py-12 ${
          isDragActive
            ? "border-[#0b1220]/40 bg-neutral-100"
            : "border-black/[0.12] bg-neutral-50/70 hover:border-black/[0.2] hover:bg-neutral-50"
        } ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : ""
        }`}
      >
        <input
          {...getInputProps()}
        />

        <div className="relative flex flex-col items-center text-center">
          {/* Icon */}

          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl transition ${
              isDragActive
                ? "scale-105 bg-[#0b1220] text-white"
                : "border border-black/[0.05] bg-white text-neutral-600 shadow-sm"
            }`}
          >
            <CloudUpload
              className="h-6 w-6"
              strokeWidth={1.7}
            />
          </div>

          {/* Title */}

          <h3 className="mt-5 text-sm font-semibold text-neutral-950">
            {isDragActive
              ? "Drop your images here"
              : "Upload product images"}
          </h3>

          <p className="mt-2 max-w-md text-xs leading-5 text-neutral-500">
            Drag and drop product
            images here, or browse
            files from your device.
          </p>

          {/* Browse */}

          <button
            type="button"
            disabled={disabled}
            onClick={open}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[#0b1220] px-5 text-xs font-semibold text-white transition hover:bg-[#172033] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Browse images
          </button>

          {/* Information */}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] font-medium text-neutral-400">
            <span className="inline-flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" />

              Max 5 MB per image
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />

              High resolution
              recommended
            </span>
          </div>

          {/* Supported formats */}

          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {[
              "PNG",
              "JPG",
              "WEBP",
              "AVIF",
            ].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-md border border-black/[0.06] bg-white px-2 py-1 text-[9px] font-semibold tracking-[0.05em] text-neutral-400"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* ======================================================
          REJECTED FILES
      ====================================================== */}

      {fileRejections.length >
        0 && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-xs font-semibold text-red-700">
            Some files could not be
            added
          </p>

          <div className="mt-2 space-y-1">
            {fileRejections.map(
              (
                rejection,
                index
              ) => (
                <div
                  key={`${rejection.file.name}-${index}`}
                  className="flex items-center gap-2"
                >
                  <span className="h-1 w-1 rounded-full bg-red-400" />

                  <span className="truncate text-[11px] text-red-600">
                    {
                      rejection
                        .file.name
                    }
                  </span>
                </div>
              )
            )}
          </div>

          <p className="mt-2 text-[10px] text-red-500">
            Check the file type and
            make sure each image is
            under 5 MB.
          </p>
        </div>
      )}
    </div>
  );
}