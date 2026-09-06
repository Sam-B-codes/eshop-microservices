"use client";

import {
  useState,
} from "react";

import {
  useFormContext,
} from "react-hook-form";

import {
  Hash,
  Plus,
  X,
} from "lucide-react";

import { ProductFormValues } from "@/schema/product.schema";

export default function TagsSection() {
  const {
    watch,
    setValue,
  } =
    useFormContext<ProductFormValues>();

  const tags =
    watch("tags") || [];

  const [tag, setTag] =
    useState("");

  const addTag = () => {
    const value =
      tag.trim();

    if (!value) return;

    if (
      tags.includes(value)
    ) {
      setTag("");
      return;
    }

    if (
      tags.length >= 10
    ) {
      return;
    }

    setValue(
      "tags",
      [...tags, value],
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );

    setTag("");
  };

  const removeTag = (
    value: string
  ) => {
    setValue(
      "tags",
      tags.filter(
        (item) =>
          item !== value
      ),
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  };

  return (
    <section className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
      {/* Header */}

      <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-[#0b1220]">
          <Hash
            className="h-[18px] w-[18px]"
            strokeWidth={1.8}
          />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-neutral-950">
            Product tags
          </h2>

          <p className="mt-1 text-xs leading-5 text-neutral-500">
            Improve search and discovery.
          </p>
        </div>
      </div>

      {/* Body */}

      <div className="space-y-4 p-5">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Hash className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-300" />

            <input
              value={tag}
              onChange={(event) =>
                setTag(
                  event.target
                    .value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  event.preventDefault();

                  addTag();
                }
              }}
              placeholder="running"
              className="h-11 w-full rounded-xl border border-black/[0.08] bg-neutral-50 pl-9 pr-3 text-xs font-medium text-neutral-800 outline-none transition placeholder:text-neutral-400 hover:border-black/[0.12] focus:border-black/25 focus:bg-white focus:ring-4 focus:ring-black/[0.025]"
            />
          </div>

          <button
            type="button"
            onClick={addTag}
            disabled={
              tags.length >= 10
            }
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#0b1220] px-4 text-xs font-semibold text-white transition hover:bg-[#172033] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />

            Add
          </button>
        </div>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    removeTag(
                      item
                    )
                  }
                  className="group inline-flex items-center gap-1.5 rounded-full border border-black/[0.07] bg-neutral-50 px-3 py-1.5 text-[11px] font-semibold text-neutral-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  #{item}

                  <X className="h-3 w-3 transition-transform group-hover:rotate-90" />
                </button>
              )
            )}
          </div>
        ) : (
          <div className="rounded-xl bg-neutral-50 px-4 py-3">
            <p className="text-[11px] leading-5 text-neutral-400">
              No tags added yet.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-black/[0.05] pt-4">
          <span className="text-[10px] font-medium text-neutral-400">
            {tags.length}/10 tags
          </span>

          <span className="text-[10px] text-neutral-400">
            Press Enter to add
          </span>
        </div>
      </div>
    </section>
  );
}