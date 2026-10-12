import { api } from "./api";

// Website About Us "Our Initiatives" section and "Our Impact So Far" band — Pages & CMS → About Us.
// Saved to backend-arogya; the website reads them from GET /api/about-initiatives and /api/about-impact.

/** Must match FOCUS_AREA_ICONS in backend models/about/AboutInitiatives.js */
export const FOCUS_AREA_ICONS = [
  "HeartHandshake", "Stethoscope", "Leaf", "Users", "FileText", "Heart", "BookOpen", "GraduationCap",
  "FlaskConical", "Apple", "ShieldCheck", "Handshake", "Globe", "Sprout", "Brain", "Award",
] as const;
export type FocusAreaIcon = (typeof FOCUS_AREA_ICONS)[number];

export interface InitiativeCard {
  /** "\n" = line break on the website */
  title: string;
  /** "\n" = line break on the website */
  description: string;
  icon: string;
  iconAlt: string;
  image: string;
  imageAlt: string;
  isActive: boolean;
}

export interface FocusArea {
  icon: FocusAreaIcon;
  /** "\n" = line break on the website */
  text: string;
  isActive: boolean;
}

export interface AboutInitiatives {
  heading: string;
  dividerImage: string;
  dividerImageAlt: string;
  decorImage: string;
  decorImageAlt: string;
  cards: InitiativeCard[];
  focusTitle: string;
  focusAreas: FocusArea[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface ImpactStat {
  icon: string;
  iconAlt: string;
  /** Only digits → counts up on the website; anything else (e.g. "Countless") is shown as it is */
  value: string;
  suffix: string;
  /** "\n" = line break on the website */
  label: string;
  isActive: boolean;
}

export interface AboutImpact {
  title: string;
  stats: ImpactStat[];
  updatedAt?: string;
  updatedBy?: string;
}

const uploadTo = (path: string) => (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.postForm<{ url: string; fileSize: string }>(path, form);
};

export const aboutInitiativesApi = {
  /** null until the section is saved for the first time */
  get: () => api.get<AboutInitiatives | null>("/about-initiatives"),
  save: (input: Omit<AboutInitiatives, "updatedAt" | "updatedBy">) => api.put<AboutInitiatives>("/about-initiatives", input),
  /** Uploads to Cloudinary (arogya_2026/about/initiatives) and returns the image URL */
  upload: uploadTo("/about-initiatives/upload"),
};

export const aboutImpactApi = {
  /** null until the band is saved for the first time */
  get: () => api.get<AboutImpact | null>("/about-impact"),
  save: (input: Omit<AboutImpact, "updatedAt" | "updatedBy">) => api.put<AboutImpact>("/about-impact", input),
  /** Uploads to Cloudinary (arogya_2026/about/impact) and returns the image URL */
  upload: uploadTo("/about-impact/upload"),
};
