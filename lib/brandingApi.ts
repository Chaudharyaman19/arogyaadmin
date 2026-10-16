import { api } from "./api";

/* =========================================================
   WEBSITE LOGO & BROCHURE — backend-arogya /api/v1/site-settings/branding
   The navbar logo (+ alt text) and the "Download PDF" brochure the website
   reads from GET /api/settings. Uploads go to Cloudinary.
========================================================= */

export interface Branding {
  logo: string;
  logoAlt: string;
  brochureUrl: string;
  brochureFileName: string;
  updatedAt: string | null;
}

export interface UploadedFile {
  url: string;
  fileName?: string;
  fileSize?: string;
}

const upload = (path: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.postForm<UploadedFile>(path, formData);
};

export const brandingApi = {
  get: () => api.get<Branding>("/site-settings/branding"),
  save: (payload: Omit<Branding, "updatedAt">) => api.put<Branding>("/site-settings/branding", payload),
  uploadLogo: (file: File) => upload("/site-settings/branding/upload-logo", file),
  uploadBrochure: (file: File) => upload("/site-settings/branding/upload-brochure", file),
};
