import { api } from "./api";

export interface SeoFile {
  _id: string;
  originalName: string;
  fileName: string;
  fileType: string;
  size: number;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface AdvancedSeoSocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  linkedin: string;
}

export interface RootFilesStatus {
  siteUrl: string;
  robots: { source: "auto" | "uploaded" };
  sitemap: { source: "auto" | "uploaded"; pageCount: number; blogCount: number };
}

export interface AdvancedSeoData {
  headerScripts: string;
  footerScripts: string;
  ga4MeasurementId: string;
  gtmContainerId: string;
  googleSearchConsoleVerification: string;
  allowIndex: boolean;
  allowFollow: boolean;
  socialLinks: AdvancedSeoSocialLinks;
  seoFiles: SeoFile[];
  rootFiles: RootFilesStatus;
}

export interface AdvancedSeoScriptsPayload {
  headerScripts: string;
  footerScripts: string;
  ga4MeasurementId: string;
  gtmContainerId: string;
  googleSearchConsoleVerification: string;
  allowIndex: boolean;
  allowFollow: boolean;
  socialLinks: AdvancedSeoSocialLinks;
}

/* =========================================================
   ADVANCED SEO API — backend-arogya /api/v1/seo-settings
   Scripts, tracking keys and index / follow switches are
   injected by the website's root layout; social links are
   the same record the footer and floating sidebar read;
   uploaded files are served at the website root (an
   uploaded robots.txt / sitemap.xml replaces the
   auto-generated one until it is deleted).
========================================================= */
export const advancedSeoApi = {
  get: () => api.get<AdvancedSeoData>("/seo-settings/advanced"),

  saveScripts: (payload: AdvancedSeoScriptsPayload) =>
    api.put<AdvancedSeoData>("/seo-settings/scripts", payload),

  saveSocialLinks: (links: AdvancedSeoSocialLinks) =>
    api.put<AdvancedSeoSocialLinks>("/seo-settings/social-links", links),

  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.postForm<AdvancedSeoData>("/seo-settings/upload-file", formData);
  },

  deleteFile: (fileId: string) => api.delete<AdvancedSeoData>(`/seo-settings/file/${encodeURIComponent(fileId)}`),
};
