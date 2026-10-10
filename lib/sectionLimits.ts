/* =========================================================
   SECTION CHARACTER LIMITS
   Per-section / per-field max lengths derived from what the
   Arogya website UI can display without breaking its layout
   (whitespace-nowrap rows, line-clamp boxes, fixed-width cells).
   Enforced by SectionFieldsEditor + SectionItemsEditor.
========================================================= */

type FieldLimits = Record<string, number>;

const DEFAULT_SHORT_LIMIT = 120;
const DEFAULT_LONG_LIMIT = 450;

/* ---------- section-level scalar fields ---------- */
export const SECTION_FIELD_LIMITS: Record<string, FieldLimits> = {
  topbar: {
    title: 40,
    marqueeText: 200,
    phoneNumber: 24,
    contactEmail: 80,
  },
  navbar: {
    title: 40,
    buttonLabel: 30,
    buttonHref: 160,
    secondaryButtonLabel: 30,
    secondaryButtonHref: 160,
  },
  hero: {
    editionTag: 30,
    eventDates: 45,
    venue: 70,
  },
  "trusted-by": {
    eyebrow: 25,
  },
  "why-arogya-tracks": {
    leftHeading: 30,
    rightHeading: 30,
  },
  "about-conference": {
    eyebrow: 15,
    heading: 55,
    subtitle: 80,
    paragraph1: 260,
    paragraph2: 300,
    dateBadge: 40,
    venueBadge: 60,
    delegatesBadge: 70,
  },
  "vision-mission": {
    visionHeading: 20,
    visionText: 170,
    missionHeading: 20,
    chairmanHeading: 30,
    chairmanMessage: 700,
    founderName: 40,
    chairmanName: 40,
    chairmanDesignation: 40,
  },
  "upcoming-event": {
    eyebrow: 30,
    title: 45,
    subtitle: 95,
    description: 300,
    dateInfo: 45,
    venueInfo: 50,
    delegatesInfo: 30,
    countriesInfo: 30,
    countdownHeading: 45,
    attendHeading: 45,
    ctaLabel: 30,
    ctaHref: 160,
  },
  "event-highlights": {
    heading: 30,
    glanceHeading: 45,
    whoHeading: 30,
    viewAgendaLabel: 30,
    viewAgendaHref: 160,
    detailsHeading: 30,
    datesValue: 45,
    venueValue: 65,
    formatValue: 70,
    organizerValue: 65,
    mapEmbedUrl: 600,
    ctaHeading: 70,
    ctaParagraph: 140,
    cta1Label: 30,
    cta1Href: 160,
    cta2Label: 30,
    cta2Href: 160,
    cta3Label: 30,
    cta3Href: 160,
  },
  testimonials: {
    heading: 30,
    mainTitle: 60,
    shortDescription: 85,
    videoHeading: 30,
    videoShortDescription: 60,
    bandHeading: 60,
    bandParagraph: 95,
    bandButtonLabel: 30,
  },
  "global-voices": {
    heading: 25,
    subheading: 35,
    description: 110,
    ctaLabel: 30,
    ctaHref: 160,
  },
  "featured-speakers": {
    heading: 30,
    buttonLabel: 30,
    buttonHref: 160,
  },
  footer: {
    phoneNumber: 24,
    conferenceHelpline: 24,
    contactEmail: 100,
    contactAddress: 180,
    websiteUrl: 80,
  },
  "about-hero": {
    eyebrow: 15,
    headline: 80,
    paragraph: 320,
  },
  "about-founder": {
    heading: 30,
    founderName: 40,
    designation: 50,
    description: 450,
    messageHeading: 30,
    message: 700,
    imageAlt: 60,
  },
  "about-namo-gange": {
    heading: 35,
    subheading: 70,
    paragraph: 520,
    visionTitle: 20,
    visionText: 70,
    missionTitle: 20,
    missionText: 260,
  },
  "about-initiatives": {
    heading: 70,
    focusTitle: 40,
  },
  "about-faq": {
    subheading: 25,
    heading: 30,
    highlightText: 25,
    description: 140,
    ctaQuestion: 95,
    ctaButtonLabel: 30,
    ctaHref: 160,
  },
  "our-impact": {
    bandTitle: 30,
  },
  "paper-hero": {
    eyebrow: 45,
    title: 50,
    badgeText: 70,
  },
  "paper-important-dates": {
    heading: 30,
    whyHeading: 20,
  },
  "paper-topics": {
    heading: 30,
  },
  "paper-guidelines": {
    guidelinesHeading: 35,
    submissionHeading: 30,
    downloadLabel: 30,
    downloadHref: 160,
    submitLabel: 30,
    submitHref: 160,
  },
  "paper-awards": {
    heading: 30,
  },
  "paper-why-choose": {
    heading: 75,
    footnote: 130,
    ctaText: 95,
    ctaHeading: 60,
  },
  "paper-need-help": {
    heading: 20,
    description: 120,
    contactEmail: 100,
    phoneNumber: 24,
  },
};

