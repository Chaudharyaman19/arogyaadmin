import { api } from "./api";

// Registration type cards on the website's Register Now page ("Single Registration",
// "Group Registration") — managed from System & Security → Add Registration.

export interface RegistrationCard {
  _id: string;
  title: string;
  /** "\n" = line break on the website */
  description: string;
  /** The tick-mark points listed on the card */
  features: string[];
  buttonLabel: string;
  /** "/new-single-registration" (a page on the website) or a full https:// link */
  buttonHref: string;
  image: string;
  imageAlt: string;
  isActive: boolean;
  order: number;
  updatedBy?: string;
  updatedAt?: string;
}

export type RegistrationCardInput = Omit<RegistrationCard, "_id" | "order" | "updatedBy" | "updatedAt">;

export interface RegistrationCardsData {
  /** Heading above the cards */
  heading: string;
  subheading: string;
  cards: RegistrationCard[];
}

export const registrationCardsApi = {
  get: () => api.get<RegistrationCardsData>("/registration-cards"),
  saveHeading: (input: { heading: string; subheading: string }) =>
    api.put<{ heading: string; subheading: string }>("/registration-cards/settings", input),
  create: (input: RegistrationCardInput) => api.post<RegistrationCard>("/registration-cards", input),
  update: (id: string, input: RegistrationCardInput) => api.put<RegistrationCard>(`/registration-cards/${id}`, input),
  setActive: (id: string, isActive: boolean) =>
    api.patch<RegistrationCard>(`/registration-cards/${id}/status`, { isActive }),
  /** `ids` in their new order, first to last */
  reorder: (ids: string[]) => api.put<RegistrationCard[]>("/registration-cards/reorder", { ids }),
  remove: (id: string) => api.delete<null>(`/registration-cards/${id}`),
  /** Uploads to Cloudinary (arogya_2026/registration-cards) and returns the image URL */
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/registration-cards/upload", form);
  },
};
