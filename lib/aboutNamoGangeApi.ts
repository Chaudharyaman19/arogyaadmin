import { api } from "./api";

// Website About Us "About Namo Gange Trust" — Pages & CMS → About Us.
// Saved to backend-arogya; the website reads it from GET /api/about-namo-gange.

export interface AboutNamoGangeHighlight {
  text: string;
  isActive: boolean;
}

export interface AboutNamoGange {
  heading: string;
  subheading: string;
  paragraph: string;
  highlights: AboutNamoGangeHighlight[];
  bulletIcon: string;
  bulletIconAlt: string;
  image: string;
  imageAlt: string;
  visionTitle: string;
  visionText: string;
  missionTitle: string;
  /** "\n" = line break on the website (desktop) */
  missionText: string;
  leafImage: string;
  leafImageAlt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const aboutNamoGangeApi = {
  /** null until the section is saved for the first time */
  get: () => api.get<AboutNamoGange | null>("/about-namo-gange"),
  save: (input: Omit<AboutNamoGange, "updatedAt" | "updatedBy">) => api.put<AboutNamoGange>("/about-namo-gange", input),
  /** Uploads to Cloudinary (arogya_2026/about/namo-gange) and returns the image URL */
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/about-namo-gange/upload", form);
  },
};
