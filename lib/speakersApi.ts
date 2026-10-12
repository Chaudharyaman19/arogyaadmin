import { api } from "./api";

// Speakers Section (sidebar dropdown) — saved to backend-arogya, the same records admin-arogya edits.
// The website reads the public routes (/api/speakers/*, /api/expert-speakers, /api/more-speakers/*,
// /api/previous-speakers/*, /api/eminent-speakers, /api/organising-committee).

const uploadTo = (path: string) => (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.postForm<{ url: string; fileSize: string }>(path, form);
};

/* ---------- "heading + list of people" sections ---------- */
export interface SpeakerPerson {
  _id: string;
  name: string;
  designation: string;
  organization: string;
  /** Only Esteemed Speakers and Previous Speakers have a title / topic */
  title?: string;
  image: string;
  imageAltText: string;
  order: number;
}
export type SpeakerPersonInput = Omit<SpeakerPerson, "_id">;

export interface PeopleApi {
  getHeading: () => Promise<{ heading: string; updatedAt?: string }>;
  saveHeading: (heading: string) => Promise<{ heading: string; updatedAt?: string }>;
  list: () => Promise<SpeakerPerson[]>;
  create: (input: SpeakerPersonInput) => Promise<SpeakerPerson>;
  update: (id: string, input: Partial<SpeakerPersonInput>) => Promise<SpeakerPerson>;
  remove: (id: string) => Promise<null>;
  uploadImage: (file: File) => Promise<{ url: string; fileSize: string }>;
}

const peopleApi = (base: string): PeopleApi => ({
  getHeading: () => api.get(`${base}/heading`),
  saveHeading: (heading) => api.put(`${base}/heading`, { heading }),
  list: () => api.get(base),
  create: (input) => api.post(base, input),
  update: (id, input) => api.put(`${base}/${id}`, input),
  remove: (id) => api.delete(`${base}/${id}`),
  uploadImage: uploadTo(`${base}/upload`),
});

export const esteemedSpeakersApi = peopleApi("/expert-speakers");
export const previousSpeakersApi = peopleApi("/previous-speakers");
export const eminentSpeakersApi = peopleApi("/eminent-speakers");
export const organisingCommitteeApi = peopleApi("/organising-committee");

/* ---------- Add Bg Image: speakers page hero + counter strip ---------- */
export const SPEAKER_COUNTER_ICONS = ["UserCheck", "Mic", "Calendar", "Users", "Globe", "Target"] as const;
export type SpeakerCounterIcon = (typeof SPEAKER_COUNTER_ICONS)[number];

export interface SpeakerHero {
  heading: string;
  title: string;
  shortDescription: string;
  backgroundImage: string;
  backgroundImageAlt: string;
}

export interface SpeakerCounter {
  _id: string;
  number: string;
  label: string;
  icon: SpeakerCounterIcon;
  order: number;
}
export type SpeakerCounterInput = Omit<SpeakerCounter, "_id">;

export const speakerHeroApi = {
  get: () => api.get<SpeakerHero>("/speaker-hero"),
  save: (input: SpeakerHero) => api.put<SpeakerHero>("/speaker-hero", input),
  uploadImage: uploadTo("/speaker-hero/upload"),
  counters: {
    list: () => api.get<SpeakerCounter[]>("/speaker-hero/counters"),
    create: (input: SpeakerCounterInput) => api.post<SpeakerCounter>("/speaker-hero/counters", input),
    update: (id: string, input: Partial<SpeakerCounterInput>) => api.put<SpeakerCounter>(`/speaker-hero/counters/${id}`, input),
    remove: (id: string) => api.delete<null>(`/speaker-hero/counters/${id}`),
  },
};

/* ---------- More Speakers ---------- */
export type MoreSectionType = "MAIN" | "ADVISORS" | "SCIENTIFIC" | "HIGHLIGHTS";
export type MoreItemType = "ADVISOR" | "SCIENTIFIC" | "HIGHLIGHT";

export interface MoreSpeakerCategory {
  sectionType: MoreSectionType;
  heading: string;
  description: string;
}

export interface MoreSpeakerItem {
  _id: string;
  type: MoreItemType;
  name: string;
  designation: string;
  organization: string;
  image: string;
  imageAltText: string;
  order: number;
}
export type MoreSpeakerItemInput = Omit<MoreSpeakerItem, "_id">;

export const moreSpeakersApi = {
  categories: () => api.get<MoreSpeakerCategory[]>("/more-speakers/categories"),
  saveCategory: (sectionType: MoreSectionType, input: { heading: string; description: string }) =>
    api.put<MoreSpeakerCategory>(`/more-speakers/categories/${sectionType}`, input),
  items: () => api.get<MoreSpeakerItem[]>("/more-speakers/items"),
  create: (input: MoreSpeakerItemInput) => api.post<MoreSpeakerItem>("/more-speakers/items", input),
  update: (id: string, input: Partial<MoreSpeakerItemInput>) => api.put<MoreSpeakerItem>(`/more-speakers/items/${id}`, input),
  remove: (id: string) => api.delete<null>(`/more-speakers/items/${id}`),
  uploadImage: uploadTo("/more-speakers/upload"),
};
