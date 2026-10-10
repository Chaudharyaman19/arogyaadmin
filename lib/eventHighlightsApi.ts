import { api } from "./api";

// Website home "Event Highlights & CTA" — Pages & CMS → Home.
// Saved to backend-arogya; the website reads it from GET /api/event-highlights.

export interface EhButton {
  label: string;
  href: string;
  newTab: boolean;
}

export interface EhHighlight {
  _id?: string;
  title: string;
  /** "\n" = line break on the website */
  desc: string;
  image: string;
  imageAlt: string;
  /** one of the icon names in components/cms/editor/EventHighlightsEditor.tsx */
  icon: string;
  bgColor: string;
  isActive: boolean;
}

export interface EhAgendaDay {
  _id?: string;
  badge: string;
  date: string;
  text: string;
  image: string;
  imageAlt: string;
  isActive: boolean;
}

export interface EhAttendee {
  _id?: string;
  /** "\n" splits the two lines */
  text: string;
  icon: string;
  isActive: boolean;
}

export interface EventHighlights {
  heading: string;
  highlights: EhHighlight[];
  glanceHeading: string;
  agendaDays: EhAgendaDay[];
  whoHeading: string;
  attendees: EhAttendee[];
  viewAgenda: EhButton;
  detailsHeading: string;
  datesValue: string;
  venueValue: string;
  formatValue: string;
  organizerValue: string;
  mapEmbedUrl: string;
  ctaIcon: string;
  ctaIconAlt: string;
  ctaHeading: string;
  ctaParagraph: string;
  /** gold, navy, emerald — always 3 */
  ctaButtons: EhButton[];
  updatedAt?: string;
  updatedBy?: string;
}

export const eventHighlightsApi = {
  /** null until the block is saved for the first time */
  get: () => api.get<EventHighlights | null>("/event-highlights"),
  save: (input: EventHighlights) => api.put<EventHighlights>("/event-highlights", input),
  /** Uploads to Cloudinary (arogya_2026/home/event-highlights) and returns the image URL */
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/event-highlights/upload", form);
  },
};
