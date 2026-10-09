"use client";

/* Blank item templates used when the admin clicks "Add ..." on a
   section list. Prefers a per-section template, otherwise clones
   the field shape of the list's first item. */

const BLANK_ITEMS: Record<string, Record<string, any>> = {
  "hero:slides": {
    subtitle: "NEW SLIDE SUBTITLE",
    buttonLabel: "Explore Sessions",
    buttonHref: "/register-now",
    secondaryButtonLabel: "Register Now",
    secondaryButtonHref: "/register-now",
    image: "",
    alt: "Arogya Banner",
  },
  "featured-speakers:items": {
    name: "",
    designation: "",
    image: "",
  },
};

export function blankItemFor(
  sectionKey: string,
  listKey: string,
  sample?: Record<string, any>,
): Record<string, any> {
  const template = BLANK_ITEMS[`${sectionKey}:${listKey}`];
  if (template) return { ...template };

  if (sample) {
    const blank: Record<string, any> = {};
    Object.keys(sample).forEach((key) => {
      if (key === "_id") return;
      const value = sample[key];
      blank[key] = typeof value === "boolean" ? false : "";
    });
    return blank;
  }

  return { title: "", description: "", image: "" };
}
