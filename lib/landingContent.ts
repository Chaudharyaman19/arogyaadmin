export interface LandingSectionItem {
  code?: string;
  step?: string;
  statusText?: string;
  title?: string;
  label?: string;
  subtitle?: string;
  value?: string;
  description?: string;
  image?: string;
  icon?: string;
  color?: string;
  href?: string;
  exploreText?: string;
  buttonLabel?: string;
  buttonHref?: string;
  features?: string[];
  secondaryImage?: string;
  tertiaryImage?: string;
  quaternaryImage?: string;
  videoUrl?: string;
  tag?: string;
  name?: string;
  role?: string;
  quote?: string;
  duration?: string;
  meta?: string;
  count?: number;
  location?: string;
  date?: string;
  readTime?: string;
  main?: string;
  sub?: string;
  num?: string;
  title1?: string;
  title2?: string;
  val?: string;
  desc?: string;
  companyName1?: string;
  companyName2?: string;
  initials?: string;
  question?: string;
  answer?: string;
  category?: string;
  year?: string;
  rating?: number;
  placeholder?: string;
}

export interface LandingHeroSlide {
  title: string;
  tagline?: string;
  titlePrimary?: string;
  titleSecondary?: string;
  subtitle?: string;
  description: string;
  date?: string;
  location?: string;
  image: string;
  alt: string;
  buttonLabel?: string;
  buttonHref?: string;
  secondaryButtonLabel?: string;
  secondaryButtonHref?: string;
  variant?: "default" | "family-support" | "journey-prayer" | "volunteer-impact";
}

export interface LandingSectionContent {
  key: string;
  name: string;
  enabled: boolean;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  logoImage?: string;
  partnerLogoImage?: string;
  secondaryLogoImage?: string;
  secondaryImage?: string;
  tertiaryImage?: string;
  quaternaryImage?: string;
  videoUrl?: string;
  secondaryVideoUrl?: string;
  quote?: string;
  legalNotice?: string;
  lowerTitle?: string;
  lowerDescription?: string;
  bottomStatement?: string;
  secondaryTitle?: string;
  secondaryDescription?: string;
  supportTitle?: string;
  supportDescription?: string;
  regionTitle?: string;
  regionDescription?: string;
  phoneLabel?: string;
  phoneNumber?: string;
  contactEmail?: string;
  contactAddress?: string;
  altPhoneNumber?: string;
  availabilityText?: string;
  actionTitle?: string;
  requestTitle?: string;
  requestDescription?: string;
  inputPlaceholder?: string;
  submitLabel?: string;
  submittedLabel?: string;
  successMessage?: string;
  initiativeLabel?: string;
  quickLinksTitle?: string;
  servicesTitle?: string;
  initiativesTitle?: string;
  contactTitle?: string;
  sloganTitle?: string;
  immediateHelpTitle?: string;
  immediateHelpDescription?: string;
  supportNowLabel?: string;
  supportMissionTitle?: string;
  supportMissionDescription?: string;
  buttonLabel?: string;
  buttonHref?: string;
  primaryButton?: string;
  secondaryButton?: string;
  primaryButtonHref?: string;
  headingBefore?: string;
  headingHighlight?: string;
  leftCardTitle?: string;
  leftCardDescription?: string;
  rightCardTitle?: string;
  rightCardDescription?: string;
  supportText?: string;
  services?: string[];
  disclaimerTitle?: string;
  disclaimerText?: string;
  secondaryButtonLabel?: string;
  secondaryButtonHref?: string;
  tertiaryButtonLabel?: string;
  tertiaryButtonHref?: string;
  tagline?: string;
  titlePrimary?: string;
  titleSecondary?: string;
  sectionTag?: string;
  titleMain?: string;
  titleHighlight?: string;
  descriptionPrefix?: string;
  date?: string;
  location?: string;
  exploreText?: string;
  buttonText?: string;
  marqueeText?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerFeature?: string;
  formTitle?: string;
  rightTitle?: string;
  rightBottomText?: string;
  centerText1?: string;
  centerText2?: string;
  centerText3?: string;
  websiteUrl?: string;
  imageBadgeText?: string;
  authorName?: string;
  authorDesignation?: string;
  headerTitle?: string;
  titlePrefix?: string;
  value?: string;
  badgeLine1?: string;
  badgeLine2?: string;
  description2?: string;
  timerTitle?: string;
  eventDate?: string;
  showTimer?: boolean;
  keyPoint1?: string;
  keyPoint2?: string;
  keyPoint3?: string;
  keyPoint4?: string;
  keyPoint5?: string;
  keyPoint6?: string;
  keyPoint7?: string;
  stat1Title?: string;
  stat1Sub?: string;
  stat2Title?: string;
  stat2Sub?: string;
  stat3Title?: string;
  stat3Sub?: string;
  stat4Title?: string;
  stat4Sub?: string;
  stat5Title?: string;
  stat5Sub?: string;
  slides?: LandingHeroSlide[];
  items?: LandingSectionItem[];
  [key: string]: any;
}

