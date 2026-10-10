import { api } from "./api";

// Website About Us "About The Founder" — Pages & CMS → About Us.
// Saved to backend-arogya; the website reads it from GET /api/founder-message.

export interface AboutFounder {
  heading: string;
  name: string;
  designation: string;
  description: string;
  messageHeading: string;
  message: string;
  image: string;
  imageAlt: string;
  leafImage: string;
  leafImageAlt: string;
  lotusImage: string;
  lotusImageAlt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const aboutFounderApi = {
  /** null until the section is saved for the first time */
  get: () => api.get<AboutFounder | null>("/about-founder"),
  save: (input: Omit<AboutFounder, "updatedAt" | "updatedBy">) => api.put<AboutFounder>("/about-founder", input),
  /** Uploads to Cloudinary (arogya_2026/about/founder) and returns the image URL */
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/about-founder/upload", form);
  },
};
