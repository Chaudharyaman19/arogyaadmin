import { api } from "./api";

// Website home "Testimonials" section — headings, stats band, video heading and bottom band
// (Pages & CMS → Home). Testimonial cards and videos are managed separately.
// Saved to backend-arogya; the website reads GET /api/testimonials/settings and /counters.

export interface TestimonialCounterItem {
  /** "98%", "4.8/5", "1000+" count up on the website */
  number: string;
  label: string;
  /** one of the icon names in components/cms/editor/TestimonialsSectionEditor.tsx */
  icon: string;
}

export interface TestimonialsSection {
  heading: string;
  mainTitle: string;
  shortDescription: string;
  topImage: string;
  topImageAlt: string;
  stats: TestimonialCounterItem[];
  videoTopImage: string;
  videoTopImageAlt: string;
  videoHeading: string;
  videoShortDescription: string;
  videoButtonLabel: string;
  videoButtonHref: string;
  bandHeading: string;
  bandParagraph: string;
  bandCounters: TestimonialCounterItem[];
  bandButtonLabel: string;
  bandButtonHref: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const testimonialsSectionApi = {
  get: () => api.get<TestimonialsSection>("/testimonials-section"),
  save: (input: TestimonialsSection) => api.put<TestimonialsSection>("/testimonials-section", input),
  /** Uploads to Cloudinary (arogya_2026/home/testimonials) and returns the image URL */
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/testimonials-section/upload", form);
  },
};
