import { api } from "./api";

// Website About Us "About Hero" banner — Pages & CMS → About Us.
// Saved to backend-arogya; the website reads it from GET /api/about-hero.

/** Must match ABOUT_HERO_ICONS in backend models/about/AboutHero.js */
export const ABOUT_HERO_ICONS = [
  "BookOpen", "Users", "Globe", "MonitorPlay", "Award", "Calendar", "Mic",
  "Building2", "HeartPulse", "Stethoscope", "Leaf", "Star", "Trophy", "GraduationCap",
] as const;
export type AboutHeroIcon = (typeof ABOUT_HERO_ICONS)[number];

export interface AboutHeroStat {
  icon: AboutHeroIcon;
  value: number;
  suffix: string;
  label: string;
  isActive: boolean;
}

export interface AboutHero {
  eyebrow: string;
  /** "\n" = line break on the website */
  headline: string;
  dividerImage: string;
  dividerImageAlt: string;
  /** "\n" = line break on the website */
  paragraph: string;
  backgroundImage: string;
  backgroundImageAlt: string;
  stats: AboutHeroStat[];
  updatedAt?: string;
  updatedBy?: string;
}

export const aboutHeroApi = {
  /** null until the banner is saved for the first time */
  get: () => api.get<AboutHero | null>("/about-hero"),
  save: (input: Omit<AboutHero, "updatedAt" | "updatedBy">) => api.put<AboutHero>("/about-hero", input),
  /** Uploads to Cloudinary (arogya_2026/about/hero) and returns the image URL */
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/about-hero/upload", form);
  },
};
