"use client";

import {
  FormProvider,
  useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  Loader2,
  Save,
  Send,
  X,
} from "lucide-react";

import { toast } from "sonner";

import { useRouter } from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import {
  ProductFormValues,
  productSchema,
} from "@/schema/product.schema";

import {
  getProductById,
  updateProduct,
} from "@/services/product.service";

import GeneralInfo from "./GeneralInfo";
import ImageUploader from "./ImageUploader";
import InventorySection from "./InventorySection";
import OrganizationSection from "./OrganizationSection";
import PricingSection from "./PricingSection";
import PublishCard from "./PublishCard";
import TagsSection from "./TagsSection";

interface EditProductFormProps {
  productId: string;
}

export default function EditProductForm({
  productId,
}: EditProductFormProps) {
  const router = useRouter();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const methods =
    useForm<ProductFormValues>({
      resolver:
        zodResolver(
          productSchema
        ),

      defaultValues: {
        title: "",
        description: "",
        category: "",
        brand: "",
        price: 0,
        discountPrice:
          undefined,
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
     LOAD PRODUCT
  ============================================================ */

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);

        const response =
          await getProductById(
            productId
          );

        const product =
          response.product;

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
      } catch (
        error: any
      ) {
        console.error(
          "Failed to load product:",
          error
        );

        toast.error(
          error?.response?.data
            ?.message ||
            "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [
    productId,
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

        await updateProduct(
          productId,
          draftData
        );

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

        toast.error(
          error?.response?.data
            ?.message ||
            "Failed to save draft. Please try again."
        );
      }
    };

  /* ============================================================
     UPDATE / PUBLISH
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

      await updateProduct(
        productId,
        publishData
      );

      toast.success(
        "Product updated successfully!"
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
        "Update product error:",
        error
      );

      toast.error(
        error?.response?.data
          ?.message ||
          "Failed to update product. Please try again."
      );
    }
  };

  /* ============================================================
     VALIDATION ERROR
  ============================================================ */

  const handleInvalid = (
    errors: any
  ) => {
    console.log(
      "FORM VALIDATION ERRORS:",
      errors
    );

    if (
      errors.images?.message
    ) {
      toast.error(
        String(
          errors.images.message
        )
      );

      return;
    }

    toast.error(
      "Please check the form for errors."
    );
  };

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
            <Loader2 className="h-5 w-5 animate-spin text-[#0b1220]" />
          </div>

          <p className="text-sm font-semibold text-neutral-800">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  return (
    <FormProvider
      {...methods}
    >
      <form
        onSubmit={handleSubmit(
          onSubmit,
          handleInvalid
        )}
        className="min-w-0 space-y-7"
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <section className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.035)]">
          <div className="flex flex-col gap-6 px-5 py-6 sm:px-7 sm:py-7 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Catalog management
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[34px]">
                Edit product
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                Update product
                information, media,
                pricing and inventory
                before publishing your
                changes.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboard/products"
                  )
                }
                disabled={
                  isSubmitting
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/[0.09] bg-white px-5 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950 disabled:opacity-50"
              >
                <X className="h-4 w-4" />

                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSaveDraft
                }
                disabled={
                  isSubmitting
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/[0.09] bg-white px-5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />

                Save draft
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting
                }
                className="inline-flex min-h-11 min-w-[170px] items-center justify-center gap-2 rounded-full bg-[#0b1220] px-6 text-sm font-semibold text-white transition hover:bg-[#172033] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    Updating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />

                    Publish changes
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================
            CONTENT
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