"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { FieldLabel, SelectField, Textarea, TextInput, Toggle } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { heroCarouselApi, HeroCarousel, HeroSlide, HeroTheme } from "@/lib/heroCarouselApi";
import { ApiRequestError } from "@/lib/api";
import { lazySwal, showError, showSuccess } from "@/lib/toast";

/* =========================================================
   HERO CAROUSEL — website home page hero (backgrounds, logo,
   subtitle, buttons) plus the edition tag, dates and venue
   shared by every slide. Loads from and saves straight to
   backend-arogya (images go to Cloudinary), so it has its own
   Save button — page sections are only stored locally.
========================================================= */

const MAX_SLIDES = 10;
const LINK_PATTERN = /^(\/|https?:\/\/)/;

const THEME_OPTIONS: { label: string; value: HeroTheme }[] = [
  { label: "Gold — gold & dark green buttons", value: "gold" },
  { label: "Blue — blue & gold buttons", value: "blue" },
  { label: "Green — blue & gold buttons", value: "green" },
];

const EMPTY_CAROUSEL: HeroCarousel = {
  editionTag: "18th Edition of",
  eventDates: "21-23 August 2026",
  venue: "Pragati Maidan, New Delhi",
  slides: [],
};

const newSlide = (template?: HeroSlide): HeroSlide => ({
  image: "",
  imageAlt: "",
  logo: template?.logo ?? "",
  logoAlt: template?.logoAlt ?? "Arogya Sangoshthi Logo",
  subtitle: "",
  theme: "green",
  button1Label: "Explore Sessions",
  button1Link: "/register-now",
  button1NewTab: false,
  button2Label: "Register Now",
  button2Link: "/register-now",
  button2NewTab: false,
  isActive: true,
});

