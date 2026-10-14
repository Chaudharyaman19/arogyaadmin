import { api } from "./api";

/* =========================================================
   DELEGATES API — backend-arogya /api/v1/delegates
   Verified delegate registrations (website + CRM) for
   Engagement & Leads → Delegates Overview and the Single /
   Group Registration day-wise lists.
========================================================= */

export type RegistrationType = "single" | "group";
export type DayFilter = "all" | "day-1" | "day-2" | "day-3";

export interface Delegate {
  _id: string;
  delegateId?: string;
  title?: string;
  fullName: string;
  email: string;
  mobile?: string;
  whatsappNumber?: string;
  planName?: string;
  price?: string;
  transactionId?: string;
  designation?: string;
  organization?: string;
  country?: string;
  state?: string;
  city?: string;
  category?: string;
  industryType?: string;
  specialization?: string;
  areasOfInterest?: string;
  source?: string;
  platform?: string;
  couponCode?: string | null;
  isSpeaker?: string;
  dietary?: string;
  assistance?: string;
  documentUrl?: string;
  address?: string;
  isVerified?: boolean;
  createdAt: string;
  /* Worked out by the backend */
  registrationType: RegistrationType;
  days: number[];
  groupSize: number;
  isPrimary: boolean;
  amount: number;
  /** Only on GET /delegates/:id — everyone in the same group booking */
  groupMembers?: Delegate[];
}

export const delegatesApi = {
  list: () => api.get<Delegate[]>("/delegates"),
  get: (id: string) => api.get<Delegate>(`/delegates/${id}`),
  remove: (id: string) => api.delete<{ id: string }>(`/delegates/${id}`),
  bulkRemove: (ids: string[]) => api.post<{ deletedCount: number }>("/delegates/bulk-delete", { ids }),
};

/* ---------- shared helpers ---------- */

export const CONFERENCE_DAYS: Record<1 | 2 | 3, string> = {
  1: "21 Aug (Fri)",
  2: "22 Aug (Sat)",
  3: "23 Aug (Sun)",
};

/** "All Days" lists multi-day passes; Day 1 / 2 / 3 list one-day passes for that day */
export const matchesDay = (delegate: Delegate, day: DayFilter) => {
  if (day === "all") return delegate.days.length >= 2;
  const n = Number(day.slice(4));
  return delegate.days.length === 1 && delegate.days[0] === n;
};

export const daysLabel = (days: number[]) =>
  days.length === 3 ? "All 3 Days" : days.map((d) => `Day ${d}`).join(" + ");

export const isWebsiteSource = (delegate: Delegate) =>
  (delegate.platform || "").toLowerCase() === "website" || (delegate.source || "").toLowerCase() === "website";

export const formatInr = (value: number) => `₹${value.toLocaleString("en-IN")}`;
