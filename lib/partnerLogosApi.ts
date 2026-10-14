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

/** Hero banner at the top of the website's Partners & Supporters page. */
export interface PartnersHero {
  /** First line of the page's H1 (blue) */
  blueTitle: string;
  /** Second line of the page's H1 (green) */
  greenTitle: string;
  description: string;
  bgImage: string;
  bgImageAlt: string;
  badge1Title: string;
  badge1Icon: string;
  badge1IconAlt: string;
  badge2Title: string;
  badge2Icon: string;
  badge2IconAlt: string;
  badge3Title: string;
  badge3Icon: string;
  badge3IconAlt: string;
  updatedAt?: string;
  updatedBy?: string;
}

/** "Become a Partner" banner at the bottom of the page. */
export interface PartnersCta {
  headingWhite: string;
  headingGreen: string;
  subtitle: string;
  buttonLabel: string;
  /** "/contact" (a page on the website) or a full https:// link */
  buttonHref: string;
  image: string;
  imageAlt: string;
  updatedAt?: string;
  updatedBy?: string;
}

/** Uploads to Cloudinary (arogya_2026/partners/page) and returns the image URL */
const uploadPageImage = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.postForm<{ url: string; fileSize: string }>("/partner-logos/page-upload", form);
};

export const partnersHeroApi = {
  get: () => api.get<PartnersHero>("/partner-logos/hero"),
  save: (input: Omit<PartnersHero, "updatedAt" | "updatedBy">) => api.put<PartnersHero>("/partner-logos/hero", input),
  upload: uploadPageImage,
};

export const partnersCtaApi = {
  get: () => api.get<PartnersCta>("/partner-logos/cta"),
  save: (input: Omit<PartnersCta, "updatedAt" | "updatedBy">) => api.put<PartnersCta>("/partner-logos/cta", input),
  upload: uploadPageImage,
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
