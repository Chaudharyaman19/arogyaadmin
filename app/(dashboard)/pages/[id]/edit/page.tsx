"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createHomeHero, updateHomeHero, fetchHomeHeros } from "@/store/slices/home/homeHeroSlice";
import { api } from "@/lib/api";

import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  AlignLeft,
  ArrowLeft,
  Bold,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  Copy,
  Edit,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FormInput,
  Globe,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Quote,
  Save,
  Sparkles,
  Strikethrough,
  Table2,
  Trash2,
  RotateCcw,
  Underline,
  Upload,
  UserRound,
  Video,
  X,
} from "lucide-react";
import { uploadApi } from "@/lib/uploadApi";

import {
  cmsPages,
  cmsPagesFromSettings,
  findCmsPageByRouteKey,
  getCmsPageRouteKey,
} from "@/lib/cmsPages";
import { settingsApi } from "@/lib/settingsApi";
import typography from "../../PagesTypography.module.css";
import { lazySwal } from "@/lib/toast";

import { FieldLabel, TextInput, SelectField, SectionTitle, Toggle, EditorToolbar } from "@/components/cms/editor/FormPrimitives";
import { SectionFieldsEditor } from "@/components/cms/editor/SectionFieldsEditor";
import { SectionItemsEditor } from "@/components/cms/editor/SectionItemsEditor";
import { SeoScoreCircle, SeoRow } from "@/components/cms/editor/SeoFields";
import { buildSectionsDraft, getDefaultSectionsForPage, hydrateHomeSections, loadPageSeo } from "@/components/cms/edit/sectionDefaults";
import { saveCmsPage } from "@/components/cms/edit/savePage";
import { CmsEditProvider, type CmsEditContextValue } from "@/components/cms/edit/CmsEditContext";
import type { FormState, Status, Visibility } from "@/components/cms/edit/types";
import { BasicInfoSection } from "@/components/cms/edit/sections/BasicInfoSection";
import { PageSectionsSection } from "@/components/cms/edit/sections/PageSectionsSection";
import { SeoSettingsSection } from "@/components/cms/edit/sections/SeoSettingsSection";
import { PageSettingsSection } from "@/components/cms/edit/sections/PageSettingsSection";
import { EditorRail } from "@/components/cms/edit/sections/EditorRail";

/* =========================================================
   FEATURED IMAGE
========================================================= */

const FEATURED_IMAGE =
  "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788165233/arogya-sewa/assets/km.jpg";

/* =========================================================
   TYPES (moved to components/cms/edit/types.ts)
========================================================= */

