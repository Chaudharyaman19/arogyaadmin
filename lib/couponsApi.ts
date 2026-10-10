import { api } from "./api";

// Discount coupons for delegate registration — managed from System & Security → Coupons.

export type CouponApplicableTo = "both" | "single" | "group";
export type CouponState = "active" | "inactive" | "sold_out";

export interface Coupon {
  _id: string;
  code: string;
  discountPercent: number;
  applicableTo: CouponApplicableTo;
  status: "available" | "used";
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
  usedBy: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type CouponInput = {
  code: string;
  discountPercent: number;
  applicableTo: CouponApplicableTo;
  usageLimit: number;
};

/** The single status the admin sees: a used-up coupon is "sold out" whatever its active flag. */
export const couponState = (coupon: Coupon): CouponState =>
  coupon.status === "used" ? "sold_out" : coupon.isActive ? "active" : "inactive";

export const couponsApi = {
  list: () => api.get<Coupon[]>("/coupons"),
  create: (input: CouponInput) => api.post<Coupon>("/coupons", input),
  update: (id: string, input: Partial<CouponInput>) => api.put<Coupon>(`/coupons/${id}`, input),
  remove: (id: string) => api.delete<null>(`/coupons/${id}`),
  reset: (id: string) => api.put<Coupon>(`/coupons/${id}/reset`),
  setState: (id: string, state: CouponState) => api.put<Coupon>(`/coupons/${id}/set-state`, { state }),
};
