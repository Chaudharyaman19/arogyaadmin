import { api } from "./api";
import { settingsApi } from "./settingsApi";
import type { Settings } from "./types";

export interface SeoFile {
  _id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileType: string;
  size: number;
  uploadedAt: string;
}

export interface AdvancedSeoSocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  linkedin: string;
}

export interface AdvancedSeoData {
  headerScripts: string;
  footerScripts: string;
  ga4MeasurementId: string;
  gtmContainerId: string;
  googleSearchConsoleVerification: string;
  socialLinks: AdvancedSeoSocialLinks;
  seoFiles: SeoFile[];
}

export interface AdvancedSeoScriptsPayload {
  headerScripts: string;
  footerScripts: string;
  ga4MeasurementId: string;
  gtmContainerId: string;
  googleSearchConsoleVerification: string;
  socialLinks: AdvancedSeoSocialLinks;
}

const KNOWN_PLATFORMS: Array<keyof AdvancedSeoSocialLinks> = [
  "facebook",
  "instagram",
  "twitter",
  "youtube",
  "linkedin",
];

function socialArrayToMap(
  list?: Array<{ platform: string; url: string }> | null
): AdvancedSeoSocialLinks {
  const map: AdvancedSeoSocialLinks = {
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    linkedin: "",
  };
  for (const entry of list ?? []) {
    const key = (entry?.platform ?? "").toLowerCase() as keyof AdvancedSeoSocialLinks;
    if (KNOWN_PLATFORMS.includes(key)) {
      map[key] = entry?.url ?? "";
    }
  }
  return map;
}

function mergeSocialLinks(
  existing: Array<{ platform: string; url: string }> | undefined | null,
  map: AdvancedSeoSocialLinks
): Array<{ platform: string; url: string }> {
  const kept = (existing ?? []).filter(
    (entry) => !KNOWN_PLATFORMS.includes((entry?.platform ?? "").toLowerCase() as keyof AdvancedSeoSocialLinks)
  );
  const rebuilt = KNOWN_PLATFORMS.map((platform) => ({ platform, url: (map[platform] ?? "").trim() })).filter(
    (entry) => entry.url !== ""
  );
  return [...kept, ...rebuilt];
}

/* =========================================================
   ADVANCED SEO API
   Scripts / tracking keys / social links persist in the
   same `settings.advancedSeo` + `settings.socialLinks`
   storage the Settings page uses (localStorage is the
   source of truth, backend sync best-effort).
   Root SEO file uploads talk to /seo-settings/* which the
   arogya backend does not serve yet — the page surfaces a
   proper error instead of pretending to succeed.
========================================================= */
export const advancedSeoApi = {
  get: async (): Promise<AdvancedSeoData> => {
    const settings = await settingsApi.get();
    const seo = (settings as Partial<Settings>).advancedSeo ?? {};
    return {
      headerScripts: seo.globalHeadCode ?? "",
      footerScripts: seo.globalBodyCode ?? "",
      ga4MeasurementId: seo.ga4MeasurementId ?? "",
      gtmContainerId: seo.gtmContainerId ?? "",
      googleSearchConsoleVerification: seo.googleSearchConsoleVerification ?? "",
      socialLinks: socialArrayToMap(settings.socialLinks),
      seoFiles: [],
    };
  },

  saveScripts: async (payload: AdvancedSeoScriptsPayload): Promise<AdvancedSeoData> => {
    const settings = await settingsApi.get();
    const currentSeo = (settings as Partial<Settings>).advancedSeo ?? {};
    await settingsApi.update({
      advancedSeo: {
        ...currentSeo,
        globalHeadCode: payload.headerScripts,
        globalBodyCode: payload.footerScripts,
        ga4MeasurementId: payload.ga4MeasurementId,
        gtmContainerId: payload.gtmContainerId,
        googleSearchConsoleVerification: payload.googleSearchConsoleVerification,
      },
      socialLinks: mergeSocialLinks(settings.socialLinks, payload.socialLinks),
    });
    return advancedSeoApi.get();
  },

  saveSocialLinks: async (links: AdvancedSeoSocialLinks): Promise<AdvancedSeoSocialLinks> => {
    const settings = await settingsApi.get();
    await settingsApi.update({
      socialLinks: mergeSocialLinks(settings.socialLinks, links),
    });
    return links;
  },

  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.postForm<SeoFile[] | unknown>("/seo-settings/upload-file", formData);
  },

  deleteFile: (fileId: string) => api.delete<unknown>(`/seo-settings/file/${fileId}`),
};
