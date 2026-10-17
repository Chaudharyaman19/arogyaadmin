import { api } from "./api";

/* =========================================================
   LEGAL PAGES — backend-arogya /api/v1/legal-pages
   Privacy Policy, Terms & Conditions and Refund Policy shown
   on the website at /privacy, /terms and /refund.
========================================================= */

export type LegalSlug = "privacy" | "terms" | "refund";

export interface LegalPage {
  slug: LegalSlug;
  title: string;
  effectiveDate: string;
  content: string;
  /** true while the website still shows the built-in draft text */
  isDraft: boolean;
  updatedAt: string | null;
  updatedBy: string;
}

export const legalPagesApi = {
  list: () => api.get<LegalPage[]>("/legal-pages"),
  save: (slug: LegalSlug, payload: Pick<LegalPage, "title" | "effectiveDate" | "content">) =>
    api.put<LegalPage>(`/legal-pages/${slug}`, payload),
};