/* ---------- repeatable item fields (all lists of a section) ---------- */
export const SECTION_ITEM_LIMITS: Record<string, FieldLimits> = {
  hero: {
    subtitle: 170,
    buttonLabel: 30,
    buttonHref: 160,
    secondaryButtonLabel: 30,
    secondaryButtonHref: 160,
    alt: 80,
  },
  "trusted-by": {
    label: 55,
  },
  "why-arogya-tracks": {
    title: 30,
    text: 130,
    label: 30,
  },
  "about-conference": {
    text: 70,
  },
  "stats-band": {
    number: 10,
    label: 30,
  },
  "vision-mission": {
    heading: 20,
    body: 130,
  },
  "upcoming-event": {
    text: 70,
  },
  "event-highlights": {
    title: 45,
    desc: 120,
    badge: 10,
    dateText: 15,
    text: 45,
  },
  testimonials: {
    number: 12,
    label: 25,
  },
  "global-voices": {
    number: 12,
    label: 25,
    title: 30,
    text: 85,
  },
  "featured-speakers": {
    name: 50,
    designation: 60,
  },
  "about-hero": {
    value: 8,
    suffix: 5,
    label: 22,
  },
  "about-founder": {},
  "about-namo-gange": {
    text: 75,
  },
  "about-initiatives": {
    title: 45,
    desc: 200,
    text: 45,
  },
  "about-faq": {
    question: 150,
    answer: 600,
  },
  "our-impact": {
    value: 12,
    suffix: 5,
    label: 45,
  },
  "paper-important-dates": {
    label: 65,
    date: 25,
  },
  "paper-topics": {
    title: 30,
    desc: 90,
  },
  "paper-guidelines": {
    text: 95,
    num: 3,
    title: 12,
    desc: 95,
  },
  "paper-awards": {
    title: 75,
  },
  "paper-why-choose": {
    title: 32,
  },
};

/* ---------- fields that must render as a multi-line textarea ---------- */
const MULTILINE_FIELDS: Record<string, string[]> = {
  hero: [],
  "about-conference": ["heading", "dateBadge", "venueBadge", "delegatesBadge"],
  "vision-mission": ["visionText", "chairmanMessage"],
  "upcoming-event": ["description", "dateInfo", "venueInfo", "delegatesInfo", "countriesInfo"],
  "event-highlights": ["mapEmbedUrl"],
  "about-hero": ["headline", "paragraph"],
  "about-namo-gange": ["paragraph", "missionText"],
  "about-initiatives": ["focusTitle"],
  "paper-hero": ["title", "description", "badgeText"],
  "paper-why-choose": ["heading", "footnote", "ctaText", "ctaHeading"],
  "paper-need-help": ["description"],
};

const MULTILINE_ITEM_FIELDS: Record<string, string[]> = {
  "vision-mission": ["body"],
  "upcoming-event": ["text"],
  "event-highlights": ["desc", "text"],
  "global-voices": ["text"],
  "about-initiatives": ["desc", "text"],
  "about-faq": ["answer"],
  "our-impact": ["label"],
  "trusted-by": ["label"],
  "paper-topics": ["desc"],
  "paper-guidelines": ["text", "desc"],
  "paper-why-choose": ["title"],
  "paper-important-dates": ["label"],
  "paper-awards": ["title"],
};

export function isMultilineField(sectionKey: string | undefined, fieldKey: string): boolean {
  if (!sectionKey) return false;
  return (MULTILINE_FIELDS[sectionKey] ?? []).includes(fieldKey);
}

export function isMultilineItemField(sectionKey: string | undefined, fieldKey: string): boolean {
  if (!sectionKey) return false;
  return (MULTILINE_ITEM_FIELDS[sectionKey] ?? []).includes(fieldKey);
}

export function getFieldLimit(sectionKey: string | undefined, fieldKey: string, isLong: boolean): number {
  const explicit = sectionKey ? SECTION_FIELD_LIMITS[sectionKey]?.[fieldKey] : undefined;
  if (explicit) return explicit;
  return isLong ? DEFAULT_LONG_LIMIT : DEFAULT_SHORT_LIMIT;
}

export function getItemFieldLimit(
  sectionKey: string | undefined,
  fieldKey: string,
  isLong: boolean,
): number {
  const explicit = sectionKey ? SECTION_ITEM_LIMITS[sectionKey]?.[fieldKey] : undefined;
  if (explicit) return explicit;
  return isLong ? DEFAULT_LONG_LIMIT : DEFAULT_SHORT_LIMIT;
}
