


"use client";

import {
  FormProvider,
  useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  Loader2,
  PackagePlus,
  Save,
  Send,
} from "lucide-react";

import { toast } from "sonner";

import { useRouter } from "next/navigation";

import { useEffect } from "react";

import {
  ProductFormValues,
  productSchema,
} from "@/schema/product.schema";

import {
  createProduct,
  updateProduct,
} from "@/services/product.service";

import { Product } from "@/types/product";

import GeneralInfo from "./GeneralInfo";
import ImageUploader from "./ImageUploader";
import InventorySection from "./InventorySection";
import OrganizationSection from "./OrganizationSection";
import PricingSection from "./PricingSection";
import PublishCard from "./PublishCard";
import TagsSection from "./TagsSection";

interface ProductFormProps {
  mode?: "create" | "edit";
  product?: Product;
}

export default function ProductForm({
  mode = "create",
  product,
}: ProductFormProps) {
  const router = useRouter();

  /* ============================================================
     FORM
  ============================================================ */

  const methods =
    useForm<ProductFormValues>({
      resolver:
        zodResolver(productSchema),

      defaultValues: {
        title: "",
        description: "",
        category: "",
        brand: "",
        price: 0,
        discountPrice: undefined,
        stock: 0,
        sku: "",
        status: "DRAFT",
        images: [],
        tags: [],
      },
    });

  const {
    handleSubmit,
    reset,
    getValues,

    formState: {
      isSubmitting,
    },
  } = methods;

  /* ============================================================
     LOAD PRODUCT FOR EDIT MODE
  ============================================================ */

  useEffect(() => {
    if (
      mode === "edit" &&
      product
    ) {
      reset({
        title:
          product.title,

        description:
          product.description,

        category:
          product.category,

        brand:
          product.brand || "",

        price:
          product.price,

        discountPrice:
          product.discountPrice,

        stock:
          product.stock,

        sku:
          product.sku || "",

        status:
          product.status ===
          "PUBLISHED"
            ? "PUBLISHED"
            : "DRAFT",

        images:
          product.images || [],

        tags:
          product.tags || [],
      });
    }
  }, [
    mode,
    product,
    reset,
  ]);

  /* ============================================================
     SAVE DRAFT
  ============================================================ */

  const handleSaveDraft =
    async () => {
      try {
        const data =
          getValues();

        const draftData = {
          ...data,
          status:
            "DRAFT" as const,
        };

        console.log(
          "SAVING DRAFT:",
          draftData
        );

        if (
          mode === "edit" &&
          product
        ) {
          await updateProduct(
            product.id,
            draftData
          );
        } else {
          await createProduct(
            draftData
          );
        }

        toast.success(
          "Draft saved successfully!"
        );

        setTimeout(() => {
          router.push(
            "/dashboard/products"
          );
        }, 500);
      } catch (
        error: any
      ) {
        console.error(
          "Save draft error:",
          error
        );

        const message =
          error?.response?.data
            ?.message ||
          "Failed to save draft. Please try again.";

        toast.error(message);
      }
    };

  /* ============================================================
     PUBLISH
  ============================================================ */

  const onSubmit = async (
    data: ProductFormValues
  ) => {
    try {
      const publishData = {
        ...data,
        status:
          "PUBLISHED" as const,
      };

      console.log(
        "PUBLISHING PRODUCT:",
        publishData
      );

      if (
        mode === "edit" &&
        product
      ) {
        await updateProduct(
          product.id,
          publishData
        );

        toast.success(
          "Product published successfully!"
        );

        setTimeout(() => {
          router.push(
            "/dashboard/products"
          );
        }, 500);

        return;
      }

      await createProduct(
        publishData
      );

      toast.success(
        "Product published successfully!"
      );

      setTimeout(() => {
        router.push(
          "/dashboard/products"
        );
      }, 500);
    } catch (
      error: any
    ) {
      console.error(
        "Publish product error:",
        error
      );

      const message =
        error?.response?.data
          ?.message ||
        "Failed to publish product. Please try again.";

      toast.error(message);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(
          onSubmit
        )}
        className="min-w-0 space-y-7"
      >
        {/* ======================================================
            PAGE HEADER
        ====================================================== */}

        <section className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
          <div className="flex flex-col gap-6 px-5 py-6 sm:px-7 sm:py-7 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex min-w-0 items-start gap-4">
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-[#0b1220] sm:flex">
                <PackagePlus
                  className="h-5 w-5"
                  strokeWidth={1.8}
                />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  Catalog management
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[34px]">
                  {mode === "edit"
                    ? "Edit product"
                    : "Add new product"}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                  {mode === "edit"
                    ? "Update product information, media, pricing and inventory before publishing your changes."
                    : "Add product details, media, pricing and inventory, then publish it when everything is ready."}
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={
                  handleSaveDraft
                }
                disabled={
                  isSubmitting
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/[0.09] bg-white px-5 text-sm font-semibold text-neutral-700 transition hover:border-black/[0.14] hover:bg-neutral-50 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save
                  className="h-4 w-4"
                  strokeWidth={1.8}
                />

                Save draft
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting
                }
                className="inline-flex min-h-11 min-w-[170px] items-center justify-center gap-2 rounded-full bg-[#0b1220] px-6 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(11,18,32,0.12)] transition hover:bg-[#172033] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    Publishing...
                  </>
                ) : (
                  <>
                    <Send
                      className="h-4 w-4"
                      strokeWidth={1.8}
                    />

                    {mode === "edit"
                      ? "Publish changes"
                      : "Publish product"}
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================
            FORM CONTENT
        ====================================================== */}

        <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-6">
            <GeneralInfo />

            <ImageUploader />

            <PricingSection />

            <InventorySection />
          </div>

          <aside className="min-w-0 space-y-6 xl:sticky xl:top-6">
            <OrganizationSection />

            <TagsSection />

            <PublishCard
              onSaveDraft={
                handleSaveDraft
              }
            />
          </aside>
        </div>
      </form>
    </FormProvider>
  );
}