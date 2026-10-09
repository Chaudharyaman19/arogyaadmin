"use client";

/* =========================================================
   SAVE A CMS PAGE (sections + SEO)
   Extracted from pages/[id]/edit/page.tsx
   Sections + SEO of every page persist through settingsApi
   (localStorage source of truth, best-effort backend sync).
========================================================= */

import { api } from "@/lib/api";
import { cmsPagesFromSettings } from "@/lib/cmsPages";
import { settingsApi } from "@/lib/settingsApi";
import { lazySwal } from "@/lib/toast";

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

    // Sync SEO data directly to backend database
    const pageKey = page.slug === "/" ? "home" : (page.slug ? page.slug.replace(/^\//, "") : "home");
    const isLocalHost = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const defaultSite = isLocalHost ? "http://localhost:3001" : "https://arogyabharat.org";
    const pPath = page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "");
    const defTag = `<link rel="canonical" href="${defaultSite}${pPath}" />`;

    const editorText = canonicalEditorRef.current?.innerText?.trim();
    const finalCanonicalTag = (editorText || form.canonicalTag || form.canonicalUrl || defTag).trim();
    const match = finalCanonicalTag.match(/href=["']([^"']+)["']/i);
    const finalCanonicalUrl = match ? match[1] : finalCanonicalTag.replace(/<[^>]*>/g, "").trim() || `${defaultSite}${pPath}`;

    try {
      await api.put(`/seo/${pageKey}`, {
        page: pageKey,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        metaKeywords: form.metaKeywords,
        canonicalUrl: finalCanonicalUrl,
        canonicalTag: finalCanonicalTag,
        openGraphTags: form.openGraphTags,
        schemaMarkup: form.schemaMarkup,
        ogTitle: form.ogTitle,
        ogDescription: form.ogDescription,
        ogImage: form.ogImage,
        robotsIndex: form.robotsIndex,
        robotsFollow: form.robotsFollow,
        isActive: form.isActive,
        updatedBy: "Admin User",
      });
    } catch (seoErr) {
      console.error("Failed to sync SEO to backend:", seoErr);
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

