export interface LandingSectionItem {
  [key: string]: any;
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
  title?: string;
  tagline?: string;
  titlePrimary?: string;
  titleSecondary?: string;
  subtitle?: string;
  description?: string;
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

import { topbarSection } from "./landing/topbar";
import { navbarSection } from "./landing/navbar";
import { heroSection } from "./landing/hero";
import { trustedBySection } from "./landing/trustedBy";
import { whyArogyaTracksSection } from "./landing/whyArogyaTracks";
import { aboutConferenceSection } from "./landing/aboutConference";
import { statsBandSection } from "./landing/statsBand";
import { visionMissionSection } from "./landing/visionMission";
import { upcomingEventSection } from "./landing/upcomingEvent";
import { eventHighlightsSection } from "./landing/eventHighlights";
import { testimonialsSection } from "./landing/testimonials";
import { globalVoicesSection } from "./landing/globalVoices";
import { featuredSpeakersSection } from "./landing/featuredSpeakers";
import { footerSection } from "./landing/footer";

export const defaultLandingSections: LandingSectionContent[] = [
  topbarSection,
  navbarSection,
  heroSection,
  trustedBySection,
  whyArogyaTracksSection,
  aboutConferenceSection,
  statsBandSection,
  visionMissionSection,
  upcomingEventSection,
  eventHighlightsSection,
  testimonialsSection,
  globalVoicesSection,
  featuredSpeakersSection,
  footerSection,
];

export { defaultAboutSections } from "./aboutContent";

export function mergeLandingSections(sections?: LandingSectionContent[]): LandingSectionContent[] {
  if (!sections?.length) return defaultLandingSections;
  const byKey = new Map(sections.map((section) => [section.key, section]));
  return defaultLandingSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
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

export function normalizeLandingSection(section: LandingSectionContent, fallback: LandingSectionContent): LandingSectionContent {
  return section;
}
