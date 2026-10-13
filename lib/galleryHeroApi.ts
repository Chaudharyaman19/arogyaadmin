import { api } from "./api";

// Website Gallery page hero banner — Pages & CMS → Gallery.
// Saved to backend-arogya; the website reads it from GET /api/glimpse/settings.

export interface GalleryHero {
  /** The page's only H1 */
  heading: string;
  subheading: string;
  description: string;
  bgImage: string;
  bgAlt: string;
  updatedAt?: string;
  updatedBy?: string;
}

/** One stat in the strip under the photo grid; the website reads them from GET /api/glimpse/counters. */
export interface GalleryCounter {
  _id?: string;
  number: string;
  /** "\n" = line break on the website */
  label: string;
  image: string;
  imageAlt: string;
  /** Built-in website icon used while no image is uploaded */
  iconKey?: string;
}

const uploadTo = (path: string) => (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.postForm<{ url: string; fileSize: string }>(path, form);
};

export const galleryCountersApi = {
  get: () => api.get<GalleryCounter[]>("/gallery-counters"),
  /** Saves the whole list in the order given */
  save: (counters: GalleryCounter[]) => api.put<GalleryCounter[]>("/gallery-counters", { counters }),
  /** Uploads to Cloudinary (arogya_2026/gallery/counters) and returns the image URL */
  upload: uploadTo("/gallery-counters/upload"),
};

/** Heading + "Share Your Moments" box of the website's Video Highlights section. */
export interface GalleryVideoSection {
  heading: string;
  shareTitle: string;
  /** "\n" = line break on the website */
  shareDescription: string;
  shareButton: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const galleryVideoSectionApi = {
  get: () => api.get<GalleryVideoSection>("/gallery-video-section"),
  save: (input: Omit<GalleryVideoSection, "updatedAt" | "updatedBy">) =>
    api.put<GalleryVideoSection>("/gallery-video-section", input),
};

/** The "Join Us" banner at the bottom of the website Gallery page. */
export interface GalleryJoinUs {
  tagline: string;
  title: string;
  buttonLabel: string;
  /** "/register-now" (a page on the website) or a full https:// link */
  buttonHref: string;
  date: string;
  dateSub: string;
  location: string;
  locationSub: string;
  image: string;
  imageAlt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const galleryJoinUsApi = {
  get: () => api.get<GalleryJoinUs>("/gallery-join-us"),
  save: (input: Omit<GalleryJoinUs, "updatedAt" | "updatedBy">) => api.put<GalleryJoinUs>("/gallery-join-us", input),
  /** Uploads to Cloudinary (arogya_2026/gallery/join-us) and returns the image URL */
  upload: uploadTo("/gallery-join-us/upload"),
};

export const galleryHeroApi = {
  get: () => api.get<GalleryHero>("/gallery-hero"),
  save: (input: Omit<GalleryHero, "updatedAt" | "updatedBy">) => api.put<GalleryHero>("/gallery-hero", input),
  /** Uploads to Cloudinary (arogya_2026/gallery/hero) and returns the image URL */
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/gallery-hero/upload", form);
  },
};
