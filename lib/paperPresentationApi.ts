import { api } from "./api";

// Website Paper Presentation page — Pages & CMS → Paper Presentation.
// Saved to backend-arogya; the website reads them from GET /api/paper-hero and /api/paper-important-dates.

export interface PaperHero {
  eyebrow: string;
  /** First line dark, the rest gold — the page's only H1 */
  title: string;
  dividerImage: string;
  dividerImageAlt: string;
  /** "\n" = line break on the website */
  description: string;
  backgroundImage: string;
  backgroundImageAlt: string;
  /** "\n" = line break on the website */
  badgeText: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface PaperDate {
  /** "\n" splits the two lines on the website */
  label: string;
  date: string;
  icon: string;
  iconAlt: string;
  isActive: boolean;
}

export interface PaperImportantDates {
  heading: string;
  headingIcon: string;
  headingIconAlt: string;
  dates: PaperDate[];
  whyHeading: string;
  whyLeafImage: string;
  whyLeafImageAlt: string;
  reasons: { text: string; isActive: boolean }[];
  updatedAt?: string;
  updatedBy?: string;
}

export interface PaperTopic {
  title: string;
  /** "\n" = line break on the website */
  description: string;
  icon: string;
  iconAlt: string;
  isActive: boolean;
}

export interface PaperTopics {
  heading: string;
  headingIcon: string;
  headingIconAlt: string;
  decorImage: string;
  decorImageAlt: string;
  topics: PaperTopic[];
  updatedAt?: string;
  updatedBy?: string;
}

const uploadTo = (path: string) => (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.postForm<{ url: string; fileSize: string }>(path, form);
};

export const paperHeroApi = {
  /** null until the hero is saved for the first time */
  get: () => api.get<PaperHero | null>("/paper-hero"),
  save: (input: Omit<PaperHero, "updatedAt" | "updatedBy">) => api.put<PaperHero>("/paper-hero", input),
  /** Uploads to Cloudinary (arogya_2026/paper-presentation) and returns the image URL */
  upload: uploadTo("/paper-hero/upload"),
};

export const paperDatesApi = {
  /** null until the section is saved for the first time */
  get: () => api.get<PaperImportantDates | null>("/paper-important-dates"),
  save: (input: Omit<PaperImportantDates, "updatedAt" | "updatedBy">) => api.put<PaperImportantDates>("/paper-important-dates", input),
  /** Uploads to Cloudinary (arogya_2026/paper-presentation) and returns the image URL */
  upload: uploadTo("/paper-important-dates/upload"),
};

export const paperTopicsApi = {
  /** null until the section is saved for the first time */
  get: () => api.get<PaperTopics | null>("/paper-topics"),
  save: (input: Omit<PaperTopics, "updatedAt" | "updatedBy">) => api.put<PaperTopics>("/paper-topics", input),
  /** Uploads to Cloudinary (arogya_2026/paper-presentation) and returns the image URL */
  upload: uploadTo("/paper-topics/upload"),
};

export interface PaperGuidelines {
  guidelinesHeading: string;
  guidelinesIcon: string;
  guidelinesIconAlt: string;
  guidelines: { text: string; isActive: boolean }[];
  guidelinesImage: string;
  guidelinesImageAlt: string;
  downloadLabel: string;
  /** An uploaded PDF (the website serves it at /paper-guidelines) or any link */
  downloadHref: string;
  submissionHeading: string;
  submissionIcon: string;
  submissionIconAlt: string;
  steps: { num: string; title: string; description: string; isActive: boolean }[];
  submissionImage: string;
  submissionImageAlt: string;
  submitLabel: string;
  submitHref: string;
  leafImage: string;
  leafImageAlt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const paperGuidelinesApi = {
  /** null until the section is saved for the first time */
  get: () => api.get<PaperGuidelines | null>("/paper-guidelines"),
  save: (input: Omit<PaperGuidelines, "updatedAt" | "updatedBy">) => api.put<PaperGuidelines>("/paper-guidelines", input),
  /** Uploads to Cloudinary (arogya_2026/paper-presentation) and returns the image URL */
  upload: uploadTo("/paper-guidelines/upload"),
  /** Guidelines PDF (max 10 MB) → Cloudinary; the website serves it at /paper-guidelines */
  uploadPdf: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileName: string; fileSize: string }>("/paper-guidelines/upload-pdf", form);
  },
};

export interface PaperAward {
  /** "\n" splits it into the two lines of the card */
  title: string;
  icon: string;
  iconAlt: string;
  isActive: boolean;
}

export interface PaperAwards {
  heading: string;
  headingIcon: string;
  headingIconAlt: string;
  awards: PaperAward[];
  graphic: string;
  graphicAlt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const paperAwardsApi = {
  /** null until the section is saved for the first time */
  get: () => api.get<PaperAwards | null>("/paper-awards"),
  save: (input: Omit<PaperAwards, "updatedAt" | "updatedBy">) => api.put<PaperAwards>("/paper-awards", input),
  /** Uploads to Cloudinary (arogya_2026/paper-presentation) and returns the image URL */
  upload: uploadTo("/paper-awards/upload"),
};

export interface PaperWhyChooseFeature {
  /** "\n" = line break on the website */
  title: string;
  icon: string;
  iconAlt: string;
  isActive: boolean;
}

export interface PaperWhyChoose {
  heading: string;
  features: PaperWhyChooseFeature[];
  footnote: string;
  /** "\n" = line break on the website */
  ctaText: string;
  /** "\n" = line break on the website */
  ctaHeading: string;
  leafImage: string;
  leafImageAlt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const paperWhyChooseApi = {
  /** null until the section is saved for the first time */
  get: () => api.get<PaperWhyChoose | null>("/paper-why-choose"),
  save: (input: Omit<PaperWhyChoose, "updatedAt" | "updatedBy">) => api.put<PaperWhyChoose>("/paper-why-choose", input),
  /** Uploads to Cloudinary (arogya_2026/paper-presentation) and returns the image URL */
  upload: uploadTo("/paper-why-choose/upload"),
};

export interface PaperNeedHelp {
  heading: string;
  description: string;
  /** true → the website shows the top bar's first email / phone */
  sameAsTopbar: boolean;
  email: string;
  phone: string;
  icon: string;
  iconAlt: string;
  leafImage: string;
  leafImageAlt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const paperNeedHelpApi = {
  /** null until the section is saved for the first time */
  get: () => api.get<PaperNeedHelp | null>("/paper-need-help"),
  save: (input: Omit<PaperNeedHelp, "updatedAt" | "updatedBy">) => api.put<PaperNeedHelp>("/paper-need-help", input),
  /** Uploads to Cloudinary (arogya_2026/paper-presentation) and returns the image URL */
  upload: uploadTo("/paper-need-help/upload"),
};