export default function CmsEditPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const router =
    useRouter();

  const dispatch = useAppDispatch();
  const { data: homeHeros } = useAppSelector((state) => state.homeHero);

  useEffect(() => {
    dispatch(fetchHomeHeros());
  }, [dispatch]);

  const handleHeroApi = async (action: 'add' | 'edit', section: any) => {
    const form = new FormData();
    form.append("tagline", section.tagline || "");
    form.append("titlePrimary", section.titlePrimary || "");
    form.append("titleSecondary", section.titleSecondary || "");
    form.append("subtitle", section.subtitle || "");
    form.append("description", section.description || "");
    form.append("date", section.date || "");
    form.append("location", section.location || "");
    form.append("button1Name", section.buttonLabel || "");
    form.append("button1Link", section.buttonHref || "");
    form.append("button2Name", section.secondaryButtonLabel || "");
    form.append("button2Link", section.secondaryButtonHref || "");

    try {
      if (action === 'add') {
        await dispatch(createHomeHero(form)).unwrap();
        lazySwal.fire({ title: "Success", text: "Added to Home Hero API", icon: "success", timer: 1500 });
      } else {
        const id = homeHeros?.[0]?._id;
        if (id) {
          await dispatch(updateHomeHero({ id, formData: form })).unwrap();
          lazySwal.fire({ title: "Success", text: "Updated Home Hero API", icon: "success", timer: 1500 });
        } else {
          lazySwal.fire({ title: "Error", text: "No existing hero found to edit. Click Add instead.", icon: "error" });
        }
      }
      dispatch(fetchHomeHeros());
    } catch (err: any) {
      lazySwal.fire({ title: "Error", text: err || "API failed", icon: "error" });
    }
  };

  const [pages, setPages] = useState(cmsPages);
  const [settings, setSettings] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);

  const fallbackPage = useMemo<any>(() => ({
    id: 1,
    configKey: "customPage",
    title: "Custom Page",
    slug: "/",
    author: "Admin User",
    status: "Draft",
    seoScore: 0,
    rating: "Needs Work",
    updated: "Just now",
    updatedBy: "Admin User",
    type: "page",
  }), []);

  const page = findCmsPageByRouteKey(pages, params.id) ?? pages[0] ?? cmsPages[0] ?? fallbackPage;

  useEffect(() => {
    settingsApi.get().then((value) => {
      const raw = value as unknown as Record<string, any>;
      setSettings(raw);
      setPages(cmsPagesFromSettings(raw));
    }).catch(() => undefined);
  }, []);

  const pageConfig = page?.configKey && settings ? settings[page.configKey] : undefined;

  const initialForm =
    useMemo<FormState>(
      () => ({
        pageTitle:
          page.title,

        slug:
          page.slug === "/"
            ? ""
            : page.slug.replace(
              /^\//,
              "",
            ),

        template:
          page.type === "home"
            ? "Homepage"
            : page.configKey === "aboutPage"
              ? "About Page"
              : page.configKey === "advisoryPage"
                ? "Advisory Board"
                : page.configKey === "blogPage"
                  ? "Blogs & News"
                  : page.configKey === "whyVisitPage"
                    ? "Why Visit"
                    : page.configKey === "whyExhibitPage"
                      ? "Why Exhibit"
                      : page.configKey === "msmePage"
                        ? "MSME PMS Scheme"
                        : page.configKey === "exhibitorsPage"
                          ? "Exhibitors List"
                          : page.configKey === "buyerSellerMeetPage"
                            ? "Buyer-Seller Meet"
                            : page.configKey === "galleryPage"
                              ? "Glimpses & Gallery"
                              : page.configKey === "awardsPage"
                                ? "Excellence Awards"
                                : page.configKey === "sponsorshipPage"
                                  ? "Sponsorship Opportunities"
                                  : page.configKey === "epromotionPage"
                                    ? "E-Promotion Web"
                                    : page.configKey === "partnershipPage"
                                      ? "Partnership / Collaboration"
                                      : page.configKey === "servicesPage"
                                        ? "Our Services"
                                        : page.configKey === "contactPage"
                                          ? "Contact Us"
                                          : "Standard Page",

        parent:
          page.type === "home"
            ? "— No Parent (Top Level) —"
            : "Home",

        metaTitle:
          page.type === "home"
            ? "Arogya Expo – International Trade Fair on Organic Products"
            : `${page.title} – Arogya Expo`,

        metaDescription: page.seo?.metaDescription ?? "",
        metaKeywords: page.seo?.metaKeywords ?? "",
        canonicalUrl:
          page.seo?.canonicalUrl ||
          (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
            ? `http://localhost:3001${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`
            : `https://arogyabharat.org${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`),
        canonicalTag:
          page.seo?.canonicalTag ||
          `<link rel="canonical" href="${
            page.seo?.canonicalUrl ||
            (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
              ? `http://localhost:3001${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`
              : `https://arogyabharat.org${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`)
          }" />`,
        openGraphTags: page.seo?.openGraphTags ?? "",
        ogTitle: page.seo?.ogTitle ?? "",
        ogDescription: page.seo?.ogDescription ?? "",
        ogImage: page.seo?.ogImage ?? "",
        h1Tag: page.seo?.h1Tag ?? "",
        breadcrumbName: page.seo?.breadcrumbName ?? "",
        schemaMarkup: page.seo?.schemaMarkup ?? "",
        robotsIndex: page.seo?.robotsIndex ?? true,
        robotsFollow: page.seo?.robotsFollow ?? true,
        isActive: page.seo?.isActive ?? (page.status === "Published"),

        status:
          page.status,

        visibility:
          "Public",

        author:
          page.author,

        showInNavigation:
          true,

        menuOrder:
          page.type === "home"
            ? "1"
            : "4",
      }),
      [page],
    );

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      initialForm,
    );

  useEffect(() => {
    setForm({
      pageTitle: page.title,
      slug: page.slug === "/" ? "" : page.slug.replace(/^\//, ""),
      template:
        page.type === "home"
          ? "Homepage"
          : page.configKey === "aboutPage"
            ? "About Page"
            : page.configKey === "advisoryPage"
              ? "Advisory Board"
              : page.configKey === "blogPage"
                ? "Blogs & News"
                : page.configKey === "whyVisitPage"
                  ? "Why Visit"
                  : page.configKey === "whyExhibitPage"
                    ? "Why Exhibit"
                    : page.configKey === "msmePage"
                      ? "MSME PMS Scheme"
                      : page.configKey === "exhibitorsPage"
                        ? "Exhibitors List"
                        : page.configKey === "buyerSellerMeetPage"
                          ? "Buyer-Seller Meet"
                          : page.configKey === "galleryPage"
                            ? "Glimpses & Gallery"
                            : page.configKey === "awardsPage"
                              ? "Excellence Awards"
                              : page.configKey === "sponsorshipPage"
                                ? "Sponsorship Opportunities"
                                : page.configKey === "epromotionPage"
                                  ? "E-Promotion Web"
                                  : page.configKey === "partnershipPage"
                                    ? "Partnership / Collaboration"
                                    : page.configKey === "servicesPage"
                                      ? "Our Services"
                                      : page.configKey === "contactPage"
                                        ? "Contact Us"
                                        : "Standard Page",
      parent: page.type === "home" ? "— No Parent (Top Level) —" : "Home",
      metaTitle: page.seo?.metaTitle ?? "",
      metaDescription: page.seo?.metaDescription ?? "",
      metaKeywords: page.seo?.metaKeywords ?? "",
      canonicalUrl:
        page.seo?.canonicalUrl ||
        (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
          ? `http://localhost:3001${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`
          : `https://arogyabharat.org${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`),
      canonicalTag:
        page.seo?.canonicalTag ||
        `<link rel="canonical" href="${
          page.seo?.canonicalUrl ||
          (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
            ? `http://localhost:3001${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`
            : `https://arogyabharat.org${page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "")}`)
        }" />`,
      openGraphTags: page.seo?.openGraphTags ?? "",
      ogTitle: page.seo?.ogTitle ?? "",
      ogDescription: page.seo?.ogDescription ?? "",
      ogImage: page.seo?.ogImage ?? "",
      h1Tag: page.seo?.h1Tag ?? "",
      breadcrumbName: page.seo?.breadcrumbName ?? "",
      schemaMarkup: page.seo?.schemaMarkup ?? "",
      robotsIndex: page.seo?.robotsIndex ?? true,
      robotsFollow: page.seo?.robotsFollow ?? true,
      isActive: page.seo?.isActive ?? (page.status === "Published"),
      status: page.status,
      visibility: "Public",
      author: page.author,
      showInNavigation: true,
      menuOrder: page.type === "home" ? "1" : "4",
    });
  }, [page]);

  const [sectionsDraft, setSectionsDraft] = useState<Array<Record<string, any>>>([]);
  const [openSectionIndices, setOpenSectionIndices] = useState<Set<number>>(new Set());

  const canonicalEditorRef = useRef<HTMLDivElement | null>(null);
  const [ogUploading, setOgUploading] = useState(false);
  const [ogPreview, setOgPreview] = useState<string | null>(null);

  useEffect(() => {
    if (canonicalEditorRef.current) {
      const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      const defaultSiteUrl = isLocal ? "http://localhost:3001" : "https://arogyabharat.org";
      const pagePath = page.slug === "/" ? "" : (page.slug ? (page.slug.startsWith("/") ? page.slug : `/${page.slug}`) : "");
      const defaultTag = `<link rel="canonical" href="${defaultSiteUrl}${pagePath}" />`;

      const target = (form.canonicalTag || form.canonicalUrl || defaultTag).trim();
      const currentText = canonicalEditorRef.current.innerText.trim();
      if (target && currentText !== target && !canonicalEditorRef.current.contains(document.activeElement)) {
        canonicalEditorRef.current.innerText = target;
      }
    }
  }, [form.canonicalTag, form.canonicalUrl, page.slug]);

  const execCommand = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value ?? undefined);
    if (canonicalEditorRef.current) {
      canonicalEditorRef.current.focus();
      const val = (canonicalEditorRef.current.innerText || "").trim();
      updateField("canonicalTag", val);
      const match = val.match(/href=["']([^"']+)["']/i);
      const cleanUrl = match ? match[1] : val.replace(/<[^>]*>/g, "").trim();
      updateField("canonicalUrl", cleanUrl);
    }
  };

  const handleCanonicalInput = () => {
    if (canonicalEditorRef.current) {
      const val = (canonicalEditorRef.current.innerText || "").trim();
      updateField("canonicalTag", val);
      const match = val.match(/href=["']([^"']+)["']/i);
      const cleanUrl = match ? match[1] : val.replace(/<[^>]*>/g, "").trim();
      updateField("canonicalUrl", cleanUrl);
    }
  };

  const handleCanonicalPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    if (canonicalEditorRef.current) {
      const val = (canonicalEditorRef.current.innerText || "").trim();
      updateField("canonicalTag", val);
      const match = val.match(/href=["']([^"']+)["']/i);
      const cleanUrl = match ? match[1] : val.replace(/<[^>]*>/g, "").trim();
      updateField("canonicalUrl", cleanUrl);
    }
  };

  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOgPreview(URL.createObjectURL(file));
    setOgUploading(true);
    try {
      const res: any = await uploadApi.file(file, "bharat-organic/seo");
      const url = res?.url || res?.data?.url;
      if (url) {
        updateField("ogImage", url);
      }
    } catch (err) {
      console.error("Failed to upload OG image", err);
    } finally {
      setOgUploading(false);
    }
  };

  const removeOgImage = () => {
    updateField("ogImage", "");
    setOgPreview(null);
  };

  const autoGenerateSeo = async (envType: "local" | "live") => {
    const pageKey = page.slug === "/" ? "home" : (page.slug ? page.slug.replace(/^\//, "") : "home");
    try {
      const res: any = await api.post("/seo/generate", {
        page: pageKey,
        envType,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
      });
      const gen = res?.data?.data || res?.data || res;
      if (gen) {
        updateField("canonicalUrl", gen.canonicalUrl || "");
        updateField("canonicalTag", gen.canonicalTag || "");
        updateField("openGraphTags", gen.openGraphTags || "");
        updateField("schemaMarkup", gen.schemaMarkup || "");
        if (!form.metaTitle && gen.metaTitle) updateField("metaTitle", gen.metaTitle);
        if (!form.metaDescription && gen.metaDescription) updateField("metaDescription", gen.metaDescription);
        if (!form.metaKeywords && gen.metaKeywords) updateField("metaKeywords", gen.metaKeywords);
        if (!form.ogImage && gen.ogImage) updateField("ogImage", gen.ogImage);

        if (canonicalEditorRef.current) {
          canonicalEditorRef.current.innerText = gen.canonicalTag || gen.canonicalUrl || "";
        }

        lazySwal.fire({
          title: `Auto-Generated for ${envType.toUpperCase()}`,
          text: `Canonical, OG Tags & Schema markup generated for ${
            envType === "local" ? "http://localhost:3001" : "https://arogyabharat.org"
          }. You can edit any field manually anytime!`,
          icon: "success",
          timer: 2500,
          confirmButtonColor: "#134698",
        });
      }
    } catch (err: any) {
      lazySwal.fire({
        title: "Generation Failed",
        text: err?.message || "Failed to auto-generate SEO tags",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    const finalSections = buildSectionsDraft(page, settings);
    setSectionsDraft(finalSections.map((section) => ({ ...section })));
    setOpenSectionIndices(new Set());
    hydrateHomeSections(page, setSectionsDraft);
    loadPageSeo(page, setForm, canonicalEditorRef);
  }, [settings, page]);

  const toggleSectionAccordion = (index: number) => {
    setOpenSectionIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const updateSectionField = (sectionIndex: number, key: string, value: unknown) => {
    setSectionsDraft((previous) =>
      previous.map((section, index) =>
        index === sectionIndex ? { ...section, [key]: value } : section,
      ),
    );
  };

  const updateSectionItem = (sectionIndex: number, itemIndex: number, key: string, value: unknown) => {
    setSectionsDraft((previous) =>
      previous.map((section, index) => {
        if (index !== sectionIndex) return section;
        const items = [...(section.items ?? [])];
        items[itemIndex] = { ...items[itemIndex], [key]: value };
        return { ...section, items };
      }),
    );
  };

  const addSectionItem = (sectionIndex: number) => {
    setSectionsDraft((previous) =>
      previous.map((section, index) => {
        if (index !== sectionIndex) return section;
        const items = [...(section.items ?? [])];
        if (section.key === "audience-strip") {
          const blankAudience = {
            title: "NEW AUDIENCE",
            subtitle: "TARGET GROUP",
            icon: "GraduationCap",
            color: "#facc15",
            label: "NEW AUDIENCE TARGET GROUP",
          };
          return { ...section, items: [...items, blankAudience] };
        }
        if (section.key === "expo-categories") {
          const blankCategory = {
            title: "New Exhibition Sector",
            description: "Enter sector description...",
            image: "",
            href: "/exhibition-categories",
            exploreText: "Explore",
          };
          return { ...section, items: [...items, blankCategory] };
        }
        if (section.key === "beyond-exhibition") {
          const blankItem = {
            title: "NEW HIGHLIGHT / AWARD",
            description: "Enter description...",
            icon: "Award",
          };
          return { ...section, items: [...items, blankItem] };
        }
        if (section.key === "footer") {
          const blankLink = {
            label: "New Link",
            href: "/",
          };
          return { ...section, items: [...items, blankLink] };
        }
        const defaultItemTemplate: Record<string, any> = {
          title: "",
          subtitle: "",
          description: "",
          label: "",
          value: "",
          icon: "",
          image: "",
          buttonLabel: "",
          buttonHref: "",
          question: "",
          answer: "",
          href: "",
          category: "",
          year: "",
        };
        if (items[0]) {
          Object.keys(items[0]).forEach((k) => {
            if (k !== "_id" && !(k in defaultItemTemplate)) {
              defaultItemTemplate[k] = "";
            }
          });
        }
        return { ...section, items: [...items, defaultItemTemplate] };
      }),
    );
  };

  const removeSectionItem = (sectionIndex: number, itemIndex: number) => {
    setSectionsDraft((previous) =>
      previous.map((section, index) => {
        if (index !== sectionIndex) return section;
        const items = (section.items ?? []).filter((_: unknown, i: number) => i !== itemIndex);
        return { ...section, items };
      }),
    );
  };

  const updateField = <
    K extends keyof FormState,
  >(
    key: K,
    value: FormState[K],
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        [key]: value,
      }),
    );
  };

  const resetToWebsiteDefaults = () => {
    const defaults = getDefaultSectionsForPage(page);
    lazySwal.fire({
      title: "Reset to Website Content",
      text: "Page sections have been reset to match the exact live website defaults.",
      icon: "success",
      timer: 1800,
      confirmButtonColor: "#0f766e",
    });
  };

  const savePage = async () => {
    await saveCmsPage({
      settings,
      page,
      sectionsDraft,
      form,
      canonicalEditorRef,
      setSaving,
      setSettings,
      setPages,
    });
  };

  const editCtx: CmsEditContextValue = {
    router,
    page,
    pages,
    form,
    sectionsDraft,
    openSectionIndices,
    saving,
    ogUploading,
    ogPreview,
    canonicalEditorRef,
    execCommand,
    handleCanonicalInput,
    handleCanonicalPaste,
    handleOgImageUpload,
    removeOgImage,
    autoGenerateSeo,
    toggleSectionAccordion,
    updateSectionField,
    updateSectionItem,
    addSectionItem,
    removeSectionItem,
    updateField,
    resetToWebsiteDefaults,
    savePage,
    setSectionsDraft,
    setOpenSectionIndices,
  };

  const content = (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            mb-[20px]
            flex
            shrink-0
            items-start
            justify-between
            border-b-[2px]
            border-[#293681]
            pb-[8px]
          "
        >
          <div
            className="
              flex
              items-center
              gap-[11px]
            "
          >
            <div
              className="
                mt-[1px]
                grid
                h-[28px]
                w-[28px]
                place-items-center
                rounded-full
                bg-[#e8f4e9]
                text-[#23714a]
              "
            >
              <Edit3
                className="h-[14px] w-[14px]"
                strokeWidth={1.65}
              />
            </div>

            <div>
              <h1
                className="
                  mt-[2px]
                  text-[19px]
                  font-bold
                  leading-[1.15]
                  tracking-[-0.018em]
                  text-[#18233b]
                "
              >
                Edit Page
              </h1>

            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-[10px]
            "
          >
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/pages",
                )
              }
              className="
                flex
                h-[30px]
                items-center
                gap-[7px]
                rounded-[4px]
                border
                border-red-200
                bg-red-50
                px-[12px]
                text-[8.5px]
                font-semibold
                text-red-600
              "
            >
              <ArrowLeft className="h-[13px] w-[13px]" />

              Back to Pages
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/pages/${getCmsPageRouteKey(page)}`,
                )
              }
              className="
                flex
                h-[30px]
                items-center
                gap-[7px]
                rounded-[4px]
                border
                border-orange-200
                bg-orange-50
                px-[12px]
                text-[8.5px]
                font-semibold
                text-orange-600
              "
            >
              <Eye className="h-[13px] w-[13px]" />

              Preview Page
            </button>

            <button
              type="button"
              onClick={resetToWebsiteDefaults}
              className="
                flex
                h-[30px]
                items-center
                gap-[7px]
                rounded-[4px]
                border
                border-[#0f766e]
                bg-[#f0fdf4]
                px-[12px]
                text-[8.5px]
                font-semibold
                text-[#0f766e]
                hover:bg-[#dcfce7]
              "
            >
              <Sparkles className="h-[13px] w-[13px]" />

              Sync / Reset Website Data
            </button>

            <button
              type="button"
              onClick={savePage}
              disabled={saving}
              className="
                flex
                h-[30px]
                items-center
                gap-[7px]
                rounded-[4px]
                bg-[#218DAE]
                px-[12px]
                text-[8.5px]
                font-semibold
                text-white
                shadow-sm
              "
            >
              <Save className="h-[13px] w-[13px]" />

              {saving ? "Updating..." : "Update Page"}
            </button>

            <button
              type="button"
              className="
                grid
                h-[30px]
                w-[30px]
                place-items-center
                rounded-[4px]
                border
                border-[#dedfdb]
                bg-white
                text-[#445065]
              "
            >
              <MoreVertical className="h-[16px] w-[16px]" />
            </button>
          </div>
        </div>

        {/* =================================================
            MAIN
        ================================================= */}

        <div
          className="
            grid
            items-start
            grid-cols-[minmax(0,2.35fr)_minmax(330px,1fr)]
            gap-[10px]
          "
        >
          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div
            className="
              flex
              flex-col
              gap-[8px]
            "
          >
            <BasicInfoSection />
            <PageSectionsSection />
            <SeoSettingsSection />
            <PageSettingsSection />
          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <div
            className="
              flex
              flex-col
              gap-[8px]
            "
          >
            <EditorRail />
          </div>
        </div>
      </div>
    </div>
  );

  return <CmsEditProvider value={editCtx}>{content}</CmsEditProvider>;
}
