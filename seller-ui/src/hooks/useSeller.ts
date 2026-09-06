"use client";

import { useSellerContext } from "@/context/SellerContext";

export const useSeller = () => {
  return useSellerContext();
};