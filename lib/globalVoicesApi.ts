import { api } from "./api";
import type { VideoSource } from "./videoTestimonialsApi";

// "Global Voices of Healthcare Innovation" on the website home page — Global Voices (sidebar).
// Saved to backend-arogya (the same records admin-arogya edits); the website reads
// GET /api/global-voices/*.

export interface GvSettings {
  heading: string;
  subheading: string;
  description: string;
  leftImage: string;
  leftImageAlt: string;
  rightImage: string;
  rightImageAlt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface GvCategory {
  _id: string;
  category: string;
  /** speakers using this category (it cannot be deleted while > 0) */
  speakerCount: number;
}

export interface GvCounter {
  _id: string;
  number: string;
  label: string;
  order: number;
}

export interface GvSpeaker {
  _id: string;
  name: string;
  designation: string;
  organization: string;
  country: string;
  description: string;
  category: string;
  image: string;
  imageAlt: string;
  sourceType: VideoSource;
  videoUrl: string;
  videoThumbnail: string;
  showOverlay: boolean;
  order: number;
}

export interface GvCarouselSpeaker {
  _id: string;
  name: string;
  designation: string;
  categoryTag: string;
  image: string;
  imageAltText: string;
  order: number;
}

export type GvCounterInput = Omit<GvCounter, "_id">;
export type GvSpeakerInput = Omit<GvSpeaker, "_id">;
export type GvCarouselSpeakerInput = Omit<GvCarouselSpeaker, "_id">;

const BASE = "/global-voices";
const upload = (path: string) => (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.postForm<{ url: string; fileSize: string }>(`${BASE}${path}`, form);
};
const crud = <T, I>(path: string) => ({
  list: () => api.get<T[]>(`${BASE}${path}`),
  create: (input: I) => api.post<T>(`${BASE}${path}`, input),
  update: (id: string, input: Partial<I>) => api.put<T>(`${BASE}${path}/${id}`, input),
  remove: (id: string) => api.delete<null>(`${BASE}${path}/${id}`),
});

export const globalVoicesApi = {
  getSettings: () => api.get<GvSettings>(`${BASE}/settings`),
  saveSettings: (input: Omit<GvSettings, "updatedAt" | "updatedBy">) => api.put<GvSettings>(`${BASE}/settings`, input),
  categories: crud<GvCategory, { category: string }>("/categories"),
  counters: crud<GvCounter, GvCounterInput>("/counters"),
  speakers: crud<GvSpeaker, GvSpeakerInput>("/speakers"),
  carouselSpeakers: crud<GvCarouselSpeaker, GvCarouselSpeakerInput>("/carousel-speakers"),
  /** Image → Cloudinary (arogya_2026/home/global-voices) */
  uploadImage: upload("/upload-image"),
  /** Video file (MP4 / WEBM / MOV, up to 50 MB) → Cloudinary */
  uploadVideo: upload("/upload-video"),
};
