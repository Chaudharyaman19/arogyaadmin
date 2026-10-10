"use client";

/* =========================================================
   CMS PAGE SECTION DEFAULTS + MERGING + SEO LOADING
   Extracted from pages/[id]/edit/page.tsx
========================================================= */

import { api } from "@/lib/api";
import { defaultLandingSections } from "@/lib/landingContent";
import { defaultAboutSections } from "@/lib/aboutContent";
import { defaultPaperPresentationSections } from "@/lib/paperPresentationContent";
import { defaultAdvisorySections, defaultNominateAdvisorySections } from "@/lib/advisoryContent";
import { defaultBlogSections } from "@/lib/blogContent";
import { defaultParticipateAsExhibitorSections } from "@/lib/participateAsExhibitorContent";
import { defaultExhibitionCategoriesSections } from "@/lib/exhibitionCategoriesContent";
import {
  defaultBookAStandSections,
  defaultVisitorRegistrationSections,
  defaultDelegateRegistrationSections,
  defaultBuyerRegistrationSections,
  defaultTermsAndConditionsSections,
  defaultPrivacyPolicySections,
  defaultRefundPolicySections,
} from "@/lib/registrationPagesContent";
import { defaultWhyVisitSections } from "@/lib/whyVisitContent";
import { defaultWhyExhibitSections } from "@/lib/whyExhibitContent";
import {
  defaultMsmeSections,
  defaultMsmeEligibilityCheckSections,
  defaultMsmeApplySections,
  defaultMsmeParticipationDetailsSections,
  defaultMsmeApplyPaymentSections,
  defaultExhibitorLoginSections,
  defaultBuyerLoginSections,
  defaultDelegatesLoginSections,
  defaultUserLoginSections,
} from "@/lib/msmeContent";
import { defaultExhibitorsSections } from "@/lib/exhibitorsContent";
import { defaultBuyerSellerMeetSections } from "@/lib/buyerSellerMeetContent";
import { defaultGallerySections } from "@/lib/galleryContent";
import { defaultAwardsSections, defaultAwardsNominationSections } from "@/lib/awardsContent";
import { defaultContactSections } from "@/lib/contactContent";
import { defaultSponsorshipSections, defaultEPromotionSections, defaultPartnershipPageSections, defaultSubPartnershipSections } from "@/lib/opportunityContent";
import { defaultSupportServicesSections } from "@/lib/extraPagesContent";

