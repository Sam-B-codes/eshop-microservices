import api from "./api";
import {
  CreateCouponData,
  UpdateCouponData,
} from "@/types/coupon";

export const createCoupon = async (
  data: CreateCouponData
) => {
  const response = await api.post("/coupons", data);
  return response.data;
};

export const getCoupons = async () => {
  const response = await api.get("/coupons");
  return response.data;
};

export const getCouponById = async (id: string) => {
  const response = await api.get(`/coupons/${id}`);
  return response.data;
};

export const updateCoupon = async (
  id: string,
  data: UpdateCouponData
) => {
  const response = await api.put(
    `/coupons/${id}`,
    data
  );
  return response.data;
};

export const deleteCoupon = async (id: string) => {
  const response = await api.delete(
    `/coupons/${id}`
  );
  return response.data;
};