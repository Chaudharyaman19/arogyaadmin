"use client";

/* =========================================================
   SAVE A CMS PAGE (sections + SEO)
   Extracted from pages/[id]/edit/page.tsx
   Sections + SEO of every page persist through settingsApi
   (localStorage source of truth, best-effort backend sync).
========================================================= */

import { ApiRequestError } from "@/lib/api";
import {
  canonicalTagFor,
  canonicalUrlFor,
  canonicalUrlOf,
  currentSeoEnv,
  isValidSchemaMarkup,
  pageSeoApi,
  pagePathOf,
} from "@/lib/pageSeoApi";
import { cmsPagesFromSettings } from "@/lib/cmsPages";
import { settingsApi } from "@/lib/settingsApi";
import { lazySwal } from "@/lib/toast";

/** Same limits as the backend — returns the first problem, or "" */
function validateSeoForm(form: any, canonicalText: string): string {
  if ((form.metaTitle || "").trim().length > 65) return "Meta title must be 65 characters or fewer.";
  if ((form.metaDescription || "").trim().length > 155) return "Meta description must be 155 characters or fewer.";
  const canonical = canonicalUrlOf(canonicalText);
  if (canonical && !/^https?:\/\/\S+$/.test(canonical)) return "Canonical must be a full URL (https://...) or a <link rel=\"canonical\" href=\"...\"> tag.";
  if (!isValidSchemaMarkup(form.schemaMarkup || "")) return 'Schema markup is not valid JSON-LD — paste the JSON as it is, or inside <script type="application/ld+json"> tags with nothing outside them, and check the brackets, commas and quotes.';
  return "";
}

export async function saveCmsPage(args: {
  settings: Record<string, any> | null;
  page: any;
  sectionsDraft: Array<Record<string, any>>;
  form: any;
  canonicalEditorRef: React.RefObject<HTMLDivElement | null>;
  setSaving: (v: boolean) => void;
  setSettings: (v: Record<string, any>) => void;
  setPages: (v: Array<any>) => void;
}): Promise<void> {
  const {
    settings,
    page,
    sectionsDraft,
    form,
    canonicalEditorRef,
    setSaving,
    setSettings,
    setPages,
  } = args;
  if (!settings || !page.configKey) return;

  const seoError = validateSeoForm(form, canonicalEditorRef.current?.innerText?.trim() || form.canonicalTag || "");
  if (seoError) {
    lazySwal.fire({ title: "Check the SEO Information", text: seoError, icon: "warning" });
    return;
  }

  setSaving(true);
  try {
    const current = settings[page.configKey] ?? {};
    const updated = await settingsApi.update({
      [page.configKey]: {
        ...current,
        sections: sectionsDraft.length ? sectionsDraft : current.sections,
        seo: {
          ...current.seo,
          metaTitle: form.metaTitle,
          metaDescription: form.metaDescription,
          metaKeywords: form.metaKeywords,
          canonicalUrl: form.canonicalUrl || form.canonicalTag,
          canonicalTag: form.canonicalTag || form.canonicalUrl,
          openGraphTags: form.openGraphTags,
          ogTitle: form.ogTitle,
          ogDescription: form.ogDescription,
          ogImage: form.ogImage,
          h1Tag: form.h1Tag,
          breadcrumbName: form.breadcrumbName,
          schemaMarkup: form.schemaMarkup,
          robotsIndex: form.robotsIndex,
          robotsFollow: form.robotsFollow,
        },
      },
    } as any);

    // SEO goes straight to backend-arogya — the website reads it from there
    const editorText = canonicalEditorRef.current?.innerText?.trim();
    const canonical = canonicalUrlOf(editorText || form.canonicalTag || form.canonicalUrl || "") || canonicalUrlFor(page.slug, currentSeoEnv());
    try {
      await pageSeoApi.save({
        path: pagePathOf(page.slug),
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        metaKeywords: form.metaKeywords,
        canonicalTag: canonicalTagFor(canonical),
        openGraphTags: form.openGraphTags,
        schemaMarkup: form.schemaMarkup,
        ogImage: form.ogImage,
        robotsIndex: form.robotsIndex !== false,
        robotsFollow: form.robotsFollow !== false,
        isActive: form.isActive !== false,
      });
    } catch (seoErr) {
      lazySwal.fire({
        title: "SEO Not Saved",
        text: seoErr instanceof ApiRequestError ? seoErr.message : "Could not save the SEO information. Please try again.",
        icon: "error",
      });
      return;
    }

    const raw = updated as unknown as Record<string, any>;
    setSettings(raw);
    setPages(cmsPagesFromSettings(raw));
    lazySwal.fire({
      title: "Page Updated",
      text: "Your changes have been saved successfully.",
      icon: "success",
      confirmButtonColor: "#218DAE",
      timer: 2000,
    });
  } finally {
    setSaving(false);
  }
}