/* ---------- Button (label + link + new tab) ---------- */
function ButtonFields({
  title,
  label,
  link,
  newTab,
  onChange,
}: {
  title: string;
  label: string;
  link: string;
  newTab: boolean;
  onChange: (field: "Label" | "Link" | "NewTab", value: string | boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-[8px] border border-[#e2e8f0] bg-[#fafafa] p-[10px]">
      <div className="text-[11px] font-bold text-[#334155]">{title}</div>
      <div className="grid grid-cols-2 gap-[10px]">
        <div>
          <FieldLabel>Button Label</FieldLabel>
          <TextInput value={label} onChange={(v) => onChange("Label", v)} placeholder="Register Now" maxLength={40} />
        </div>
        <div>
          <FieldLabel>Button Link</FieldLabel>
          <TextInput value={link} onChange={(v) => onChange("Link", v)} placeholder="/register-now or https://..." maxLength={300} />
        </div>
      </div>
      <div className="flex items-center gap-[8px]">
        <Toggle checked={newTab} onChange={(v) => onChange("NewTab", v)} />
        <span className="text-[11px] text-[#475569]">Open link in a new tab</span>
        <span className="ml-auto text-[10px] text-[#94a3b8]">Leave the label empty to hide this button</span>
      </div>
    </div>
  );
}

export function HeroCarouselEditor() {
  const [carousel, setCarousel] = useState<HeroCarousel>(EMPTY_CAROUSEL);
  const [openSlide, setOpenSlide] = useState<number | null>(0);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    heroCarouselApi
      .get()
      .then((data) => {
        if (data) {
          setCarousel({
            editionTag: data.editionTag ?? "",
            eventDates: data.eventDates ?? "",
            venue: data.venue ?? "",
            slides: data.slides ?? [],
            updatedAt: data.updatedAt,
            updatedBy: data.updatedBy,
          });
        } else {
          setCarousel({ ...EMPTY_CAROUSEL, slides: [newSlide()] });
          setIsSaved(false);
        }
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load the hero carousel."))
      .finally(() => setLoading(false));
  }, []);

  const setField = (key: "editionTag" | "eventDates" | "venue", value: string) =>
    setCarousel((prev) => ({ ...prev, [key]: value }));

  const updateSlide = <K extends keyof HeroSlide>(index: number, key: K, value: HeroSlide[K]) =>
    setCarousel((prev) => ({
      ...prev,
      slides: prev.slides.map((slide, i) => (i === index ? { ...slide, [key]: value } : slide)),
    }));

  const addSlide = () => {
    setCarousel((prev) => ({ ...prev, slides: [...prev.slides, newSlide(prev.slides[0])] }));
    setOpenSlide(carousel.slides.length);
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= carousel.slides.length) return;
    setCarousel((prev) => {
      const slides = [...prev.slides];
      [slides[index], slides[target]] = [slides[target], slides[index]];
      return { ...prev, slides };
    });
    setOpenSlide(target);
  };

  const removeSlide = async (index: number) => {
    const confirm = await lazySwal.fire({
      title: `Remove Slide ${index + 1}?`,
      text: "It disappears from the website after you click Save Hero Carousel.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Remove",
    });
    if (!confirm.isConfirmed) return;
    setCarousel((prev) => ({ ...prev, slides: prev.slides.filter((_, i) => i !== index) }));
    setOpenSlide(null);
  };

  const validate = (): string | null => {
    if (!carousel.slides.length) return "Add at least one slide.";
    for (const [i, s] of carousel.slides.entries()) {
      const n = `Slide ${i + 1}`;
      if (!s.image.trim()) return `${n}: upload a background image.`;
      if (!s.imageAlt.trim()) return `${n}: enter the image alt text.`;
      if (s.logo.trim() && !s.logoAlt.trim()) return `${n}: enter the logo alt text.`;
      for (const [label, link] of [
        [s.button1Label, s.button1Link],
        [s.button2Label, s.button2Link],
      ]) {
        if (label.trim() && link.trim() && !LINK_PATTERN.test(link.trim())) {
          return `${n}: button link "${link}" must start with / or http(s)://`;
        }
      }
    }
    if (!carousel.slides.some((s) => s.isActive)) return "Keep at least one slide active, or the website shows nothing new.";
    return null;
  };

  const save = async () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const saved = await heroCarouselApi.save({
        editionTag: carousel.editionTag.trim(),
        eventDates: carousel.eventDates.trim(),
        venue: carousel.venue.trim(),
        slides: carousel.slides.map(({ _id, ...slide }) => slide),
      });
      setCarousel({
        editionTag: saved.editionTag,
        eventDates: saved.eventDates,
        venue: saved.venue,
        slides: saved.slides,
        updatedAt: saved.updatedAt,
        updatedBy: saved.updatedBy,
      });
      setIsSaved(true);
      showSuccess("Hero carousel saved. The website updates within 30 seconds.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save the hero carousel.";
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-[11px] text-[#64748b]">
        <Loader2 className="h-4 w-4 animate-spin text-[#0f766e]" />
        Loading the website hero carousel...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* COMMON TEXTS */}
      <div className="flex flex-col gap-3 rounded-[6px] border border-[#e2e8f0] bg-white p-3">
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-1.5">
          <div>
            <div className="text-[11px] font-bold text-[#1e40af]">Shown on every slide</div>
            <p className="mt-[2px] text-[10px] text-[#64748b]">Edition tag above the logo, and the date & venue line under the subtitle.</p>
          </div>
          {!isSaved && (
            <span className="shrink-0 rounded-[3px] border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
              NOT SAVED YET
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-[12px]">
          <div>
            <FieldLabel>Edition Tag</FieldLabel>
            <TextInput value={carousel.editionTag} onChange={(v) => setField("editionTag", v)} placeholder="18th Edition of" maxLength={40} />
          </div>
          <div>
            <FieldLabel>Event Dates</FieldLabel>
            <TextInput value={carousel.eventDates} onChange={(v) => setField("eventDates", v)} placeholder="21-23 August 2026" maxLength={60} />
          </div>
          <div>
            <FieldLabel>Venue</FieldLabel>
            <TextInput value={carousel.venue} onChange={(v) => setField("venue", v)} placeholder="Pragati Maidan, New Delhi" maxLength={90} />
          </div>
        </div>
      </div>

      {/* SLIDES */}
      <div className="flex items-center justify-between">
        <div className="text-[12px] font-bold text-[#334155]">
          Hero Slides <span className="font-medium text-[#64748b]">({carousel.slides.length} total, {carousel.slides.filter((s) => s.isActive).length} active)</span>
        </div>
        <button
          type="button"
          onClick={addSlide}
          disabled={carousel.slides.length >= MAX_SLIDES}
          className="inline-flex h-[30px] items-center gap-[5px] border border-dashed border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] transition hover:bg-[#ccfbf1] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3 w-3" /> Add Hero Slide
        </button>
      </div>

      {carousel.slides.map((slide, index) => {
        const isOpen = openSlide === index;
        return (
          <div key={slide._id ?? `new-${index}`} className="rounded-[6px] border border-[#e2e8f0] bg-white">
            {/* SLIDE HEADER */}
            <div
              className="flex cursor-pointer items-center gap-[10px] px-[12px] py-[8px]"
              onClick={() => setOpenSlide(isOpen ? null : index)}
            >
              {isOpen ? <ChevronDown className="h-4 w-4 text-[#64748b]" /> : <ChevronRight className="h-4 w-4 text-[#64748b]" />}
              <div className="h-[34px] w-[70px] shrink-0 overflow-hidden border border-[#e2e8f0] bg-[#f8fafc]">
                {slide.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={slide.image} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-bold text-[#4B1426]">Hero Slide {index + 1}</div>
                <div className="truncate text-[10px] text-[#64748b]">{slide.subtitle.replace(/\n/g, " ") || "No subtitle"}</div>
              </div>
              <div className="flex items-center gap-[6px]" onClick={(e) => e.stopPropagation()}>
                <span className={`text-[10px] font-bold ${slide.isActive ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
                  {slide.isActive ? "Active" : "Hidden"}
                </span>
                <Toggle checked={slide.isActive} onChange={(v) => updateSlide(index, "isActive", v)} />
                <button
                  type="button"
                  title="Move up"
                  disabled={index === 0}
                  onClick={() => moveSlide(index, -1)}
                  className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  title="Move down"
                  disabled={index === carousel.slides.length - 1}
                  onClick={() => moveSlide(index, 1)}
                  className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  title="Remove slide"
                  onClick={() => removeSlide(index)}
                  className="grid h-[26px] w-[26px] place-items-center border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* SLIDE BODY */}
            {isOpen && (
              <div className="flex flex-col gap-[12px] border-t border-[#f1f5f9] bg-[#fbfbfa] p-[12px]">
                <CloudImageField
                  upload={heroCarouselApi.upload}
                  label="Background Image"
                  required
                  value={slide.image}
                  onChange={(v) => updateSlide(index, "image", v)}
                  hint="Wide banner, about 1920 × 820 px, up to 5 MB"
                  previewClass="h-[70px] w-[160px]"
                />
                <div>
                  <FieldLabel required>Image Alt Text</FieldLabel>
                  <TextInput
                    value={slide.imageAlt}
                    onChange={(v) => updateSlide(index, "imageAlt", v)}
                    placeholder="Describe what the banner shows (for SEO & screen readers)"
                    maxLength={150}
                  />
                </div>

                <div className="grid grid-cols-[1.4fr_1fr] gap-[12px]">
                  <CloudImageField
                    upload={heroCarouselApi.upload}
                    label="Logo"
                    value={slide.logo}
                    onChange={(v) => updateSlide(index, "logo", v)}
                    hint="Transparent PNG / SVG"
                    previewClass="h-[70px] w-[110px]"
                  />
                  <div>
                    <FieldLabel required={Boolean(slide.logo)}>Logo Alt Text</FieldLabel>
                    <TextInput
                      value={slide.logoAlt}
                      onChange={(v) => updateSlide(index, "logoAlt", v)}
                      placeholder="Arogya Sangoshthi Logo"
                      maxLength={150}
                    />
                    <p className="mt-[4px] text-[10px] text-[#64748b]">Empty logo = the website&apos;s default Arogya logo.</p>
                  </div>
                </div>

                <div className="grid grid-cols-[1.4fr_1fr] gap-[12px]">
                  <div>
                    <FieldLabel>Subtitle</FieldLabel>
                    <Textarea
                      value={slide.subtitle}
                      onChange={(v) => updateSlide(index, "subtitle", v)}
                      rows={3}
                      maxLength={200}
                      placeholder={"India's Premier Conference on\nIntegrated Healthcare, AYUSH, Pharma"}
                    />
                    <p className="mt-[2px] text-[10px] text-[#64748b]">Press Enter for a new line on the website.</p>
                  </div>
                  <div>
                    <FieldLabel>Colour Theme</FieldLabel>
                    <SelectField
                      value={slide.theme}
                      options={THEME_OPTIONS}
                      onChange={(v) => updateSlide(index, "theme", v as HeroTheme)}
                    />
                    <p className="mt-[4px] text-[10px] text-[#64748b]">Text, icon and button colours on this slide.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-[12px]">
                  <ButtonFields
                    title="Primary Button"
                    label={slide.button1Label}
                    link={slide.button1Link}
                    newTab={slide.button1NewTab}
                    onChange={(field, value) => updateSlide(index, `button1${field}` as keyof HeroSlide, value as never)}
                  />
                  <ButtonFields
                    title="Secondary Button"
                    label={slide.button2Label}
                    link={slide.button2Link}
                    newTab={slide.button2NewTab}
                    onChange={(field, value) => updateSlide(index, `button2${field}` as keyof HeroSlide, value as never)}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}

      <div className="flex items-center justify-end gap-[10px]">
        {carousel.updatedAt && (
          <span className="text-[10px] text-[#64748b]">
            Last saved {new Date(carousel.updatedAt).toLocaleString("en-IN")}
            {carousel.updatedBy ? ` by ${carousel.updatedBy}` : ""}
          </span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex h-[32px] items-center gap-1.5 rounded-[4px] bg-[#16a34a] px-[14px] text-[12px] font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save Hero Carousel
        </button>
      </div>
    </div>
  );
}
