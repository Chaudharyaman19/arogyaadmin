import { api } from "./api";

// Website home "Upcoming Event & Countdown" — Pages & CMS → Home.
// Saved to backend-arogya; the website reads it from GET /api/upcoming-event.

export interface AttendItem {
  _id?: string;
  text: string;
  isActive: boolean;
}

export interface UpcomingEvent {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** "\n" = line break on the website */
  description: string;
  dateInfo: string;
  venueInfo: string;
  delegatesInfo: string;
  countriesInfo: string;
  countdownHeading: string;
  /** India time, "YYYY-MM-DDTHH:mm" */
  targetDate: string;
  attendHeading: string;
  attendItems: AttendItem[];
  attendImage: string;
  attendImageAlt: string;
  ctaLabel: string;
  ctaHref: string;
  ctaNewTab: boolean;
  backgroundImage: string;
  backgroundImageAlt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const upcomingEventApi = {
  /** null until the section is saved for the first time */
  get: () => api.get<UpcomingEvent | null>("/upcoming-event"),
  save: (input: UpcomingEvent) => api.put<UpcomingEvent>("/upcoming-event", input),
  /** Uploads to Cloudinary (arogya_2026/home/upcoming-event) and returns the image URL */
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/upcoming-event/upload", form);
  },
};
