import { api } from "./api";

/* =========================================================
   Pages & CMS → "3. SEO Information"
   Saved straight to backend-arogya (/api/v1/page-seo); the website
   renders these values server-side for the matching page.
========================================================= */

/** Website addresses — canonical / OG URLs are generated for these */
export const LOCAL_SITE_URL = (process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const LIVE_SITE_URL = (process.env.NEXT_PUBLIC_LIVE_SITE_URL ?? "https://arogya.namogange.org").replace(/\/$/, "");

export type SeoEnv = "local" | "live";

/** Admin opened on localhost → canonical previews use the local website */
export const currentSeoEnv = (): SeoEnv =>
  typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname) ? "local" : "live";

/** "/" | "about" | "/about/" → "/" | "/about" */
export const pagePathOf = (slug?: string) => {
  const clean = (slug || "").trim().replace(/^\/+|\/+$/g, "");
  return clean ? `/${clean}` : "/";
};

export const canonicalUrlFor = (slug: string | undefined, env: SeoEnv) => {
  const path = pagePathOf(slug);
  return `${env === "local" ? LOCAL_SITE_URL : LIVE_SITE_URL}${path === "/" ? "" : path}`;
};

export const canonicalTagFor = (url: string) => `<link rel="canonical" href="${url}" />`;

/** `<link rel="canonical" href="X" />` or plain "X" → "X" */
export const canonicalUrlOf = (value: string) => {
  const text = (value || "").trim();
  return (text.match(/href=["']([^"']+)["']/i)?.[1] ?? text.replace(/<[^>]*>/g, "")).trim();
};

/** JSON-LD as raw JSON or <script type="application/ld+json"> blocks — same rule as the backend */
export const isValidSchemaMarkup = (raw: string) => {
  const text = (raw || "").trim();
  if (!text) return true;
  const blocks = [...text.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  // With <script> tags, nothing but HTML comments may sit outside them (it would never reach the website)
  if (blocks.length && text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<!--[\s\S]*?-->/g, "").trim()) return false;
  try {
    (blocks.length ? blocks : [text]).forEach((b) => JSON.parse(b));
    return true;
  } catch {
    return false;
  }
};

/**
 * Swaps whole values equal to `oldText` for `newText`, so editing the meta title or description
 * keeps og:title, twitter:title, the schema "name" etc. in step:
 * - "html": attribute values in the Open Graph tags — content="…" (HTML-escaped)
 * - "json": string values in the JSON-LD — "…" (JSON-escaped)
 * Only a complete quoted value is replaced (never part of another text), and values the admin
 * wrote differently on purpose are left alone.
 */
export const replaceSeoText = (source: string, oldText: string, newText: string, kind: "html" | "json") => {
  if (!source || !oldText || oldText === newText) return source;
  const escape =
    kind === "html"
      ? (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")
      : (s: string) => JSON.stringify(s).slice(1, -1);
  const from = `"${escape(oldText)}"`;
  return source.split(from).join(`"${escape(newText)}"`);
};

export interface PageSeo {
  path: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  canonicalTag: string;
  openGraphTags: string;
  schemaMarkup: string;
  ogImage: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  isActive: boolean;
  /** false → nothing saved yet, the values are generated defaults */
  saved?: boolean;
  updatedBy?: string;
  updatedAt?: string;
}

export type PageSeoInput = Omit<PageSeo, "canonicalUrl" | "saved" | "updatedBy" | "updatedAt">;

export const pageSeoApi = {
  get: (slug: string, envType: SeoEnv = currentSeoEnv()) =>
    api.get<PageSeo>(`/page-seo?path=${encodeURIComponent(pagePathOf(slug))}&envType=${envType}`),

  save: (input: PageSeoInput) => api.put<PageSeo>("/page-seo", input),

  generate: (input: { path: string; envType: SeoEnv; metaTitle?: string; metaDescription?: string; ogImage?: string }) =>
    api.post<PageSeo>("/page-seo/generate", input),

  /** OG image → Cloudinary (arogya_2026/seo) */
  uploadOgImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/page-seo/upload", form);
  },
};
