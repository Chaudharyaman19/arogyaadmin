"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  Award,
  Building2,
  Calendar,
  Globe,
  Heart,
  Loader2,
  Mic,
  Plus,
  Save,
  Share2,
  Smile,
  Star,
  ThumbsUp,
  Trash2,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { FieldLabel, TextInput } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { testimonialsSectionApi, TestimonialCounterItem, TestimonialsSection } from "@/lib/testimonialsSectionApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   TESTIMONIALS — only the section's headings, the stats band,
   the video block heading and the bottom band. Testimonial cards
   and videos are managed separately. Loads from and saves straight
   to backend-arogya (same records as admin-arogya), so it has its
   own Save button. Icon names must match backend
   models/testimonials/Testimonial.js.
========================================================= */

const ICONS: { name: string; label: string; Icon: LucideIcon }[] = [
  { name: "ThumbsUp", label: "Thumbs Up", Icon: ThumbsUp },
  { name: "Star", label: "Star", Icon: Star },
  { name: "Award", label: "Award", Icon: Award },
  { name: "Heart", label: "Heart", Icon: Heart },
  { name: "Globe", label: "Globe", Icon: Globe },
  { name: "Users", label: "People", Icon: Users },
  { name: "Share2", label: "Share", Icon: Share2 },
  { name: "TrendingUp", label: "Growth", Icon: TrendingUp },
  { name: "Smile", label: "Smile", Icon: Smile },
  { name: "Building2", label: "Building", Icon: Building2 },
  { name: "Calendar", label: "Calendar", Icon: Calendar },
  { name: "Mic", label: "Mic", Icon: Mic },
];
const ICON_BY_NAME = Object.fromEntries(ICONS.map((i) => [i.name, i.Icon]));
const LINK_PATTERN = /^(\/|https?:\/\/)/;

const EMPTY: TestimonialsSection = {
  heading: "TESTIMONIALS",
  mainTitle: "",
  shortDescription: "",
  topImage: "",
  topImageAlt: "",
  stats: [],
  videoTopImage: "",
  videoTopImageAlt: "",
  videoHeading: "",
  videoShortDescription: "",
  videoButtonLabel: "",
  videoButtonHref: "",
  bandHeading: "",
  bandParagraph: "",
  bandCounters: [],
  bandButtonLabel: "",
  bandButtonHref: "",
};

