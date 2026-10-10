import { api } from "./api";

// Website settings saved to backend-arogya (the website reads them from GET /api/settings).

export interface TopbarContact {
  emails: string[];
  phones: string[];
  /** true while nothing is saved yet and the website shows its built-in contact details */
  isDefault?: boolean;
}

export const siteSettingsApi = {
  topbarContact: () => api.get<TopbarContact>("/site-settings/topbar-contact"),
  updateTopbarContact: (input: { emails: string[]; phones: string[] }) =>
    api.put<TopbarContact>("/site-settings/topbar-contact", input),
};
