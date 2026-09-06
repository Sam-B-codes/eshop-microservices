import { z } from "zod";

const productSchemaFields = {
  title: z.string().trim().min(3, "Title must contain at least 3 characters"),

  description: z
    .string()
    .trim()
    .min(10, "Description must contain at least 10 characters"),

  category: z.string().trim().min(1, "Category is required"),

  brand: z.string().trim().optional(),

  price: z
    .number()
    .finite("Price must be a valid number")
    .positive("Price must be greater than zero"),

  discountPrice: z
    .number()
    .finite("Discount price must be a valid number")
    .nonnegative("Discount price cannot be negative")
    .nullable()
    .optional(),

  stock: z
    .number()
    .int("Stock must be a whole number")
    .nonnegative("Stock cannot be negative"),

  sku: z.string().trim().optional(),

  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),

  images: z.array(
    z.object({
      url: z.string().url("Image URL is invalid"),

      publicId: z.string().trim().min(1, "Image public ID is required"),
    }),
  ),

  tags: z.array(z.string().trim()).default([]),
};

export const createProductSchema = z
  .object(productSchemaFields)
  .superRefine((data, context) => {
    if (
      data.discountPrice !== null &&
      data.discountPrice !== undefined &&
      data.discountPrice >= data.price
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,

        path: ["discountPrice"],

        message: "Discount price must be lower than the regular price",
      });
    }
  });

export const updateProductSchema = z
  .object(productSchemaFields)
  .partial()
  .superRefine((data, context) => {
    /*
     * When both values are supplied, validate them
     * immediately. Partial price updates are validated
     * against stored values inside the service.
     */
    if (
      data.price !== undefined &&
      data.discountPrice !== null &&
      data.discountPrice !== undefined &&
      data.discountPrice >= data.price
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,

        path: ["discountPrice"],

        message: "Discount price must be lower than the regular price",
      });
    }
  });

export type CreateProductInput = z.infer<typeof createProductSchema>;

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
