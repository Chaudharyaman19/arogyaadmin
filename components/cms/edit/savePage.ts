"use client";

/* =========================================================
   SAVE A CMS PAGE (sections + SEO + backend sync)
   Extracted from pages/[id]/edit/page.tsx
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
    if (page.configKey === "landingPage" || page.type === "home") {
      const heroSec = sectionsDraft.find((s) => s.key === "hero");
      if (heroSec && Array.isArray(heroSec.slides) && heroSec.slides.length > 0) {
        try {
          await api.put("/website/home/home-hero", { slides: heroSec.slides });
        } catch (err) {
          console.error("Failed to sync hero slides to backend:", err);
        }
      }

      const audienceSec = sectionsDraft.find((s) => s.key === "audience-strip");
      if (audienceSec) {
        try {
          await api.put("/website/home/audience-strip", {
            enabled: audienceSec.enabled !== false,
            items: audienceSec.items || [],
          });
        } catch (err) {
          console.error("Failed to sync audience strip to backend:", err);
        }
      }

      const introSec = sectionsDraft.find((s) => s.key === "introduction-section");
      if (introSec) {
        try {
          await api.put("/website/home/introduction-section", {
            enabled: introSec.enabled !== false,
            eyebrow: introSec.eyebrow,
            titlePrimary: introSec.titlePrimary,
            titleSecondary: introSec.titleSecondary,
            subtitle: introSec.subtitle,
            description: introSec.description,
            description2: introSec.description2,
            buttonLabel: introSec.buttonLabel,
            buttonHref: introSec.buttonHref,
            timerTitle: introSec.timerTitle,
            eventDate: introSec.eventDate,
            showTimer: introSec.showTimer !== false,
            image: introSec.image,
            imageAlt: introSec.imageAlt,
          });
        } catch (err) {
          console.error("Failed to sync introduction section to backend:", err);
        }
      }

      const globalSec = sectionsDraft.find((s) => s.key === "global-platform");
      if (globalSec) {
        try {
          await api.put("/website/home/global-platform", {
            enabled: globalSec.enabled !== false,
            eyebrow: globalSec.eyebrow,
            badge: globalSec.eyebrow,
            titlePrimary: globalSec.titlePrimary,
            titleSecondary: globalSec.titleSecondary,
            description: globalSec.description,
            keyPoint1: globalSec.keyPoint1,
            keyPoint2: globalSec.keyPoint2,
            keyPoint3: globalSec.keyPoint3,
            keyPoint4: globalSec.keyPoint4,
            keyPoint5: globalSec.keyPoint5,
            items: (globalSec.items || []).map((it: any) => ({
              title: it.title ?? "",
              description: it.description ?? it.desc ?? "",
              desc: it.description ?? it.desc ?? "",
            })),
          });
        } catch (err) {
          console.error("Failed to sync global platform to backend:", err);
        }
      }

      const whySec = sectionsDraft.find((s) => s.key === "why-participate");
      if (whySec) {
        try {
          await api.put("/website/home/why-participate", {
            enabled: whySec.enabled !== false,
            eyebrow: whySec.eyebrow,
            sectionTag: whySec.eyebrow,
            titlePrimary: whySec.titlePrimary,
            titleMain: whySec.titlePrimary,
            titleSecondary: whySec.titleSecondary,
            titleHighlight: whySec.titleSecondary,
            description: whySec.description,
            image: whySec.image,
            imageAlt: whySec.imageAlt,
            buttonLabel: whySec.buttonLabel,
            buttonHref: whySec.buttonHref,
            secondaryButtonLabel: whySec.secondaryButtonLabel,
            secondaryButtonHref: whySec.secondaryButtonHref,
            tertiaryButtonLabel: whySec.tertiaryButtonLabel,
            tertiaryButtonHref: whySec.tertiaryButtonHref,
            keyPoint1: whySec.keyPoint1,
            keyPoint2: whySec.keyPoint2,
            keyPoint3: whySec.keyPoint3,
            keyPoint4: whySec.keyPoint4,
            keyPoint5: whySec.keyPoint5,
            keyPoint6: whySec.keyPoint6,
            keyPoint7: whySec.keyPoint7,
            points: [
              whySec.keyPoint1,
              whySec.keyPoint2,
              whySec.keyPoint3,
              whySec.keyPoint4,
              whySec.keyPoint5,
              whySec.keyPoint6,
              whySec.keyPoint7,
            ].filter(Boolean),
          });
        } catch (err) {
          console.error("Failed to sync why participate to backend:", err);
        }
      }

      const confSec = sectionsDraft.find((s) => s.key === "conference-section");
      if (confSec) {
        try {
          await api.put("/website/home/conference-seminars", {
            enabled: confSec.enabled !== false,
            eyebrow: confSec.eyebrow,
            sectionTag: confSec.eyebrow,
            titlePrimary: confSec.titlePrimary,
            titleMain: confSec.titlePrimary,
            titleSecondary: confSec.titleSecondary,
            titleHighlight: confSec.titleSecondary,
            description: confSec.description,
            image: confSec.image,
            imageAlt: confSec.imageAlt,
            buttonLabel: confSec.buttonLabel,
            buttonHref: confSec.buttonHref,
            button: {
              text: confSec.buttonLabel,
              link: confSec.buttonHref,
            },
            keyPoint1: confSec.keyPoint1,
            keyPoint2: confSec.keyPoint2,
            keyPoint3: confSec.keyPoint3,
            checklist: [
              confSec.keyPoint1,
              confSec.keyPoint2,
              confSec.keyPoint3,
            ].filter(Boolean),
            stat1Title: confSec.stat1Title,
            stat1Sub: confSec.stat1Sub,
            stat2Title: confSec.stat2Title,
            stat2Sub: confSec.stat2Sub,
            stat3Title: confSec.stat3Title,
            stat3Sub: confSec.stat3Sub,
            stat4Title: confSec.stat4Title,
            stat4Sub: confSec.stat4Sub,
            stat5Title: confSec.stat5Title,
            stat5Sub: confSec.stat5Sub,
            eventInfo: [
              { icon: "Calendar", title: confSec.stat1Title, sub: confSec.stat1Sub },
              { icon: "MapPin", title: confSec.stat2Title, sub: confSec.stat2Sub },
              { icon: "Users", title: confSec.stat3Title, sub: confSec.stat3Sub },
              { icon: "Mic", title: confSec.stat4Title, sub: confSec.stat4Sub },
              { icon: "BookOpen", title: confSec.stat5Title, sub: confSec.stat5Sub },
            ],
          });
        } catch (err) {
          console.error("Failed to sync conference seminars to backend:", err);
        }
      }

      const expoSec = sectionsDraft.find((s) => s.key === "expo-categories");
      if (expoSec) {
        try {
          const cleanItems = Array.isArray(expoSec.items)
            ? expoSec.items.map((it: any) => ({
                title: it.title || "",
                description: it.description || "",
                desc: it.description || "",
                image: it.image || "",
                href: it.href || "/exhibition-categories",
                link: it.href || "/exhibition-categories",
                exploreText: it.exploreText || "Explore",
              }))
            : [];

          await api.put("/website/home/expo-categories", {
            enabled: expoSec.enabled !== false,
            sectionTag: expoSec.sectionTag,
            titleMain: expoSec.titleMain,
            titleHighlight: expoSec.titleHighlight,
            descriptionPrefix: expoSec.descriptionPrefix,
            description: expoSec.description,
            exploreText: expoSec.exploreText,
            buttonText: expoSec.buttonText,
            buttonHref: expoSec.buttonHref,
            buttonLink: expoSec.buttonHref,
            items: cleanItems,
            categories: cleanItems,
          });
        } catch (err) {
          console.error("Failed to sync expo categories to backend:", err);
        }
      }

      const beyondSec = sectionsDraft.find((s) => s.key === "beyond-exhibition");
      if (beyondSec) {
        try {
          const cleanItems = Array.isArray(beyondSec.items)
            ? beyondSec.items.map((it: any) => ({
                title: it.title || "",
                description: it.description || it.subtitle || "",
                subtitle: it.description || it.subtitle || "",
                icon: it.icon || "Users",
              }))
            : [];

          await api.put("/website/home/beyond-exhibition", {
            enabled: beyondSec.enabled !== false,
            sectionTag: beyondSec.sectionTag,
            titleMain: beyondSec.titleMain,
            titleHighlight: beyondSec.titleHighlight,
            description: beyondSec.description,
            image: beyondSec.image,
            imageAlt: beyondSec.imageAlt,
            items: cleanItems,
            extras: cleanItems,
          });
        } catch (err) {
          console.error("Failed to sync beyond exhibition to backend:", err);
        }
      }

      const attendSec = sectionsDraft.find((s) => s.key === "sponsors-attend");
      if (attendSec) {
        try {
          await api.put("/website/home/sponsors-attend", {
            enabled: attendSec.enabled !== false,
            titlePrefix: attendSec.titlePrefix,
            titleHighlight: attendSec.titleHighlight,
            description: attendSec.description,
            image: attendSec.image,
            imageAlt: attendSec.imageAlt,
            buttonLabel: attendSec.buttonLabel,
            buttonHref: attendSec.buttonHref,

            feature1Title: attendSec.feature1Title,
            feature1Desc: attendSec.feature1Desc,
            feature2Title: attendSec.feature2Title,
            feature2Desc: attendSec.feature2Desc,
            feature3Title: attendSec.feature3Title,
            feature3Desc: attendSec.feature3Desc,
            feature4Title: attendSec.feature4Title,
            feature4Desc: attendSec.feature4Desc,
            feature5Title: attendSec.feature5Title,
            feature5Desc: attendSec.feature5Desc,
            feature6Title: attendSec.feature6Title,
            feature6Desc: attendSec.feature6Desc,

            keyPoint1: attendSec.keyPoint1,
            keyPoint2: attendSec.keyPoint2,
            keyPoint3: attendSec.keyPoint3,
            keyPoint4: attendSec.keyPoint4,
            keyPoint5: attendSec.keyPoint5,
            keyPoint6: attendSec.keyPoint6,
            keyPoint7: attendSec.keyPoint7,
            keyPoint8: attendSec.keyPoint8,
            keyPoint9: attendSec.keyPoint9,
            keyPoint10: attendSec.keyPoint10,
          });
        } catch (err) {
          console.error("Failed to sync sponsors and attend to backend:", err);
        }
      }
    }

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

