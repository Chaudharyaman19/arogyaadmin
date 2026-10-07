"use client";

/* =========================================================
   CMS PAGE SECTION DEFAULTS, MERGING + BACKEND HYDRATION
   Extracted from pages/[id]/edit/page.tsx
========================================================= */

import { api } from "@/lib/api";
import { defaultLandingSections } from "@/lib/landingContent";
import { defaultAboutSections } from "@/lib/aboutContent";
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

type SectionsDraftSetter = React.Dispatch<React.SetStateAction<Array<Record<string, any>>>>;

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
  const rawSections = fallbackSections.map((fallbackItem: Record<string, any>) => {
    const savedItem = stored?.find((s: Record<string, any>) => s.key === fallbackItem.key);
    if (!savedItem) return { ...fallbackItem };
    const merged = {
      ...fallbackItem,
      ...savedItem,
      items: fallbackItem.items !== undefined ? (
        fallbackItem.items.map((item: Record<string, any>, idx: number) => ({
          ...item,
          ...(savedItem.items?.[idx] || {}),
        }))
      ) : undefined,
    };
    if (fallbackItem.key === "audience-strip" || merged.key === "audience-strip") {
      delete merged.title;
    }
    if (fallbackItem.key === "introduction-section" || merged.key === "introduction-section") {
      delete merged.items;
      if (!merged.description2) {
        merged.description2 =
          "Designed to foster business growth, knowledge sharing, innovation, and international collaboration, Arogya Expo serves as the perfect destination for discovering new products, building strategic partnerships, expanding global markets, and promoting a sustainable future.";
      }
      if (!merged.timerTitle) merged.timerTitle = "EVENT BEGINS IN";
      if (!merged.eventDate) merged.eventDate = "2027-02-19T00:00:00";
      if (merged.showTimer === undefined) merged.showTimer = true;
    }
    if (fallbackItem.key === "global-platform" || merged.key === "global-platform") {
      delete merged.subtitle;
      delete merged.title;
      delete merged.image;
      delete merged.imageAlt;
      if (!merged.keyPoint1) merged.keyPoint1 = "International Exhibitors & Global Brands";
      if (!merged.keyPoint2) merged.keyPoint2 = "Buyers, Distributors & Importers";
      if (!merged.keyPoint3) merged.keyPoint3 = "Research & Innovation | Startups";
      if (!merged.keyPoint4) merged.keyPoint4 = "Investors, Financial Institutions";
      if (!merged.keyPoint5) merged.keyPoint5 = "Government Bodies, Embassies & Policy Makers";
      merged.items = (merged.items || []).filter(
        (it: any) =>
          !/trusted brands|targeted audience|business growth/i.test(it.title || "")
      );
    }
    if (fallbackItem.key === "why-participate" || merged.key === "why-participate") {
      delete merged.subtitle;
      delete merged.title;
      delete merged.items;
      if (!merged.keyPoint1) merged.keyPoint1 = "Meet genuine buyers, distributors, retailers, and healthcare professionals";
      if (!merged.keyPoint2) merged.keyPoint2 = "Generate high-quality B2B & B2C leads with faster business conversions";
      if (!merged.keyPoint3) merged.keyPoint3 = "Launch new products with maximum visibility and market impact";
      if (!merged.keyPoint4) merged.keyPoint4 = "Expand your dealer, distributor, franchise, and export network";
      if (!merged.keyPoint5) merged.keyPoint5 = "Strengthen brand presence through live demos and media exposure";
      if (!merged.keyPoint6) merged.keyPoint6 = "Connect with investors, CEOs, doctors, and key decision-makers";
      if (!merged.keyPoint7) merged.keyPoint7 = "Achieve higher ROI with direct customer engagement and trust building";
      if (!merged.buttonLabel) merged.buttonLabel = "BOOK A STALL";
      if (!merged.buttonHref) merged.buttonHref = "/registration/book-a-stand";
      if (!merged.secondaryButtonLabel) merged.secondaryButtonLabel = "Download Brochure";
      if (!merged.secondaryButtonHref) merged.secondaryButtonHref = "/download/invited card.pdf";
      if (!merged.tertiaryButtonLabel) merged.tertiaryButtonLabel = "Why Exhibit?";
      if (!merged.tertiaryButtonHref) merged.tertiaryButtonHref = "/why-exhibit";
    }
    if (fallbackItem.key === "conference-section" || merged.key === "conference-section") {
      delete merged.subtitle;
      delete merged.title;
      delete merged.items;
      if (!merged.eyebrow) merged.eyebrow = "GLOBAL CONFERENCE & SEMINARS";
      if (!merged.titlePrimary) merged.titlePrimary = "Where Knowledge Meets";
      if (!merged.titleSecondary) merged.titleSecondary = "the Future of Organic";
      if (!merged.description) merged.description = "Join expert-led sessions, panel discussions & thought leadership talks on the latest trends shaping the future of organic, natural and sustainable living.";
      if (!merged.buttonLabel) merged.buttonLabel = "View Conference Schedule";
      if (!merged.buttonHref) merged.buttonHref = "https://arogya.namogange.org/";
      if (!merged.keyPoint1) merged.keyPoint1 = "Expert-led panel discussions & keynotes";
      if (!merged.keyPoint2) merged.keyPoint2 = "Emerging trends in organic farming & retail";
      if (!merged.keyPoint3) merged.keyPoint3 = "Sustainable business & growth strategies";
      if (!merged.stat1Title) merged.stat1Title = "19 – 21";
      if (!merged.stat1Sub) merged.stat1Sub = "FEBRUARY 2027";
      if (!merged.stat2Title) merged.stat2Title = "PRAGATI MAIDAN";
      if (!merged.stat2Sub) merged.stat2Sub = "NEW DELHI";
      if (!merged.stat3Title) merged.stat3Title = "INSIGHTS. IDEAS.";
      if (!merged.stat3Sub) merged.stat3Sub = "IMPACT.";
      if (!merged.stat4Title) merged.stat4Title = "50+ GLOBAL";
      if (!merged.stat4Sub) merged.stat4Sub = "SPEAKERS";
      if (!merged.stat5Title) merged.stat5Title = "20+ KEY";
      if (!merged.stat5Sub) merged.stat5Sub = "SESSIONS";
    }
    if (fallbackItem.key === "expo-categories" || merged.key === "expo-categories") {
      delete merged.image;
      delete merged.imageAlt;
      delete merged.title;
      delete merged.subtitle;
      if (!merged.sectionTag) merged.sectionTag = "Expo Categories";
      if (!merged.titleMain) merged.titleMain = "Explore Diverse";
      if (!merged.titleHighlight) merged.titleHighlight = "Exhibition Sectors";
      if (!merged.descriptionPrefix) merged.descriptionPrefix = "One Platform. Every Opportunity.";
      if (!merged.description) merged.description = "Arogya Expo brings together the entire organic ecosystem under one roof. Explore a wide range of sectors driving sustainable living, natural wellness, ethical production and global trade.";
      if (!merged.buttonText) merged.buttonText = "VIEW ALL CATEGORIES";
      if (!merged.buttonHref) merged.buttonHref = "/exhibition-categories";
      if (!merged.exploreText) merged.exploreText = "Explore";
      if (Array.isArray(merged.items)) {
        merged.items = merged.items.map((it: any) => {
          const clean = { ...it };
          delete clean.icon;
          delete clean.desc;
          delete clean.color;
          delete clean.imageAlt;
          if (clean.description === undefined) clean.description = it.desc || "";
          if (clean.image === undefined) clean.image = "";
          if (!clean.href) clean.href = it.link || "/exhibition-categories";
          if (!clean.exploreText) clean.exploreText = "Explore";
          return clean;
        });
      }
    }
    if (fallbackItem.key === "beyond-exhibition" || merged.key === "beyond-exhibition") {
      delete merged.title;
      delete merged.subtitle;
      if (!merged.sectionTag) merged.sectionTag = "Global Organic Platform";
      if (!merged.titleMain) merged.titleMain = "Beyond An";
      if (!merged.titleHighlight) merged.titleHighlight = "Exhibition";
      if (!merged.description) merged.description = "Join India's most powerful ecosystem for the organic industry. From high-impact B2B matchmaking and leadership summits to global networking, we provide everything you need to scale your business.";
      if (!merged.image) merged.image = "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/arogya-sewa/assets/km.jpg";
      if (!merged.imageAlt) merged.imageAlt = "Conferences & Seminars";
      if (Array.isArray(merged.items)) {
        merged.items = merged.items.map((it: any) => ({
          title: it.title || "",
          description: it.description || it.subtitle || "",
          icon: it.icon || "Users",
        }));
      }
    }
    if (fallbackItem.key === "sponsors-attend" || merged.key === "sponsors-attend") {
      delete merged.title;
      delete merged.subtitle;
      delete merged.rightTitle;
      delete merged.rightBottomText;
      delete merged.centerText1;
      delete merged.centerText2;
      delete merged.centerText3;
      delete merged.items;
      if (!merged.titlePrefix) merged.titlePrefix = "WHY";
      if (!merged.titleHighlight) merged.titleHighlight = "ATTEND?";
      if (!merged.description) merged.description = "Explore innovations, build connections and gain insights that drive better health and stronger businesses.";
      if (!merged.image) merged.image = "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/arogya-sewa/assets/km.jpg";
      if (!merged.imageAlt) merged.imageAlt = "Why Attend Expo";
      if (!merged.buttonLabel) merged.buttonLabel = "REGISTER AS VISITOR!";
      if (!merged.buttonHref) merged.buttonHref = "/registration/visitor-registration";
      if (!merged.feature1Title) merged.feature1Title = "DISCOVER";
      if (!merged.feature1Desc) merged.feature1Desc = "Explore the latest organic products and eco-friendly services driving a sustainable future.";
      if (!merged.feature2Title) merged.feature2Title = "LEARN";
      if (!merged.feature2Desc) merged.feature2Desc = "Attend seminars, workshops and live demos by organic agriculture and sustainability experts.";
      if (!merged.feature3Title) merged.feature3Title = "CONNECT";
      if (!merged.feature3Desc) merged.feature3Desc = "Meet leading organic brands, manufacturers and sustainable suppliers under one roof.";
      if (!merged.feature4Title) merged.feature4Title = "SOURCE";
      if (!merged.feature4Desc) merged.feature4Desc = "Find trusted organic suppliers, distributors and eco-franchise opportunities.";
      if (!merged.feature5Title) merged.feature5Title = "GROW";
      if (!merged.feature5Desc) merged.feature5Desc = "Unlock new green business opportunities, partnerships and eco-investment possibilities.";
      if (!merged.feature6Title) merged.feature6Title = "STAY AHEAD";
      if (!merged.feature6Desc) merged.feature6Desc = "Stay updated with market trends, conscious consumer insights and future organic industry developments.";
      if (!merged.keyPoint1) merged.keyPoint1 = "Organic Distributors, Wholesalers & Retailers";
      if (!merged.keyPoint2) merged.keyPoint2 = "Eco-Importers & Exporters";
      if (!merged.keyPoint3) merged.keyPoint3 = "Ayurvedic Institutions & Wellness Centers";
      if (!merged.keyPoint4) merged.keyPoint4 = "Nutritionists, Farmers & Wellness Experts";
      if (!merged.keyPoint5) merged.keyPoint5 = "Gym Owners, Spa & Eco-Fitness Professionals";
      if (!merged.keyPoint6) merged.keyPoint6 = "Organic Farming & Natural Product Buyers";
      if (!merged.keyPoint7) merged.keyPoint7 = "Sustainable Packaging & Eco-friendly Brands";
      if (!merged.keyPoint8) merged.keyPoint8 = "Investors, Franchise Seekers & Green Business";
      if (!merged.keyPoint9) merged.keyPoint9 = "Supermarkets & Organic Grocery Chains";
      if (!merged.keyPoint10) merged.keyPoint10 = "Health-Conscious Consumers & Eco-Enthusiasts";
    }
    if (fallbackItem.key === "footer" || merged.key === "footer") {
      delete merged.title;
      delete merged.subtitle;
      delete merged.partnerLogoImage;
      delete merged.secondaryImage;
      delete merged.tertiaryImage;
      delete merged.altPhoneNumber;
      if (!merged.websiteUrl) merged.websiteUrl = "www.arogyabharat.org";
      if (merged.description === undefined || merged.description.startsWith("Showcasing certified products")) {
        merged.description =
          "A global platform uniting over 500+ exhibitors from across the organic value chain, showcasing certified products, advanced agritech, sustainable practices, and the rich heritage of traditional wellness. Discover organic living with conferences and B2B opportunities.";
      }
      if (merged.logoImage === undefined || merged.logoImage.includes("km.jpg")) {
        merged.logoImage = "http://localhost:4000/uploads/bharat-organic_footer/1789129240083-112323989.png";
      }
      if (merged.leafImage === undefined) {
        merged.leafImage = "http://localhost:4000/uploads/bharat-organic_footer/1789129240457-21656484.png";
      }
      if (merged.downImage === undefined) {
        merged.downImage = "http://localhost:4000/uploads/bharat-organic_footer/1789129240816-597711504.png";
      }
      if (merged.organisedByLogo === undefined) {
        merged.organisedByLogo = "http://localhost:4000/uploads/bharat-organic_footer/1789129241128-849314126.png";
      }
      if (merged.bottomBannerImage === undefined) {
        merged.bottomBannerImage = "http://localhost:4000/uploads/bharat-organic_footer/1789129242465-452827954.webp";
      }
      if (merged.contactAddress === undefined) merged.contactAddress = "Hall 12, Pragati Maidan, New Delhi, India 110001";
      if (merged.phoneNumber === undefined) merged.phoneNumber = "+91 96549 00525";
      if (merged.conferenceHelpline === undefined) merged.conferenceHelpline = "+91 98183 53841";
      if (merged.contactEmail === undefined) merged.contactEmail = "info@namogangewellness.com";
      if (merged.facebookUrl === undefined) merged.facebookUrl = "https://facebook.com/arogyabharat";
      if (merged.twitterUrl === undefined) merged.twitterUrl = "https://twitter.com/bharatorganic";
      if (merged.linkedinUrl === undefined) merged.linkedinUrl = "https://linkedin.com/company/arogyabharat";
      if (merged.instagramUrl === undefined) merged.instagramUrl = "https://instagram.com/arogyabharat";
      if (merged.youtubeUrl === undefined) merged.youtubeUrl = "https://youtube.com/@arogyabharat";
      if (!merged.items || merged.items.length === 0) {
        merged.items = [
          { label: "Home", href: "/" },
          { label: "About Us", href: "/about" },
          { label: "Exhibitor Registration", href: "/registration/book-a-stand" },
          { label: "Delegate Registration", href: "https://arogya.namogange.org/" },
          { label: "Conference Tracks", href: "https://arogya.namogange.org/" },
          { label: "Buyer Seller Meet", href: "/buyer-seller-meet" },
          { label: "Exhibitor List", href: "/exhibitors" },
          { label: "Blogs", href: "/blog" },
          { label: "Awards", href: "/awards" },
          { label: "Contact Us", href: "/contact" },
        ];
      }
    }
    return merged;
  });
  const finalSections = rawSections && rawSections.length > 0 ? rawSections : fallbackSections;
  return finalSections;
}