export const defaultLandingSections: LandingSectionContent[] = [];

export { defaultAboutSections } from "./aboutContent";

export function mergeLandingSections(sections?: LandingSectionContent[]): LandingSectionContent[] {
  if (!sections?.length) return defaultLandingSections;
  const byKey = new Map(sections.map((section) => [section.key, section]));
  return defaultLandingSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (
      fallback.key === "join-mission" &&
      saved &&
      (saved.title === "Stand With Arogya Sewa" ||
        saved.description === "Support the mission as a donor, volunteer or partner." ||
        saved.items?.some((item) => item.image?.startsWith("/assets/about-optimized/")))
    ) {
      return fallback;
    }
    if (!saved) return fallback;
    const items = fallback.items?.length
      ? fallback.key === "navbar"
        ? [
            ...fallback.items.map((item) => ({
              ...item,
              ...(saved.items?.find((savedItem) => savedItem.href === item.href || savedItem.label === item.label) ?? {}),
            })),
            ...(saved.items?.filter(
              (savedItem) =>
                !fallback.items?.some((item) => item.href === savedItem.href || item.label === savedItem.label)
            ) ?? []),
          ]
        : [
            ...fallback.items.map((item, index) => ({ ...item, ...(saved.items?.[index] ?? {}) })),
            ...(saved.items?.slice(fallback.items.length) ?? []),
          ]
      : saved.items;
    const slides = fallback.slides?.length
      ? [
          ...fallback.slides.map((slide, index) => ({ ...slide, ...(saved.slides?.[index] ?? {}) })),
          ...(saved.slides?.slice(fallback.slides.length) ?? []),
        ]
      : saved.slides;
    return normalizeLandingSection({ ...fallback, ...saved, items, slides, enabled: saved.enabled !== false }, fallback);
  });
}

const genericTextLimits: Partial<Record<keyof LandingSectionContent, number>> = {
  name: 80,
  eyebrow: 70,
  title: 120,
  subtitle: 140,
  description: 260,
  quote: 260,
  legalNotice: 200,
  lowerTitle: 90,
  lowerDescription: 220,
  bottomStatement: 240,
  secondaryTitle: 80,
  secondaryDescription: 140,
  supportTitle: 160,
  supportDescription: 120,
  regionTitle: 90,
  regionDescription: 90,
  phoneLabel: 40,
  phoneNumber: 24,
  contactEmail: 100,
  contactAddress: 180,
  altPhoneNumber: 24,
  availabilityText: 120,
  actionTitle: 90,
  requestTitle: 90,
  requestDescription: 180,
  inputPlaceholder: 70,
  submitLabel: 40,
  submittedLabel: 40,
  successMessage: 180,
  initiativeLabel: 90,
  quickLinksTitle: 50,
  servicesTitle: 50,
  initiativesTitle: 50,
  contactTitle: 50,
  buttonLabel: 40,
  secondaryButtonLabel: 40,
  tertiaryButtonLabel: 40,
  sloganTitle: 90,
  immediateHelpTitle: 70,
  immediateHelpDescription: 120,
  supportNowLabel: 40,
  supportMissionTitle: 70,
  supportMissionDescription: 140,
};

const itemTextLimits: Partial<Record<keyof LandingSectionItem, number>> = {
  title: 120,
  label: 70,
  subtitle: 120,
  value: 50,
  description: 260,
};

const slideTextLimits: Partial<Record<keyof LandingHeroSlide, number>> = {
  title: 110,
  description: 160,
  alt: 180,
  buttonLabel: 40,
  secondaryButtonLabel: 40,
};

function withEllipsis(value: string) {
  const truncated = value
    .trimEnd()
    .replace(/[.\u2026]+$/g, "");
  return `${truncated}...`;
}

function truncateText(value: string | undefined, limit: number, fallback?: string) {
  if (!value) return value;
  const next = value.trim();
  const fallbackText = fallback?.trim();
  if (fallbackText && next.startsWith(fallbackText) && next.slice(fallbackText.length).trim()) {
    return withEllipsis(fallbackText);
  }
  if (value.length <= limit) return value;
  return withEllipsis(value.slice(0, Math.max(0, limit - 3)));
}

function limitFromFallback(value: string | undefined, generic: number) {
  return value ? Math.max(value.length, generic) : generic;
}

export function normalizeLandingSection(section: LandingSectionContent, fallback: LandingSectionContent): LandingSectionContent {
  return section;
}
