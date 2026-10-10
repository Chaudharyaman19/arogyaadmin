import { api } from "./api";

// Website home hero carousel — Pages & CMS → Home → "Hero Carousel Slides".
// Saved to backend-arogya; the website reads it from GET /api/home-hero.

export type HeroTheme = "gold" | "blue" | "green";

export interface HeroSlide {
  _id?: string;
  image: string;
  imageAlt: string;
  logo: string;
  logoAlt: string;
  subtitle: string;
  theme: HeroTheme;
  button1Label: string;
  button1Link: string;
  button1NewTab: boolean;
  button2Label: string;
  button2Link: string;
  button2NewTab: boolean;
  isActive: boolean;
}

export interface HeroCarousel {
  editionTag: string;
  eventDates: string;
  venue: string;
  slides: HeroSlide[];
  updatedAt?: string;
  updatedBy?: string;
}

export const heroCarouselApi = {
  /** null until the carousel is saved for the first time */
  get: () => api.get<HeroCarousel | null>("/home-hero"),
  save: (input: HeroCarousel) => api.put<HeroCarousel>("/home-hero", input),
  /** Uploads to Cloudinary (arogya_2026/hero) and returns the image URL */
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/home-hero/upload", form);
  },
};
