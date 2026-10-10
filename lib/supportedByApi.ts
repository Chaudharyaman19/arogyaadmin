import { api } from "./api";

// Website home "Supported By" strip — Pages & CMS → Home → "Supported By (Trusted Groups)".
// Saved to backend-arogya; the website reads it from GET /api/supported-by.

export interface SupportedByItem {
  _id?: string;
  line1: string;
  line2: string;
  /** one of SUPPORTED_BY_ICONS in components/cms/editor/SupportedByEditor.tsx */
  icon: string;
  color: string;
  isActive: boolean;
}

export interface SupportedBy {
  eyebrow: string;
  items: SupportedByItem[];
  updatedAt?: string;
  updatedBy?: string;
}

export const supportedByApi = {
  get: () => api.get<SupportedBy>("/supported-by"),
  save: (input: { eyebrow: string; items: Omit<SupportedByItem, "_id">[] }) =>
    api.put<SupportedBy>("/supported-by", input),
};