export function getDefaultSectionsForPage(page: any): Array<Record<string, any>> {
  const key = (page.configKey || "").toLowerCase();
  const title = (page.title || "").toLowerCase();
  const slug = (page.slug || "").toLowerCase();
  if (key === "msmeeligibilitycheckpage" || slug.includes("eligibility-check")) return defaultMsmeEligibilityCheckSections;
  if (key === "msmeapplypaymentpage" || slug.includes("participate/msme/apply/payment")) return defaultMsmeApplyPaymentSections;
  if (key === "msmeapplyparticipationdetailspage" || slug.includes("participation-details")) return defaultMsmeParticipationDetailsSections;
  if (key === "msmeapplypage" || (slug.includes("participate/msme/apply") && !slug.includes("participation-details") && !slug.includes("payment"))) return defaultMsmeApplySections;
  if (key.includes("partnerpage") || (slug.includes("partnership/") && slug !== "/partnership")) return defaultSubPartnershipSections;
  if (key === "awardsnominationpage" || slug.includes("awards/nominations")) return defaultAwardsNominationSections;
  if (key === "nominateadvisorypage" || slug.includes("nominate_advisory_board")) return defaultNominateAdvisorySections;
  if (key === "supportservicespage" || slug.includes("suport_services")) return defaultSupportServicesSections;
  if (key === "aboutpage" || title.includes("about") || slug === "/about") return defaultAboutSections;
  if (key === "paperpresentationpage" || title.includes("paper") || slug.includes("paper-presentation")) return defaultPaperPresentationSections;
  if (key === "advisorypage" || title.includes("advisory") || slug.includes("advisory")) return defaultAdvisorySections;
  if (key === "blogpage" || title.includes("blog") || slug.includes("blog")) return defaultBlogSections;
  if (key === "participateasexhibitorpage" || title.includes("participate as exhibitor") || slug.includes("participate-as-exhibitor")) return defaultParticipateAsExhibitorSections;
  if (key === "exhibitioncategoriespage" || title.includes("exhibition categories") || slug.includes("exhibition-categories")) return defaultExhibitionCategoriesSections;
  if (key === "bookastandpage" || title.includes("book a stall") || title.includes("book a stand") || slug.includes("book-a-stand")) return defaultBookAStandSections;
  if (key === "visitorregistrationpage" || title.includes("register as visitor") || title.includes("visitor registration") || slug.includes("visitor-registration")) return defaultVisitorRegistrationSections;
  if (key === "delegateregistrationpage" || title.includes("delegate registration") || slug.includes("delegate-registration")) return defaultDelegateRegistrationSections;
  if (key === "buyerregistrationpage" || title.includes("register as buyer") || title.includes("buyer registration") || slug.includes("buyer-registration")) return defaultBuyerRegistrationSections;
  if (key === "termsandconditionspage" || title.includes("terms") || slug.includes("terms")) return defaultTermsAndConditionsSections;
  if (key === "privacypolicypage" || title.includes("privacy") || slug.includes("privacy")) return defaultPrivacyPolicySections;
  if (key === "refundpolicypage" || title.includes("refund") || slug.includes("refund")) return defaultRefundPolicySections;
  if (key === "whyvisitpage" || title.includes("why visit") || slug.includes("why-visit")) return defaultWhyVisitSections;
  if (key === "whyexhibitpage" || title.includes("why exhibit") || slug.includes("why-exhibit")) return defaultWhyExhibitSections;
  if (key === "msmepage" || title.includes("msme") || slug.includes("msme")) return defaultMsmeSections;
  if (key === "exhibitorspage" || title.includes("exhibitors") || slug.includes("exhibitors")) return defaultExhibitorsSections;
  if (key === "buyersellermeetpage" || title.includes("buyer-seller") || slug.includes("buyer-seller")) return defaultBuyerSellerMeetSections;
  if (key === "gallerypage" || title.includes("gallery") || slug.includes("gallery")) return defaultGallerySections;
  if (key === "awardspage" || title.includes("award") || slug.includes("awards")) return defaultAwardsSections;
  if (key === "sponsorshippage" || title.includes("sponsorship") || slug.includes("sponsorship")) return defaultSponsorshipSections;
  if (key === "epromotionpage" || title.includes("e-promotion") || slug.includes("e-promotion")) return defaultEPromotionSections;
  if (key === "partnershippage" || title.includes("partnership") || slug.includes("partnership")) return defaultPartnershipPageSections;
  if (key === "exhibitorloginpage" || title.includes("exhibitor login") || slug.includes("exhibitor-login")) return defaultExhibitorLoginSections;
  if (key === "buyerloginpage" || title.includes("buyer login") || slug.includes("buyer-login")) return defaultBuyerLoginSections;
  if (key === "delegatesloginpage" || title.includes("delegates login") || slug.includes("delegates-login")) return defaultDelegatesLoginSections;
  if (key === "userloginpage" || title.includes("user login") || slug.includes("/login")) return defaultUserLoginSections;
  if (key === "contactpage" || title.includes("contact") || title.includes("advisor") || slug.includes("contact")) return defaultContactSections;
  return defaultLandingSections;
}

