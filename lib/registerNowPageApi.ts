import { api } from "./api";

// Website Register Now page (/register-now) — Pages & CMS → Register Now. Saved to
// backend-arogya; the website reads all sections from GET /api/register-now-page.
// The registration cards are managed separately in System & Security → Add Registration.

export interface RegisterNowHero {
  /** First line of the page's H1 (dark green) */
  titleLine1: string;
  /** Second line of the page's H1 (light green) */
  titleLine2: string;
  /** "\n" = line break on the website */
  tagline: string;
  editionText: string;
  dateText: string;
  venueText: string;
  bgImage: string;
  bgImageAlt: string;
}

export type StatIcon = "users" | "mic" | "calendar" | "globe" | "infinity";

export interface RegisterNowStat {
  /** "121+" counts up on the website; a word like "ENDLESS" is shown as it is */
  value: string;
  label: string;
  iconKey: StatIcon;
}

export interface RegisterNowEventDetails {
  heading: string;
  dateText: string;
  dayText: string;
  /** "\n" = line break on the website */
  venueText: string;
  websiteLabel: string;
  websiteUrl: string;
  dateIcon: string;
  dateIconAlt: string;
  venueIcon: string;
  venueIconAlt: string;
  websiteIcon: string;
  websiteIconAlt: string;
}

export interface RegisterNowWhyAttendItem {
  title: string;
  /** "\n" = line break on the website */
  description: string;
  icon: string;
  iconAlt: string;
}

export interface RegisterNowWhyAttend {
  heading: string;
  items: RegisterNowWhyAttendItem[];
}

export interface RegisterNowNeedHelp {
  title: string;
  description: string;
  email: string;
  phone: string;
}

/** "Your Registration Includes" — shared by the Single and Group registration pages */
export interface RegistrationIncludes {
  heading: string;
  /** "\n" in a title = line break on the website */
  items: { title: string; icon: string; iconAlt: string }[];
}

export interface RegisterNowSections {
  hero: RegisterNowHero;
  stats: { items: RegisterNowStat[] };
  eventDetails: RegisterNowEventDetails;
  whyAttend: RegisterNowWhyAttend;
  needHelp: RegisterNowNeedHelp;
  registrationIncludes: RegistrationIncludes;
}

export type RegisterNowSectionKey = keyof RegisterNowSections;

export interface SectionResponse<T> {
  data: T;
  updatedAt?: string;
  updatedBy?: string;
}

export const registerNowPageApi = {
  get: async <K extends RegisterNowSectionKey>(section: K): Promise<SectionResponse<RegisterNowSections[K]>> => {
    const res = await api.get<SectionResponse<any>>(`/register-now-page/${section}`);
    // The stats band is stored as a plain list
    return (section === "stats" ? { ...res, data: { items: res.data ?? [] } } : res) as SectionResponse<RegisterNowSections[K]>;
  },
  save: async <K extends RegisterNowSectionKey>(section: K, input: RegisterNowSections[K]): Promise<SectionResponse<RegisterNowSections[K]>> => {
    const res = await api.put<SectionResponse<any>>(`/register-now-page/${section}`, input);
    return (section === "stats" ? { ...res, data: { items: res.data ?? [] } } : res) as SectionResponse<RegisterNowSections[K]>;
  },
  /** Uploads to Cloudinary (arogya_2026/register-now) and returns the image URL */
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/register-now-page/upload", form);
  },
};
