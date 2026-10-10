import { api } from "./api";

// Website home "About The Conference" — Pages & CMS → Home.
// Saved to backend-arogya; the website reads it from GET /api/about-conference.

export interface AboutConference {
  eyebrow: string;
  eyebrowImage: string;
  eyebrowImageAlt: string;
  headingLine1: string;
  headingLine2: string;
  subtitle: string;
  paragraph1: string;
  paragraph2: string;
  /** "\n" = line break on the website */
  dateBadge: string;
  venueBadge: string;
  delegatesBadge: string;
  backgroundImage: string;
  backgroundImageAlt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const aboutConferenceApi = {
  /** null until the section is saved for the first time */
  get: () => api.get<AboutConference | null>("/about-conference"),
  save: (input: AboutConference) => api.put<AboutConference>("/about-conference", input),
  /** Uploads to Cloudinary (arogya_2026/home/about-conference) and returns the image URL */
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/about-conference/upload", form);
  },
};
