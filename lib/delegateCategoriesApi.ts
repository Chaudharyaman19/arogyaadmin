import { api } from "./api";

// Delegate registration categories (options on the website registration form) —
// managed from System & Security → Delegate Categories.

export type CategoryRegType = "both" | "single" | "group";

export interface DelegateCategory {
  _id: string;
  name: string;
  type: CategoryRegType;
  createdAt?: string;
  updatedAt?: string;
}

export type DelegateCategoryInput = {
  name: string;
  type: CategoryRegType;
};

export const delegateCategoriesApi = {
  list: () => api.get<DelegateCategory[]>("/delegate-categories"),
  create: (input: DelegateCategoryInput) => api.post<DelegateCategory>("/delegate-categories", input),
  update: (id: string, input: Partial<DelegateCategoryInput>) =>
    api.put<DelegateCategory>(`/delegate-categories/${id}`, input),
  remove: (id: string) => api.delete<null>(`/delegate-categories/${id}`),
};
