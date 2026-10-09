import { api } from "./api";

// Partners & Supporters (website /partners) — managed from the Exhibitor List page.

export interface PartnerCategory {
  _id: string;
  name: string;
  color: string;
  order: number;
  logoCount?: number;
}

export interface PartnerLogo {
  _id: string;
  name: string;
  designation: string;
  logo: string;
  logoAlt: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  order: number;
  status: "Published" | "Draft";
  websiteUrl: string;
  fileSize: string;
  updatedBy: string;
  updatedAt: string;
}

export type PartnerLogoInput = {
  name: string;
  designation?: string;
  logo: string;
  logoAlt: string;
  categoryId: string;
  order?: number;
  status?: "Published" | "Draft";
  websiteUrl?: string;
  fileSize?: string;
};

export const partnerLogosApi = {
  categories: () => api.get<PartnerCategory[]>("/partner-logos/categories"),
  createCategory: (input: { name: string; color?: string }) =>
    api.post<PartnerCategory>("/partner-logos/categories", input),
  updateCategory: (id: string, input: Partial<{ name: string; color: string; order: number }>) =>
    api.put<PartnerCategory>(`/partner-logos/categories/${id}`, input),
  deleteCategory: (id: string) => api.delete<null>(`/partner-logos/categories/${id}`),

  logos: () => api.get<PartnerLogo[]>("/partner-logos/logos"),
  createLogo: (input: PartnerLogoInput) => api.post<PartnerLogo>("/partner-logos/logos", input),
  updateLogo: (id: string, input: Partial<PartnerLogoInput>) => api.put<PartnerLogo>(`/partner-logos/logos/${id}`, input),
  deleteLogo: (id: string) => api.delete<null>(`/partner-logos/logos/${id}`),

  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/partner-logos/upload", form);
  },
};
