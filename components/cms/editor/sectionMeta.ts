/* Shared key/classification helpers used by the generic section field
   and section item editors in the CMS page editor. */


export const SECTION_SKIP_KEYS = new Set(["_id", "key", "slides", "items", "enabled", "name"]);
export const LONG_TEXT_KEY_PATTERN = /description|subtitle|quote|message|statement|notice/i;
export const IMAGE_KEY_PATTERN = /image|img|logo|photo|banner|picture|bg|avatar|thumbnail/i;
export const VIDEO_KEY_PATTERN = /video|youtube|embed|vimeo|clip|mediaUrl/i;

export function humanizeKey(key: string) {
  if (key === "href") return "Link (Href)";
  if (key === "buttonHref") return "Button Link (Href)";
  if (key === "secondaryButtonHref") return "Secondary Button Link (Href)";
  if (key === "mapEmbedUrl") return "Google Map Embed URL";
  if (key === "iconImg") return "Icon Image";
  if (key === "label2") return "Second Line Label";
  if (key === "targetDate") return "Countdown Target Date";
  if (key === "ctaQuestion") return "CTA Question";
  if (key === "ctaButtonLabel") return "CTA Button Label";
  if (key === "ctaHeading") return "CTA Band Heading";
  if (key === "ctaParagraph") return "CTA Band Paragraph";
  if (key === "cta1Label") return "CTA 1: Label";
  if (key === "cta1Href") return "CTA 1: Link (Href)";
  if (key === "cta2Label") return "CTA 2: Label";
  if (key === "cta2Href") return "CTA 2: Link (Href)";
  if (key === "cta3Label") return "CTA 3: Label";
  if (key === "cta3Href") return "CTA 3: Link (Href)";
  if (key === "focusTitle") return "Focus Areas Title";
  if (key === "bandHeading") return "Bottom Band Heading";
  if (key === "bandParagraph") return "Bottom Band Paragraph";
  if (key === "bandButtonLabel") return "Bottom Band Button Label";
  if (key === "dateText") return "Day Date";
  if (key === "dateInfo") return "Event Dates";
  if (key === "venueInfo") return "Venue";
  if (key === "delegatesInfo") return "Delegates";
  if (key === "countriesInfo") return "Countries";
  if (key === "dateBadge") return "Date Badge";
  if (key === "venueBadge") return "Venue Badge";
  if (key === "delegatesBadge") return "Delegates Badge";
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([a-zA-Z])([0-9])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());
}