function Panel({ title, note, action, children }: { title: string; note?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-white p-[12px]">
      <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-1.5">
        <div>
          <div className="text-[11px] font-bold text-[#1e40af]">{title}</div>
          {note && <p className="mt-[2px] text-[10px] text-[#64748b]">{note}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/** Editable list of number + label + icon counters */
function CounterList({ items, onChange, max, labelMax, addLabel }: {
  items: TestimonialCounterItem[]; onChange: (next: TestimonialCounterItem[]) => void; max: number; labelMax: number; addLabel: string;
}) {
  const update = (i: number, patch: Partial<TestimonialCounterItem>) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const move = (i: number, direction: -1 | 1) => {
    const target = i + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-[8px]">
      {items.map((item, i) => {
        const Icon = ICON_BY_NAME[item.icon] ?? Users;
        return (
          <div key={i} className="flex flex-col gap-[8px] rounded-[6px] border border-[#e2e8da] bg-[#f6f8f3] p-[10px]">
            <div className="flex items-center gap-[10px]">
              <span className="grid h-[32px] w-[32px] shrink-0 place-items-center rounded-full border border-gray-300 bg-white text-[#032e1c]">
                <Icon className="h-[16px] w-[16px]" />
              </span>
              <div className="grid flex-1 grid-cols-[110px_1fr] gap-[8px]">
                <TextInput value={item.number} onChange={(v) => update(i, { number: v })} placeholder="98%" maxLength={12} />
                <TextInput value={item.label} onChange={(v) => update(i, { label: v })} placeholder="Delegates satisfied with the conference" maxLength={labelMax} />
              </div>
              <button type="button" title="Move up" disabled={i === 0} onClick={() => move(i, -1)}
                className="grid h-[30px] w-[30px] place-items-center border border-[#e2e8f0] bg-white text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                <ArrowUp className="h-3 w-3" />
              </button>
              <button type="button" title="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}
                className="grid h-[30px] w-[30px] place-items-center border border-[#e2e8f0] bg-white text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                <ArrowDown className="h-3 w-3" />
              </button>
              <button type="button" title="Remove" onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="grid h-[30px] w-[30px] place-items-center border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            <div className="flex flex-wrap gap-[5px]">
              {ICONS.map(({ name, label, Icon: OptionIcon }) => {
                const selected = item.icon === name;
                return (
                  <button key={name} type="button" title={label} onClick={() => update(i, { icon: name })}
                    className={`flex h-[28px] items-center gap-[4px] rounded-[5px] border px-[7px] text-[10px] font-semibold transition ${
                      selected ? "border-[#0f766e] bg-[#f0fdfa] text-[#0f766e] shadow-[0_0_0_1px_#0f766e]" : "border-[#e2e8f0] bg-white text-[#475569] hover:bg-slate-50"
                    }`}>
                    <OptionIcon className="h-[12px] w-[12px]" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <button type="button" onClick={() => onChange([...items, { number: "", label: "", icon: "Users" }])} disabled={items.length >= max}
        className="inline-flex h-[28px] w-fit items-center gap-[5px] border border-dashed border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] transition hover:bg-[#ccfbf1] disabled:cursor-not-allowed disabled:opacity-40">
        <Plus className="h-3 w-3" /> {addLabel} ({items.length}/{max})
      </button>
    </div>
  );
}

export function TestimonialsSectionEditor() {
  const [data, setData] = useState<TestimonialsSection>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    testimonialsSectionApi
      .get()
      .then((res) => setData({ ...EMPTY, ...res }))
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load the testimonials section."))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof TestimonialsSection>(key: K, value: TestimonialsSection[K]) => setData((prev) => ({ ...prev, [key]: value }));

  const validate = (): string | null => {
    if (!data.heading.trim()) return "Enter the heading.";
    if (!data.mainTitle.trim()) return "Enter the main title.";
    if (data.topImage && !data.topImageAlt.trim()) return "Enter the heading image alt text.";
    if (data.videoTopImage && !data.videoTopImageAlt.trim()) return "Enter the video heading image alt text.";
    for (const [list, name] of [[data.stats, "Stat"], [data.bandCounters, "Bottom band counter"]] as const) {
      for (const [i, c] of list.entries()) {
        if (!c.number.trim() || !c.label.trim()) return `${name} ${i + 1}: enter both the number and the label.`;
      }
    }
    for (const href of [data.videoButtonHref, data.bandButtonHref]) {
      if (href.trim() && !LINK_PATTERN.test(href.trim())) return `Button link "${href}" must start with / or http(s)://`;
    }
    return null;
  };

  const save = async () => {
    const problem = validate();
    if (problem) return setError(problem);
    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const clean = (list: TestimonialCounterItem[]) => list.map((c) => ({ ...c, number: c.number.trim(), label: c.label.trim() }));
      const saved = await testimonialsSectionApi.save({
        ...input,
        stats: clean(input.stats),
        bandCounters: clean(input.bandCounters),
        videoButtonHref: input.videoButtonHref.trim(),
        bandButtonHref: input.bandButtonHref.trim(),
      });
      setData({ ...EMPTY, ...saved });
      showSuccess("Testimonials section saved. Refresh the website to see it.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save the testimonials section.";
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
        Loading the testimonials section...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Panel title="Section Heading" note="The lotus, TESTIMONIALS label, title and description above the testimonial cards.">
        <div className="grid grid-cols-[1.4fr_1fr] gap-[10px]">
          <CloudImageField upload={testimonialsSectionApi.upload} label="Lotus Logo" value={data.topImage}
            onChange={(v) => set("topImage", v)} hint="Small icon above the heading" previewClass="h-[60px] w-[60px]" />
          <div>
            <FieldLabel required={Boolean(data.topImage)}>Lotus Logo Alt Text</FieldLabel>
            <TextInput value={data.topImageAlt} onChange={(v) => set("topImageAlt", v)} placeholder="Arogya Sangoshthi lotus logo" maxLength={150} />
          </div>
        </div>
        <div className="grid grid-cols-[1fr_1.6fr] gap-[10px]">
          <div>
            <FieldLabel required>Heading</FieldLabel>
            <TextInput value={data.heading} onChange={(v) => set("heading", v.toUpperCase())} maxLength={30} />
          </div>
          <div>
            <FieldLabel required>Main Title</FieldLabel>
            <TextInput value={data.mainTitle} onChange={(v) => set("mainTitle", v)} maxLength={60} />
          </div>
        </div>
        <div>
          <FieldLabel>Short Description</FieldLabel>
          <TextInput value={data.shortDescription} onChange={(v) => set("shortDescription", v)} maxLength={85} />
        </div>
      </Panel>

      <Panel title="Stats Band" note="The light green strip under the testimonial cards. 98%, 4.8/5 or 70+ count up on the website.">
        <CounterList items={data.stats} onChange={(next) => set("stats", next)} max={6} labelMax={60} addLabel="Add Stat" />
      </Panel>

      <Panel title="Video Testimonials Heading" note="The text and button left of the video carousel. Videos themselves are managed separately.">
        <div className="grid grid-cols-[1.4fr_1fr] gap-[10px]">
          <CloudImageField upload={testimonialsSectionApi.upload} label="Lotus Icon" value={data.videoTopImage}
            onChange={(v) => set("videoTopImage", v)} hint="Shown next to the heading" previewClass="h-[60px] w-[60px]" />
          <div>
            <FieldLabel required={Boolean(data.videoTopImage)}>Lotus Icon Alt Text</FieldLabel>
            <TextInput value={data.videoTopImageAlt} onChange={(v) => set("videoTopImageAlt", v)} placeholder="Video testimonials lotus icon" maxLength={150} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel>Heading</FieldLabel>
            <TextInput value={data.videoHeading} onChange={(v) => set("videoHeading", v.toUpperCase())} maxLength={60} />
          </div>
          <div>
            <FieldLabel>Short Description</FieldLabel>
            <TextInput value={data.videoShortDescription} onChange={(v) => set("videoShortDescription", v)} maxLength={120} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel>Button Label</FieldLabel>
            <TextInput value={data.videoButtonLabel} onChange={(v) => set("videoButtonLabel", v.toUpperCase())} placeholder="WATCH ALL VIDEOS" maxLength={30} />
          </div>
          <div>
            <FieldLabel>Button Link</FieldLabel>
            <TextInput value={data.videoButtonHref} onChange={(v) => set("videoButtonHref", v)} placeholder="/gallery or https://youtube.com/..." maxLength={300} />
          </div>
        </div>
        <p className="-mt-[4px] text-[10px] text-[#64748b]">Empty label hides the button · empty link keeps a button without a link.</p>
      </Panel>

      <Panel title="Bottom Band" note="The strip at the end of the section with counters and a button.">
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel>Heading</FieldLabel>
            <TextInput value={data.bandHeading} onChange={(v) => set("bandHeading", v)} maxLength={60} />
          </div>
          <div>
            <FieldLabel>Paragraph</FieldLabel>
            <TextInput value={data.bandParagraph} onChange={(v) => set("bandParagraph", v)} maxLength={95} />
          </div>
        </div>
        <CounterList items={data.bandCounters} onChange={(next) => set("bandCounters", next)} max={4} labelMax={25} addLabel="Add Counter" />
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel>Button Label</FieldLabel>
            <TextInput value={data.bandButtonLabel} onChange={(v) => set("bandButtonLabel", v.toUpperCase())} placeholder="JOIN THE NEXT LEGACY" maxLength={30} />
          </div>
          <div>
            <FieldLabel>Button Link</FieldLabel>
            <TextInput value={data.bandButtonHref} onChange={(v) => set("bandButtonHref", v)} placeholder="/delegate-registration" maxLength={300} />
          </div>
        </div>
      </Panel>

      {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}

      <div className="flex items-center justify-end gap-[10px]">
        {data.updatedAt && data.updatedBy && (
          <span className="text-[10px] text-[#64748b]">
            Last saved {new Date(data.updatedAt).toLocaleString("en-IN")} by {data.updatedBy}
          </span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex h-[32px] items-center gap-1.5 rounded-[4px] bg-[#16a34a] px-[14px] text-[12px] font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save Testimonials Section
        </button>
      </div>
    </div>
  );
}
