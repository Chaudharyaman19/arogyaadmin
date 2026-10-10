import { api } from "./api";

// Delegate passes (website registration page) — managed from System & Security → Delegate Passes.

export type PassApplicableTo = "both" | "single" | "group";
export type PassStatus = "active" | "inactive";

export interface DelegatePass {
  _id: string;
  name: string;
  price: number;
  daysText: string;
  applicableTo: PassApplicableTo;
  includes: string[];
  isMostPopular: boolean;
  status: PassStatus;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export type DelegatePassInput = {
  name: string;
  price: number;
  daysText?: string;
  applicableTo?: PassApplicableTo;
  includes?: string[];
  isMostPopular?: boolean;
  status?: PassStatus;
  order?: number;
};

export const delegatePassesApi = {
  // all=true also returns inactive passes (the website only gets active ones).
  list: () => api.get<DelegatePass[]>("/delegate-passes?all=true"),
  create: (input: DelegatePassInput) => api.post<DelegatePass>("/delegate-passes", input),
  update: (id: string, input: Partial<DelegatePassInput>) => api.put<DelegatePass>(`/delegate-passes/${id}`, input),
  remove: (id: string) => api.delete<null>(`/delegate-passes/${id}`),
};