export function hydrateHomeSections(
  page: any,
  setSectionsDraft: SectionsDraftSetter,
): void {
  if (page.configKey === "landingPage" || page.type === "home") {
    api.get("/website/home/audience-strip")
      .then((res: any) => {
        const data = res?.data?.data || res?.data || res;
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          setSectionsDraft((prev) =>
            prev.map((sec) =>
              sec.key === "audience-strip"
                ? {
                    ...sec,
                    enabled: data.enabled !== false,
                    items: data.items.map((it: any) => ({
                      title: it.title ?? "",
                      subtitle: it.subtitle ?? "",
                      label: it.label ?? `${it.title ?? ""} ${it.subtitle ?? ""}`.trim(),
                      icon: it.icon ?? "GraduationCap",
                      color: it.color ?? "#facc15",
                    })),
                  }
                : sec
            )
          );
        }
      })
      .catch(() => {});

    api.get("/website/home/introduction-section")
      .then((res: any) => {
        const data = res?.data?.data || res?.data || res;
        if (data) {
          setSectionsDraft((prev) =>
            prev.map((sec) =>
              sec.key === "introduction-section"
                ? {
                    ...sec,
                    enabled: data.enabled !== false,
                    eyebrow: data.eyebrow ?? sec.eyebrow,
                    titlePrimary: data.titlePrimary ?? sec.titlePrimary,
                    titleSecondary: data.titleSecondary ?? sec.titleSecondary,
                    subtitle: data.subtitle ?? sec.subtitle,
                    description: data.description ?? sec.description,
                    description2: data.description2 ?? sec.description2,
                    buttonLabel: data.buttonLabel ?? sec.buttonLabel,
                    buttonHref: data.buttonHref ?? sec.buttonHref,
                    timerTitle: data.timerTitle ?? sec.timerTitle,
                    eventDate: data.eventDate ?? sec.eventDate,
                    showTimer: data.showTimer !== false,
                    image: data.image ?? sec.image,
                    imageAlt: data.imageAlt ?? sec.imageAlt,
                  }
                : sec
            )
          );
        }
      })
      .catch(() => {});

    api.get("/website/home/global-platform")
      .then((res: any) => {
        const data = res?.data?.data || res?.data || res;
        if (data) {
          setSectionsDraft((prev) =>
            prev.map((sec) =>
              sec.key === "global-platform"
                ? {
                    ...sec,
                    enabled: data.enabled !== false,
                    eyebrow: data.eyebrow ?? data.badge ?? sec.eyebrow,
                    titlePrimary: data.titlePrimary ?? sec.titlePrimary,
                    titleSecondary: data.titleSecondary ?? sec.titleSecondary,
                    description: data.description ?? sec.description,
                    keyPoint1:
                      data.keyPoint1 ??
                      data.listItems?.[0] ??
                      sec.keyPoint1 ??
                      "International Exhibitors & Global Brands",
                    keyPoint2:
                      data.keyPoint2 ??
                      data.listItems?.[1] ??
                      sec.keyPoint2 ??
                      "Buyers, Distributors & Importers",
                    keyPoint3:
                      data.keyPoint3 ??
                      data.listItems?.[2] ??
                      sec.keyPoint3 ??
                      "Research & Innovation | Startups",
                    keyPoint4:
                      data.keyPoint4 ??
                      data.listItems?.[3] ??
                      sec.keyPoint4 ??
                      "Investors, Financial Institutions",
                    keyPoint5:
                      data.keyPoint5 ??
                      data.listItems?.[4] ??
                      sec.keyPoint5 ??
                      "Government Bodies, Embassies & Policy Makers",
                    items:
                      Array.isArray(data.items || data.cards) &&
                      (data.items || data.cards).length > 0
                        ? (data.items || data.cards)
                            .filter(
                              (c: any) =>
                                !/trusted brands|targeted audience|business growth/i.test(
                                  c.title || ""
                                )
                            )
                            .map((c: any) => ({
                              title: c.title ?? "",
                              description: c.description ?? c.desc ?? "",
                            }))
                        : sec.items,
                  }
                : sec
            )
          );
        }
      })
      .catch(() => {});

    api.get("/website/home/why-participate")
      .then((res: any) => {
        const data = res?.data?.data || res?.data || res;
        if (data) {
          setSectionsDraft((prev) =>
            prev.map((sec) =>
              sec.key === "why-participate"
                ? {
                    ...sec,
                    enabled: data.enabled !== false,
                    eyebrow: data.eyebrow ?? data.sectionTag ?? sec.eyebrow,
                    titlePrimary: data.titlePrimary ?? data.titleMain ?? sec.titlePrimary,
                    titleSecondary: data.titleSecondary ?? data.titleHighlight ?? sec.titleSecondary,
                    description: data.description ?? sec.description,
                    image: data.image ?? sec.image,
                    imageAlt: data.imageAlt ?? sec.imageAlt,
                    buttonLabel: data.buttonLabel ?? data.buttons?.stall?.text ?? sec.buttonLabel,
                    buttonHref: data.buttonHref ?? data.buttons?.stall?.link ?? sec.buttonHref,
                    secondaryButtonLabel: data.secondaryButtonLabel ?? data.buttons?.brochure?.text ?? sec.secondaryButtonLabel,
                    secondaryButtonHref: data.secondaryButtonHref ?? data.buttons?.brochure?.link ?? sec.secondaryButtonHref,
                    tertiaryButtonLabel: data.tertiaryButtonLabel ?? data.buttons?.moreInfo?.text ?? sec.tertiaryButtonLabel,
                    tertiaryButtonHref: data.tertiaryButtonHref ?? data.buttons?.moreInfo?.link ?? sec.tertiaryButtonHref,
                    keyPoint1: data.keyPoint1 ?? data.points?.[0] ?? sec.keyPoint1,
                    keyPoint2: data.keyPoint2 ?? data.points?.[1] ?? sec.keyPoint2,
                    keyPoint3: data.keyPoint3 ?? data.points?.[2] ?? sec.keyPoint3,
                    keyPoint4: data.keyPoint4 ?? data.points?.[3] ?? sec.keyPoint4,
                    keyPoint5: data.keyPoint5 ?? data.points?.[4] ?? sec.keyPoint5,
                    keyPoint6: data.keyPoint6 ?? data.points?.[5] ?? sec.keyPoint6,
                    keyPoint7: data.keyPoint7 ?? data.points?.[6] ?? sec.keyPoint7,
                  }
                : sec
            )
          );
        }
      })
      .catch(() => {});

    api.get("/website/home/conference-seminars")
      .then((res: any) => {
        const data = res?.data?.data || res?.data || res;
        if (data) {
          setSectionsDraft((prev) =>
            prev.map((sec) =>
              sec.key === "conference-section"
                ? {
                    ...sec,
                    enabled: data.enabled !== false,
                    eyebrow: data.eyebrow ?? data.sectionTag ?? sec.eyebrow,
                    titlePrimary: data.titlePrimary ?? data.titleMain ?? sec.titlePrimary,
                    titleSecondary: data.titleSecondary ?? data.titleHighlight ?? sec.titleSecondary,
                    description: data.description ?? sec.description,
                    image: data.image ?? sec.image,
                    imageAlt: data.imageAlt ?? sec.imageAlt,
                    buttonLabel: data.buttonLabel ?? data.button?.text ?? sec.buttonLabel,
                    buttonHref: data.buttonHref ?? data.button?.link ?? sec.buttonHref,
                    keyPoint1: data.keyPoint1 ?? data.checklist?.[0] ?? sec.keyPoint1,
                    keyPoint2: data.keyPoint2 ?? data.checklist?.[1] ?? sec.keyPoint2,
                    keyPoint3: data.keyPoint3 ?? data.checklist?.[2] ?? sec.keyPoint3,
                    stat1Title: data.stat1Title ?? data.eventInfo?.[0]?.title ?? sec.stat1Title,
                    stat1Sub: data.stat1Sub ?? data.eventInfo?.[0]?.sub ?? sec.stat1Sub,
                    stat2Title: data.stat2Title ?? data.eventInfo?.[1]?.title ?? sec.stat2Title,
                    stat2Sub: data.stat2Sub ?? data.eventInfo?.[1]?.sub ?? sec.stat2Sub,
                    stat3Title: data.stat3Title ?? data.eventInfo?.[2]?.title ?? sec.stat3Title,
                    stat3Sub: data.stat3Sub ?? data.eventInfo?.[2]?.sub ?? sec.stat3Sub,
                    stat4Title: data.stat4Title ?? data.eventInfo?.[3]?.title ?? sec.stat4Title,
                    stat4Sub: data.stat4Sub ?? data.eventInfo?.[3]?.sub ?? sec.stat4Sub,
                    stat5Title: data.stat5Title ?? data.eventInfo?.[4]?.title ?? sec.stat5Title,
                    stat5Sub: data.stat5Sub ?? data.eventInfo?.[4]?.sub ?? sec.stat5Sub,
                  }
                : sec
            )
          );
        }
      })
      .catch(() => {});

    api.get("/website/home/expo-categories")
      .then((res: any) => {
        const data = res?.data?.data || res?.data || res;
        if (data) {
          setSectionsDraft((prev) =>
            prev.map((sec) =>
              sec.key === "expo-categories"
                ? {
                    ...sec,
                    enabled: data.enabled !== false,
                    sectionTag: data.sectionTag ?? sec.sectionTag,
                    titleMain: data.titleMain ?? sec.titleMain,
                    titleHighlight: data.titleHighlight ?? sec.titleHighlight,
                    descriptionPrefix: data.descriptionPrefix ?? sec.descriptionPrefix,
                    description: data.description ?? sec.description,
                    exploreText: data.exploreText ?? sec.exploreText,
                    buttonText: data.buttonText ?? sec.buttonText,
                    buttonHref: data.buttonHref ?? data.buttonLink ?? sec.buttonHref,
                    items: Array.isArray(data.items) && data.items.length > 0
                      ? data.items.map((it: any) => ({
                          title: it.title || "",
                          description: it.description ?? it.desc ?? "",
                          image: it.image || "",
                          href: it.href ?? it.link ?? "/exhibition-categories",
                          exploreText: it.exploreText || "Explore",
                        }))
                      : Array.isArray(data.categories) && data.categories.length > 0
                      ? data.categories.map((it: any) => ({
                          title: it.title || "",
                          description: it.description ?? it.desc ?? "",
                          image: it.image || "",
                          href: it.href ?? it.link ?? "/exhibition-categories",
                          exploreText: it.exploreText || "Explore",
                        }))
                      : sec.items,
                  }
                : sec
            )
          );
        }
      })
      .catch(() => {});

    api.get("/website/home/beyond-exhibition")
      .then((res: any) => {
        const data = res?.data?.data || res?.data || res;
        if (data) {
          setSectionsDraft((prev) =>
            prev.map((sec) =>
              sec.key === "beyond-exhibition"
                ? {
                    ...sec,
                    enabled: data.enabled !== false,
                    sectionTag: data.sectionTag ?? sec.sectionTag,
                    titleMain: data.titleMain ?? sec.titleMain,
                    titleHighlight: data.titleHighlight ?? sec.titleHighlight,
                    description: data.description ?? sec.description,
                    image: data.image ?? sec.image,
                    imageAlt: data.imageAlt ?? sec.imageAlt,
                    items: Array.isArray(data.items) && data.items.length > 0
                      ? data.items.map((it: any) => ({
                          title: it.title || "",
                          description: it.description ?? it.subtitle ?? "",
                          icon: it.icon || "Users",
                        }))
                      : Array.isArray(data.extras) && data.extras.length > 0
                      ? data.extras.map((it: any) => ({
                          title: it.title2 ? `${it.title} ${it.title2}`.trim() : (it.title || ""),
                          description: it.description ?? it.subtitle ?? "",
                          icon: it.icon || "Users",
                        }))
                      : sec.items,
                  }
                : sec
            )
          );
        }
      })
      .catch(() => {});

    api.get("/website/home/sponsors-attend")
      .then((res: any) => {
        const data = res?.data?.data || res?.data || res;
        if (data) {
          setSectionsDraft((prev) =>
            prev.map((sec) =>
              sec.key === "sponsors-attend"
                ? {
                    ...sec,
                    enabled: data.enabled !== false,
                    titlePrefix: data.titlePrefix ?? data.leftSection?.titlePrefix ?? sec.titlePrefix,
                    titleHighlight: data.titleHighlight ?? data.leftSection?.titleHighlight ?? sec.titleHighlight,
                    description: data.description ?? data.leftSection?.description ?? sec.description,
                    image: data.image ?? sec.image,
                    imageAlt: data.imageAlt ?? sec.imageAlt,
                    buttonLabel: data.buttonLabel ?? sec.buttonLabel,
                    buttonHref: data.buttonHref ?? sec.buttonHref,

                    feature1Title: data.feature1Title ?? data.leftSection?.itemsLeft?.[0]?.title ?? sec.feature1Title,
                    feature1Desc: data.feature1Desc ?? data.leftSection?.itemsLeft?.[0]?.desc ?? sec.feature1Desc,
                    feature2Title: data.feature2Title ?? data.leftSection?.itemsRight?.[0]?.title ?? sec.feature2Title,
                    feature2Desc: data.feature2Desc ?? data.leftSection?.itemsRight?.[0]?.desc ?? sec.feature2Desc,
                    feature3Title: data.feature3Title ?? data.leftSection?.itemsLeft?.[1]?.title ?? sec.feature3Title,
                    feature3Desc: data.feature3Desc ?? data.leftSection?.itemsLeft?.[1]?.desc ?? sec.feature3Desc,
                    feature4Title: data.feature4Title ?? data.leftSection?.itemsRight?.[1]?.title ?? sec.feature4Title,
                    feature4Desc: data.feature4Desc ?? data.leftSection?.itemsRight?.[1]?.desc ?? sec.feature4Desc,
                    feature5Title: data.feature5Title ?? data.leftSection?.itemsLeft?.[2]?.title ?? sec.feature5Title,
                    feature5Desc: data.feature5Desc ?? data.leftSection?.itemsLeft?.[2]?.desc ?? sec.feature5Desc,
                    feature6Title: data.feature6Title ?? data.leftSection?.itemsRight?.[2]?.title ?? sec.feature6Title,
                    feature6Desc: data.feature6Desc ?? data.leftSection?.itemsRight?.[2]?.desc ?? sec.feature6Desc,

                    keyPoint1: data.keyPoint1 ?? data.rightSection?.items?.[0]?.label ?? sec.keyPoint1,
                    keyPoint2: data.keyPoint2 ?? data.rightSection?.items?.[1]?.label ?? sec.keyPoint2,
                    keyPoint3: data.keyPoint3 ?? data.rightSection?.items?.[2]?.label ?? sec.keyPoint3,
                    keyPoint4: data.keyPoint4 ?? data.rightSection?.items?.[3]?.label ?? sec.keyPoint4,
                    keyPoint5: data.keyPoint5 ?? data.rightSection?.items?.[4]?.label ?? sec.keyPoint5,
                    keyPoint6: data.keyPoint6 ?? data.rightSection?.items?.[5]?.label ?? sec.keyPoint6,
                    keyPoint7: data.keyPoint7 ?? data.rightSection?.items?.[6]?.label ?? sec.keyPoint7,
                    keyPoint8: data.keyPoint8 ?? data.rightSection?.items?.[7]?.label ?? sec.keyPoint8,
                    keyPoint9: data.keyPoint9 ?? data.rightSection?.items?.[8]?.label ?? sec.keyPoint9,
                    keyPoint10: data.keyPoint10 ?? data.rightSection?.items?.[9]?.label ?? sec.keyPoint10,
                  }
                : sec
            )
          );
        }
      })
      .catch(() => {});
  }
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

