import { z } from "zod";

export const productSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(120, "Title cannot exceed 120 characters"),

    description: z
      .string()
      .min(20, "Description must be at least 20 characters"),

    category: z
      .string()
      .min(1, "Category is required"),   

    brand: z.string().optional(),

    price: z
      .number()
      .positive("Price must be greater than 0"),

    discountPrice: z
      .number()
      .optional(),

    stock: z
      .number()
      .int("Stock must be a whole number")
      .min(0, "Stock cannot be negative"),

    sku: z.string().optional(),

    status: z.enum([
      "DRAFT",
      "PUBLISHED",
    ]),

    images: z
      .array(
        z.object({
          url: z.string().url(),

          publicId: z.string(),

          // Cloudinary metadata is optional for existing images
          width: z.number().optional(),

          height: z.number().optional(),

          format: z.string().optional(),

          bytes: z.number().optional(),
        })
      )
      .min(1, "Please upload at least one image"),

    tags: z.array(z.string()),
  })
  .refine(
    (data) =>
      !data.discountPrice ||
      data.discountPrice < data.price,
    {
      path: ["discountPrice"],
      message:
        "Discount price must be less than regular price",
    }
  );

export type ProductFormValues = z.infer<
  typeof productSchema
>;