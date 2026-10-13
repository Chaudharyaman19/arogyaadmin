import { api } from "./api";

// Website Blogs page — Pages & CMS → Blogs & News. Hero banner, category navigation and
// stats band are saved to backend-arogya; the website reads them from GET /api/blog-page.

export interface BlogHero {
  /** The page's only H1 */
  title: string;
  /** "\n" = line break on the website */
  description: string;
  /** Part of the description shown in bold */
  descriptionHighlight: string;
  searchPlaceholder: string;
  bgImage: string;
  bgImageAlt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface BlogCategoryLink {
  /** "\n" splits the title over two lines on the website */
  title: string;
  icon: string;
  iconAlt: string;
}

export interface BlogStat {
  value: string;
  label: string;
  icon: string;
  iconAlt: string;
}

export interface BlogList<T> {
  items: T[];
  updatedAt?: string;
  updatedBy?: string;
}

/** Uploads to Cloudinary (arogya_2026/blog-page) and returns the image URL */
const upload = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.postForm<{ url: string; fileSize: string }>("/blog-page/upload", form);
};

export const blogHeroApi = {
  get: () => api.get<BlogHero>("/blog-page/hero"),
  save: (input: Omit<BlogHero, "updatedAt" | "updatedBy">) => api.put<BlogHero>("/blog-page/hero", input),
  upload,
};

export const blogCategoriesApi = {
  get: () => api.get<BlogList<BlogCategoryLink>>("/blog-page/categories"),
  /** Saves the whole list in the order given */
  save: (items: BlogCategoryLink[]) => api.put<BlogList<BlogCategoryLink>>("/blog-page/categories", { items }),
  upload,
};

export const blogStatsApi = {
  get: () => api.get<BlogList<BlogStat>>("/blog-page/stats"),
  /** Saves the whole list in the order given */
  save: (items: BlogStat[]) => api.put<BlogList<BlogStat>>("/blog-page/stats", { items }),
  upload,
};
