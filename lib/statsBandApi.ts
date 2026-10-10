import { api } from "./api";

// Website home counter strip — Pages & CMS → Home → "Stats Band (Counters)".
// Saved to backend-arogya; the website reads it from GET /api/stats-band.

export interface StatsBandItem {
  _id?: string;
  /** "150+", "1,000+" count up on the website; text like "ENDLESS" shows as is */
  number: string;
  label: string;
  /** one of the icon names in components/cms/editor/StatsBandEditor.tsx */
  icon: string;
  isActive: boolean;
}

export interface StatsBand {
  items: StatsBandItem[];
  updatedAt?: string;
  updatedBy?: string;
}

export const statsBandApi = {
  get: () => api.get<StatsBand>("/stats-band"),
  save: (items: Omit<StatsBandItem, "_id">[]) => api.put<StatsBand>("/stats-band", { items }),
};
