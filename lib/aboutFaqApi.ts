import { api } from "./api";

// Website About Us "Frequently Asked Questions" — Pages & CMS → About Us.
// Saved to backend-arogya; the website reads it from GET /api/faq.

export interface AboutFaqItem {
  question: string;
  answer: string;
  image: string;
  imageAlt: string;
  isActive: boolean;
}

export interface AboutFaq {
  subheading: string;
  heading: string;
  highlightText: string;
  description: string;
  defaultImage: string;
  defaultImageAlt: string;
  leftImage: string;
  leftImageAlt: string;
  rightImage: string;
  rightImageAlt: string;
  ctaQuestion: string;
  ctaLabel: string;
  ctaHref: string;
  ctaNewTab: boolean;
  items: AboutFaqItem[];
  updatedAt?: string;
  updatedBy?: string;
}

export const aboutFaqApi = {
  /** null until the section is saved for the first time */
  get: () => api.get<AboutFaq | null>("/about-faq"),
  save: (input: Omit<AboutFaq, "updatedAt" | "updatedBy">) => api.put<AboutFaq>("/about-faq", input),
  /** Uploads to Cloudinary (arogya_2026/about/faq) and returns the image URL */
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/about-faq/upload", form);
  },
};
