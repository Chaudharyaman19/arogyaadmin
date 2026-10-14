import { api } from "./api";

// Blog posts — Blog & Insights. Saved to backend-arogya (/api/v1/blogs); the website reads
// the live ones from GET /api/blogs and shows them on /blogs and /blogs/<slug>.

export interface BlogPostItem {
  _id?: string;
  id?: number | string;
  title: string;
  /** The article page's H1 (defaults to the title) */
  h1Title?: string;
  slug: string;
  excerpt?: string;
  content: string;
  category: string;
  author: string;
  authorRole?: string;
  tags?: string[] | string;
  status: "published" | "draft" | "scheduled" | "archived" | string;
  /** Shown in the "Featured Story" slider at the top of the website's Blogs page */
  featured: boolean;
  showOnHome: boolean;
  scheduledDate?: string | null;
  readTime: string;
  image: string;
  imageAlt?: string;
  views: number;
  publishDate?: string | Date;

  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  canonicalTag?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  openGraphTags?: string;
  schemaMarkup?: string;

  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface GetBlogsResponse {
  posts: BlogPostItem[];
  total: number;
  page: number;
  totalPages: number;
}

export const blogsApi = {
  list: (params?: {
    status?: string;
    showOnHome?: boolean | string;
    featured?: boolean | string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.showOnHome !== undefined) query.set("showOnHome", String(params.showOnHome));
    if (params?.featured !== undefined) query.set("featured", String(params.featured));
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const qs = query.toString();
    return api.get<GetBlogsResponse>(`/blogs${qs ? `?${qs}` : ""}`);
  },

  getByIdOrSlug: (idOrSlug: string) => {
    return api.get<BlogPostItem>(`/blogs/${idOrSlug}`);
  },

  create: (data: Partial<BlogPostItem>) => {
    return api.post<BlogPostItem>("/blogs", data);
  },

  update: (id: string, data: Partial<BlogPostItem>) => {
    return api.put<BlogPostItem>(`/blogs/${id}`, data);
  },

  delete: (id: string) => {
    return api.delete<{ deleted: boolean }>(`/blogs/${id}`);
  },

  /** Uploads a feature / OG image to Cloudinary (arogya_2026/blogs) and returns its URL */
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/blogs/upload", form);
  },
};

// Blog categories — Blog & Insights → Manage Categories. A post is filed under a category by
// its name; the website lists the published ones in the sidebar of its Blogs page.

export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  /** Hidden categories are not listed on the website */
  status: "Published" | "Hidden";
  order: number;
  totalPosts: number;
  updatedBy?: string;
  updatedAt?: string;
}

export type BlogCategoryInput = Pick<BlogCategory, "name" | "slug" | "description" | "status" | "order">;

export const blogCategoriesApi = {
  list: () => api.get<BlogCategory[]>("/blogs/categories"),
  create: (input: BlogCategoryInput) => api.post<BlogCategory>("/blogs/categories", input),
  update: (id: string, input: BlogCategoryInput) => api.put<BlogCategory>(`/blogs/categories/${id}`, input),
  remove: (id: string) => api.delete<null>(`/blogs/categories/${id}`),
};
