"use client";

import { useParams } from "next/navigation";

import EditProductForm from "@/components/dashboard/products/EditProductForm";

export default function EditProductPage() {
  const params = useParams();

  const productId =
    params.id as string;

  return (
    <div className="w-full min-w-0">
      <EditProductForm
        productId={productId}
      />
    </div>
  );
}