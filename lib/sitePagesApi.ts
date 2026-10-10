import { api } from "./api";

// Published / Draft state of website pages (Pages & CMS toggle). A Draft page shows the
// website's 404 page and is left out of the website navbar and footer links.

export interface SitePageState {
  key: string;
  title: string;
  path: string;
  /** cannot be unpublished (Home) */
  locked: boolean;
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
  updatedBy: string;
}

export const sitePagesApi = {
  list: () => api.get<SitePageState[]>("/site-pages"),
  setPublished: (key: string, isPublished: boolean) =>
    api.patch<SitePageState>(`/site-pages/${key}`, { isPublished }),
};
