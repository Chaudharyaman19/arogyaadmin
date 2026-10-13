import { api } from "./api";

// Website Contact page hero banner + quick info cards — Pages & CMS → Contact Us.
// Saved to backend-arogya; the website reads them from GET /api/settings.

export type ContactCardIcon = "MapPin" | "Mail" | "Phone" | "Clock";

export interface ContactInfoCard {
  title: string;
  /** "\n" = line break on the website */
  text: string;
  icon: ContactCardIcon;
}

export interface ContactHero {
  eyebrow: string;
  /** The page's only H1; "\n" = line break on the website */
  title: string;
  /** Word of the title shown in orange */
  titleHighlight: string;
  /** "\n" = line break on the website */
  subtitle: string;
  bgImage: string;
  bgImageAlt: string;
  cards: ContactInfoCard[];
  updatedAt?: string;
  updatedBy?: string;
}

export const contactHeroApi = {
  get: () => api.get<ContactHero>("/site-settings/contact-hero"),
  save: (input: Omit<ContactHero, "updatedAt" | "updatedBy">) => api.put<ContactHero>("/site-settings/contact-hero", input),
  /** Uploads to Cloudinary (arogya_2026/contact) and returns the image URL */
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/site-settings/contact-hero/upload", form);
  },
};
