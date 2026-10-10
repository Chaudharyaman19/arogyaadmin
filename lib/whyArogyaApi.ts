import { api } from "./api";

// Website home "Why Arogya Sanghosthi? / Conference Tracks" — Pages & CMS → Home.
// Saved to backend-arogya; the website reads it from GET /api/why-arogya.

export type TrackColor = "green" | "blue" | "purple" | "lime" | "brown" | "teal";

export interface WhyArogyaBenefit {
  _id?: string;
  title: string;
  text: string;
  image: string;
  imageAlt: string;
  isActive: boolean;
}

export interface WhyArogyaTrack {
  _id?: string;
  /** "\n" = line break on the website */
  label: string;
  image: string;
  imageAlt: string;
  color: TrackColor;
  isActive: boolean;
}

export interface WhyArogya {
  leftHeading: string;
  leftHeadingImage: string;
  leftHeadingImageAlt: string;
  rightHeading: string;
  rightHeadingImage: string;
  rightHeadingImageAlt: string;
  benefits: WhyArogyaBenefit[];
  tracks: WhyArogyaTrack[];
  updatedAt?: string;
  updatedBy?: string;
}

export const whyArogyaApi = {
  /** null until the section is saved for the first time */
  get: () => api.get<WhyArogya | null>("/why-arogya"),
  save: (input: WhyArogya) => api.put<WhyArogya>("/why-arogya", input),
  /** Uploads to Cloudinary (arogya_2026/home/why-arogya) and returns the image URL */
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/why-arogya/upload", form);
  },
};
