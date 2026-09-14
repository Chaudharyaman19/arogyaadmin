export const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001").replace(/\/$/, "");

export type PageStatus = "Published" | "Draft";

export type PageType = "home" | "page" | "people";

export interface CmsPage {
  configKey?: string;
  id: number;
  title: string;
  slug: string;
  author: string;
  status: PageStatus;
  seoScore: number;
  rating: "Excellent" | "Good" | "Needs Work";
  updated: string;
  updatedBy: string;
  type: PageType;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    h1Tag?: string;
    breadcrumbName?: string;
    schemaMarkup?: string;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
    canonicalTag?: string;
    openGraphTags?: string;
    isActive?: boolean;
  };
}
export function getCmsPageRouteKey(page: Pick<CmsPage, "title">): string {
  return page.title
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function findCmsPageByRouteKey(pages: CmsPage[], routeKey?: string): CmsPage | undefined {
  if (!routeKey) return undefined;
  const decoded = decodeURIComponent(routeKey).toLowerCase().trim();
  const numericId = Number(decoded);
  return pages.find((page) => {
    if (Number.isInteger(numericId) && page.id === numericId) return true;
    if (getCmsPageRouteKey(page) === decoded) return true;
    if (page.configKey && page.configKey.toLowerCase() === decoded) return true;
    const cleanSlug = page.slug.replace(/^\//, "").toLowerCase();
    if (cleanSlug && cleanSlug === decoded) return true;
    return false;
  });
}

type SettingsPageConfig = {
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    h1Tag?: string;
    breadcrumbName?: string;
    schemaMarkup?: string;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
    canonicalTag?: string;
    openGraphTags?: string;
    isActive?: boolean;
  };
  sections?: Array<{ enabled?: boolean }>;
};

const pageDefinitions = [
  ["landingPage", "Home", "/", "home"],
  ["aboutPage", "About Arogya", "/about", "page"],
  ["speakersPage", "Keynote Speakers & Experts", "/speakers", "page"],
  ["registerNowPage", "Register Now (Hub)", "/register-now", "page"],
  ["delegateRegistrationPage", "Delegate Registration", "/delegate-registration", "page"],
  ["singleRegistrationPage", "Single Delegate Registration", "/new-single-registration", "page"],
  ["groupRegistrationPage", "Group Delegate Registration", "/new-group-registration", "page"],
  ["paperPresentationPage", "Paper Presentation", "/paper-presentation", "page"],
  ["galleryPage", "Glimpses & Gallery", "/gallery", "page"],
  ["partnersPage", "Partners & Collaborators", "/partners", "page"],
  ["blogPage", "Blogs & News", "/blogs", "page"],
  ["contactPage", "Contact Us", "/contact", "page"],
  ["verifyDelegatePage", "Verify Delegate Registration", "/verify-delegate", "page"],
  ["delegateProfilePage", "Delegate Profile", "/delegate-profile", "page"],
  ["paymentReceiptPage", "Payment Receipt", "/payment-receipt", "page"],
  ["userLoginPage", "User / Delegate Login", "/login", "page"],
] as const;

function seoScore(config: SettingsPageConfig): number {
  const seo = config.seo ?? {};
  const checks = [
    Boolean(seo.metaTitle?.trim()),
    Boolean(seo.metaDescription?.trim()),
    Boolean(seo.h1Tag?.trim()),
    Boolean(seo.schemaMarkup?.trim()),
    seo.robotsIndex !== false,
    Boolean(config.sections?.length),
    Boolean(config.sections?.some((section) => section.enabled !== false)),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function cmsPagesFromSettings(settings: Record<string, unknown>): CmsPage[] {
  const updatedAt = typeof settings.updatedAt === "string" ? new Date(settings.updatedAt) : new Date("2026-09-14T10:00:00.000Z");
  return pageDefinitions.map(([key, title, slug, type], index) => {
    const config = (settings[key] as SettingsPageConfig | undefined) ?? {};
    const score = seoScore(config);
    const status: PageStatus = config.sections && config.sections.length > 0
      ? (config.sections.some((section) => section.enabled !== false) ? "Published" : "Draft")
      : "Published";
    return {
      id: index + 1,
      configKey: key,
      title,
      slug,
      author: "Admin User",
      status,
      seoScore: score,
      rating: score >= 90 ? "Excellent" : score >= 75 ? "Good" : "Needs Work",
      updated: updatedAt.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      updatedBy: "Admin User",
      type,
      seo: config.seo,
    };
  });
}

export function getCmsPageDefinition(id: number) {
  const definition = pageDefinitions[id - 1];
  if (!definition) return null;
  const [configKey, title, slug, type] = definition;
  return { configKey, title, slug, type };
}

export const cmsPages: CmsPage[] = cmsPagesFromSettings({});