export function buildSectionsDraft(
  page: any,
  settings: Record<string, any> | null,
): Array<Record<string, any>> {
  const cfg = page.configKey && settings ? settings[page.configKey] : undefined;
  const fallbackSections = getDefaultSectionsForPage(page);
  const stored = cfg?.sections;
  return fallbackSections.map((fallbackItem: Record<string, any>) => {
    const savedItem = stored?.find((s: Record<string, any>) => s.key === fallbackItem.key);
    if (!savedItem) return { ...fallbackItem };

    const items =
      fallbackItem.items !== undefined
        ? [
            ...fallbackItem.items.map((item: Record<string, any>, idx: number) => ({
              ...item,
              ...(savedItem.items?.[idx] || {}),
            })),
            ...(savedItem.items?.slice(fallbackItem.items.length) ?? []),
          ]
        : savedItem.items;
    const slides =
      fallbackItem.slides !== undefined
        ? [
            ...fallbackItem.slides.map((slide: Record<string, any>, idx: number) => ({
              ...slide,
              ...(savedItem.slides?.[idx] ?? {}),
            })),
            ...(savedItem.slides?.slice(fallbackItem.slides.length) ?? []),
          ]
        : savedItem.slides;

    const merged: Record<string, any> = { ...fallbackItem, ...savedItem, enabled: savedItem.enabled !== false };
    if (items !== undefined) merged.items = items;
    if (slides !== undefined) merged.slides = slides;

    /* Saved drafts from older section sets may carry stale keys —
       keep only the keys this fallback section defines (plus its lists). */
    Object.keys(merged).forEach((key) => {
      if (!(key in fallbackItem) && !["items", "slides", "enabled"].includes(key)) {
        delete merged[key];
      }
    });
    return merged;
  });
}

export function loadPageSeo(
  page: any,
  setForm: React.Dispatch<React.SetStateAction<Record<string, any>>>,
  canonicalEditorRef: React.RefObject<HTMLDivElement | null>,
): void {
  const pageKey = page.slug === "/" ? "home" : (page.slug ? page.slug.replace(/^\//, "") : "home");
  const isLocalEnv = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  api.get(`/seo/${pageKey}?envType=${isLocalEnv ? "local" : "live"}`)
    .then((res: any) => {
      const seoData = res?.data?.data || res?.data || res;
      if (seoData) {
        const defaultSiteUrl = isLocalEnv ? "http://localhost:3001" : "https://arogyabharat.org";
        const pagePath = page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "");
        const defaultTag = `<link rel="canonical" href="${defaultSiteUrl}${pagePath}" />`;

        const canonicalVal = (seoData.canonicalTag || seoData.canonicalUrl || defaultTag).trim();
        const match = canonicalVal.match(/href=["']([^"']+)["']/i);
        const cleanUrl = match ? match[1] : canonicalVal.replace(/<[^>]*>/g, "").trim() || `${defaultSiteUrl}${pagePath}`;

        setForm((prev) => ({
          ...prev,
          metaTitle: seoData.metaTitle || prev.metaTitle,
          metaDescription: seoData.metaDescription || prev.metaDescription,
          metaKeywords: seoData.metaKeywords || prev.metaKeywords,
          canonicalUrl: cleanUrl,
          canonicalTag: canonicalVal,
          openGraphTags: seoData.openGraphTags || prev.openGraphTags,
          schemaMarkup: seoData.schemaMarkup || prev.schemaMarkup,
          ogTitle: seoData.ogTitle || prev.ogTitle,
          ogDescription: seoData.ogDescription || prev.ogDescription,
          ogImage: seoData.ogImage || prev.ogImage,
          robotsIndex: seoData.robotsIndex !== undefined ? seoData.robotsIndex : prev.robotsIndex,
          robotsFollow: seoData.robotsFollow !== undefined ? seoData.robotsFollow : prev.robotsFollow,
          isActive: seoData.isActive !== undefined ? seoData.isActive : prev.isActive,
        }));

        if (canonicalEditorRef.current) {
          canonicalEditorRef.current.innerText = canonicalVal;
        }
      }
    })
    .catch(() => {});
}
