"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { FieldLabel, Textarea, TextInput } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import {
  registerNowPageApi,
  RegisterNowEventDetails,
  RegisterNowHero,
  RegisterNowNeedHelp,
  RegisterNowSectionKey,
  RegisterNowSections,
  RegisterNowStat,
  RegisterNowWhyAttend,
  StatIcon,
} from "@/lib/registerNowPageApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   REGISTER NOW PAGE — hero, stats band and the three cards on
   the left of the website's Register Now page. Each loads from
   and saves straight to backend-arogya (images go to Cloudinary),
   so each has its own Save button.
========================================================= */

const upload = registerNowPageApi.upload;

function Panel({ title, note, action, children }: { title: string; note?: string; action?: React.ReactNode; children: React.ReactNode }) {
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

const smallButton = "flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border transition disabled:opacity-30";

function RowActions({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (by: -1 | 1) => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" title="Move up" onClick={() => onMove(-1)} disabled={index === 0} className={`${smallButton} border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50`}>
        <ArrowUp className="h-3 w-3" />
      </button>
      <button type="button" title="Move down" onClick={() => onMove(1)} disabled={index === count - 1} className={`${smallButton} border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50`}>
        <ArrowDown className="h-3 w-3" />
      </button>
      <button type="button" title="Remove" onClick={onRemove} className={`${smallButton} border-red-200 bg-red-50 text-red-600 hover:bg-red-100`}>
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

const move = <T,>(list: T[], index: number, by: -1 | 1): T[] => {
  const target = index + by;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

/** Loads one section, keeps its draft and saves it */
function useSection<K extends RegisterNowSectionKey>(section: K, empty: RegisterNowSections[K], label: string) {
  const [data, setData] = useState<RegisterNowSections[K]>(empty);
  const [meta, setMeta] = useState<{ updatedAt?: string; updatedBy?: string }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    registerNowPageApi
      .get(section)
      .then((res) => {
        if (res?.data) setData({ ...empty, ...res.data });
        setMeta({ updatedAt: res?.updatedAt, updatedBy: res?.updatedBy });
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : `Could not load the ${label}.`))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await registerNowPageApi.save(section, data);
      if (res?.data) setData({ ...empty, ...res.data });
      setMeta({ updatedAt: res?.updatedAt, updatedBy: res?.updatedBy });
      showSuccess(`${label} saved. Refresh the website Register Now page to see it.`);
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : `Could not save the ${label}.`;
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  return { data, setData, meta, loading, saving, error, setError, save };
}

function Footer({ label, saving, onSave, error, meta }: { label: string; saving: boolean; onSave: () => void; error: string; meta: { updatedAt?: string; updatedBy?: string } }) {
  return (
    <>
      {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}
      <div className="flex items-center justify-end gap-[10px]">
        {meta.updatedAt && meta.updatedBy && (
          <span className="text-[10px] text-[#64748b]">
            Last saved {new Date(meta.updatedAt).toLocaleString("en-IN")} by {meta.updatedBy}
          </span>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex h-[32px] items-center gap-1.5 rounded-[4px] bg-[#16a34a] px-[14px] text-[12px] font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {label}
        </button>
      </div>
    </>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-4 text-[11px] text-[#64748b]">
      <Loader2 className="h-4 w-4 animate-spin text-[#0f766e]" />
      Loading {label}...
    </div>
  );
}

/* ───────────────────────── Hero ───────────────────────── */

export function RegisterNowHeroEditor() {
  const s = useSection<"hero">("hero", {
    titleLine1: "", titleLine2: "", tagline: "", editionText: "", dateText: "", venueText: "", bgImage: "", bgImageAlt: "",
  } as RegisterNowHero, "Register Now hero");
  const set = (key: keyof RegisterNowHero, value: string) => s.setData((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    if (!s.data.titleLine1.trim()) return s.setError("Enter the title (first line).");
    if (s.data.bgImage.trim() && !s.data.bgImageAlt.trim()) return s.setError("Enter the background image alt text.");
    s.save();
  };

  if (s.loading) return <Loading label="Register Now hero" />;
  return (
    <div className="flex flex-col gap-3">
      <Panel title="Heading & Text" note="The two title lines together are the page's only H1 on the website. Press Enter in the tagline for a new line.">
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel required>Title — First Line (H1)</FieldLabel>
            <TextInput value={s.data.titleLine1} onChange={(v) => set("titleLine1", v.toUpperCase())} maxLength={30} />
          </div>
          <div>
            <FieldLabel>Title — Second Line (H1)</FieldLabel>
            <TextInput value={s.data.titleLine2} onChange={(v) => set("titleLine2", v.toUpperCase())} maxLength={30} />
          </div>
        </div>
        <div>
          <FieldLabel>Tagline</FieldLabel>
          <Textarea value={s.data.tagline} onChange={(v) => set("tagline", v)} rows={2} maxLength={160} />
        </div>
        <div>
          <FieldLabel>Edition Text</FieldLabel>
          <TextInput value={s.data.editionText} onChange={(v) => set("editionText", v)} maxLength={60} />
        </div>
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel>Date</FieldLabel>
            <TextInput value={s.data.dateText} onChange={(v) => set("dateText", v.toUpperCase())} maxLength={40} />
          </div>
          <div>
            <FieldLabel>Venue</FieldLabel>
            <TextInput value={s.data.venueText} onChange={(v) => set("venueText", v.toUpperCase())} maxLength={60} />
          </div>
        </div>
      </Panel>

      <Panel title="Background Image" note="Wide banner — keep the left side plain so the text stays readable. Leave empty to use the website's built-in banner.">
        <CloudImageField upload={upload} label="Background Image" value={s.data.bgImage} onChange={(v) => set("bgImage", v)} hint="About 1900 × 640 px, up to 5 MB" previewClass="h-[70px] w-[200px]" />
        <div>
          <FieldLabel required={Boolean(s.data.bgImage)}>Background Image Alt Text</FieldLabel>
          <TextInput value={s.data.bgImageAlt} onChange={(v) => set("bgImageAlt", v)} placeholder="Describe what the background shows (for SEO & screen readers)" maxLength={150} />
        </div>
      </Panel>

      <Footer label="Save Register Now Hero" saving={s.saving} onSave={save} error={s.error} meta={s.meta} />
    </div>
  );
}

/* ───────────────────────── Stats band ───────────────────────── */

const STAT_ICONS: { value: StatIcon; label: string }[] = [
  { value: "users", label: "People" },
  { value: "mic", label: "Microphone" },
  { value: "calendar", label: "Calendar" },
  { value: "globe", label: "Globe" },
  { value: "infinity", label: "Infinity" },
];

export function RegisterNowStatsEditor() {
  const s = useSection<"stats">("stats", { items: [] }, "Stats band");
  const items = s.data.items;
  const setItems = (next: RegisterNowStat[]) => s.setData({ items: next });
  const update = (index: number, key: keyof RegisterNowStat, value: string) =>
    setItems(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));

  const save = () => {
    if (items.length === 0) return s.setError("Add at least one stat.");
    for (const [i, item] of items.entries()) {
      if (!item.value.trim()) return s.setError(`Stat ${i + 1}: enter the value.`);
      if (!item.label.trim()) return s.setError(`Stat ${i + 1}: enter the label.`);
    }
    s.save();
  };

  if (s.loading) return <Loading label="Stats band" />;
  return (
    <div className="flex flex-col gap-3">
      <Panel
        title="Stats"
        note='The dark band under the banner, left to right. A number like "121+" counts up on the website; a word like "ENDLESS" is shown as it is.'
        action={
          <button
            type="button"
            onClick={() => setItems([...items, { value: "", label: "", iconKey: "users" }])}
            disabled={items.length >= 8}
            className="inline-flex h-[26px] shrink-0 items-center gap-1 rounded-[4px] border border-[#cbd5e1] bg-[#f8fafc] px-[10px] text-[10.5px] font-semibold text-[#334155] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-3 w-3" /> Add Stat ({items.length}/8)
          </button>
        }
      >
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-[110px_1fr_140px_auto] items-end gap-[10px] rounded-[5px] border border-[#eef0f3] bg-[#fbfcfd] p-[10px]">
            <div>
              <FieldLabel required>Value</FieldLabel>
              <TextInput value={item.value} onChange={(v) => update(index, "value", v.toUpperCase())} placeholder="121+" maxLength={12} />
            </div>
            <div>
              <FieldLabel required>Label</FieldLabel>
              <TextInput value={item.label} onChange={(v) => update(index, "label", v.toUpperCase())} placeholder="EXPERT SPEAKERS" maxLength={30} />
            </div>
            <div>
              <FieldLabel>Icon</FieldLabel>
              <select
                value={item.iconKey}
                onChange={(e) => update(index, "iconKey", e.target.value)}
                className="h-[34px] w-full cursor-pointer rounded-[4px] border border-[#cbd5e1] bg-white px-[10px] text-[11.5px] font-medium text-[#142347] outline-none focus:border-[#16a34a]"
              >
                {STAT_ICONS.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="pb-[6px]">
              <RowActions index={index} count={items.length} onMove={(by) => setItems(move(items, index, by))} onRemove={() => setItems(items.filter((_, i) => i !== index))} />
            </div>
          </div>
        ))}
      </Panel>
      <Footer label="Save Stats Band" saving={s.saving} onSave={save} error={s.error} meta={s.meta} />
    </div>
  );
}

/* ───────────────────────── Event details card ───────────────────────── */

export function RegisterNowEventDetailsEditor() {
  const s = useSection<"eventDetails">("eventDetails", {
    heading: "", dateText: "", dayText: "", venueText: "", websiteLabel: "", websiteUrl: "",
    dateIcon: "", dateIconAlt: "", venueIcon: "", venueIconAlt: "", websiteIcon: "", websiteIconAlt: "",
  } as RegisterNowEventDetails, "Event details card");
  const set = (key: keyof RegisterNowEventDetails, value: string) => s.setData((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    if (!s.data.heading.trim()) return s.setError("Enter the heading.");
    if (s.data.websiteUrl.trim() && !/^https?:\/\//.test(s.data.websiteUrl.trim())) return s.setError("The website link must start with https://");
    for (const [image, alt] of [["dateIcon", "dateIconAlt"], ["venueIcon", "venueIconAlt"], ["websiteIcon", "websiteIconAlt"]] as const) {
      if (s.data[image].trim() && !s.data[alt].trim()) return s.setError("Enter the alt text for every icon.");
    }
    s.save();
  };

  const iconRow = (label: string, image: "dateIcon" | "venueIcon" | "websiteIcon", alt: "dateIconAlt" | "venueIconAlt" | "websiteIconAlt") => (
    <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
      <CloudImageField upload={upload} label={`${label} Icon`} value={s.data[image]} onChange={(v) => set(image, v)} hint="Small icon, PNG" previewClass="h-[44px] w-[44px]" />
      <div>
        <FieldLabel required={Boolean(s.data[image])}>{label} Icon Alt Text</FieldLabel>
        <TextInput value={s.data[alt]} onChange={(v) => set(alt, v)} maxLength={150} />
      </div>
    </div>
  );

  if (s.loading) return <Loading label="Event details card" />;
  return (
    <div className="flex flex-col gap-3">
      <Panel title="Event Details Card" note="The first card on the left of the page. Press Enter in the venue for a new line.">
        <div>
          <FieldLabel required>Heading</FieldLabel>
          <TextInput value={s.data.heading} onChange={(v) => set("heading", v.toUpperCase())} maxLength={30} />
        </div>
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel>Date</FieldLabel>
            <TextInput value={s.data.dateText} onChange={(v) => set("dateText", v)} maxLength={40} />
          </div>
          <div>
            <FieldLabel>Days</FieldLabel>
            <TextInput value={s.data.dayText} onChange={(v) => set("dayText", v)} maxLength={40} />
          </div>
        </div>
        <div>
          <FieldLabel>Venue</FieldLabel>
          <Textarea value={s.data.venueText} onChange={(v) => set("venueText", v)} rows={2} maxLength={80} />
        </div>
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel>Website Text</FieldLabel>
            <TextInput value={s.data.websiteLabel} onChange={(v) => set("websiteLabel", v)} maxLength={60} />
          </div>
          <div>
            <FieldLabel>Website Link</FieldLabel>
            <TextInput value={s.data.websiteUrl} onChange={(v) => set("websiteUrl", v)} placeholder="https://arogya.namogange.org" maxLength={200} />
          </div>
        </div>
      </Panel>
      <Panel title="Icons">
        {iconRow("Date", "dateIcon", "dateIconAlt")}
        {iconRow("Venue", "venueIcon", "venueIconAlt")}
        {iconRow("Website", "websiteIcon", "websiteIconAlt")}
      </Panel>
      <Footer label="Save Event Details" saving={s.saving} onSave={save} error={s.error} meta={s.meta} />
    </div>
  );
}

/* ───────────────────────── Why attend card ───────────────────────── */

export function RegisterNowWhyAttendEditor() {
  const s = useSection<"whyAttend">("whyAttend", { heading: "", items: [] } as RegisterNowWhyAttend, "Why attend card");
  const items = s.data.items;
  const setItems = (next: RegisterNowWhyAttend["items"]) => s.setData((prev) => ({ ...prev, items: next }));
  const update = (index: number, key: keyof RegisterNowWhyAttend["items"][number], value: string) =>
    setItems(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));

  const save = () => {
    if (!s.data.heading.trim()) return s.setError("Enter the heading.");
    if (items.length === 0) return s.setError("Add at least one point.");
    for (const [i, item] of items.entries()) {
      if (!item.title.trim()) return s.setError(`Point ${i + 1}: enter the title.`);
      if (item.icon.trim() && !item.iconAlt.trim()) return s.setError(`Point ${i + 1}: enter the icon alt text.`);
    }
    s.save();
  };

  if (s.loading) return <Loading label="Why attend card" />;
  return (
    <div className="flex flex-col gap-3">
      <Panel title="Heading">
        <TextInput value={s.data.heading} onChange={(v) => s.setData((prev) => ({ ...prev, heading: v.toUpperCase() }))} maxLength={60} />
      </Panel>
      <Panel
        title="Points"
        note="Shown top to bottom in this order. Press Enter in a description for a new line."
        action={
          <button
            type="button"
            onClick={() => setItems([...items, { title: "", description: "", icon: "", iconAlt: "" }])}
            disabled={items.length >= 6}
            className="inline-flex h-[26px] shrink-0 items-center gap-1 rounded-[4px] border border-[#cbd5e1] bg-[#f8fafc] px-[10px] text-[10.5px] font-semibold text-[#334155] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-3 w-3" /> Add Point ({items.length}/6)
          </button>
        }
      >
        {items.map((item, index) => (
          <div key={index} className="flex flex-col gap-[8px] rounded-[5px] border border-[#eef0f3] bg-[#fbfcfd] p-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-[#334155]">Point {index + 1}{item.title ? ` — ${item.title}` : ""}</span>
              <RowActions index={index} count={items.length} onMove={(by) => setItems(move(items, index, by))} onRemove={() => setItems(items.filter((_, i) => i !== index))} />
            </div>
            <div className="grid grid-cols-2 gap-[10px]">
              <div>
                <FieldLabel required>Title</FieldLabel>
                <TextInput value={item.title} onChange={(v) => update(index, "title", v)} maxLength={30} />
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <Textarea value={item.description} onChange={(v) => update(index, "description", v)} rows={2} maxLength={120} />
              </div>
            </div>
            <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
              <CloudImageField upload={upload} label="Icon" value={item.icon} onChange={(v) => update(index, "icon", v)} hint="Small icon, PNG" previewClass="h-[44px] w-[44px]" />
              <div>
                <FieldLabel required={Boolean(item.icon)}>Icon Alt Text</FieldLabel>
                <TextInput value={item.iconAlt} onChange={(v) => update(index, "iconAlt", v)} maxLength={150} />
              </div>
            </div>
          </div>
        ))}
      </Panel>
      <Footer label="Save Why Attend" saving={s.saving} onSave={save} error={s.error} meta={s.meta} />
    </div>
  );
}

/* ───────────────────────── Need help card ───────────────────────── */

export function RegisterNowNeedHelpEditor() {
  const s = useSection<"needHelp">("needHelp", { title: "", description: "", email: "", phone: "" } as RegisterNowNeedHelp, "Need help card");
  const set = (key: keyof RegisterNowNeedHelp, value: string) => s.setData((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    if (!s.data.title.trim()) return s.setError("Enter the title.");
    s.save();
  };

  if (s.loading) return <Loading label="Need help card" />;
  return (
    <div className="flex flex-col gap-3">
      <Panel title="Need Help Card" note="The dark green card at the bottom left. The email and phone open the mail app / dialer when tapped.">
        <div>
          <FieldLabel required>Title</FieldLabel>
          <TextInput value={s.data.title} onChange={(v) => set("title", v.toUpperCase())} maxLength={30} />
        </div>
        <div>
          <FieldLabel>Description</FieldLabel>
          <Textarea value={s.data.description} onChange={(v) => set("description", v)} rows={2} maxLength={160} />
        </div>
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel>Email</FieldLabel>
            <TextInput value={s.data.email} onChange={(v) => set("email", v)} maxLength={100} />
          </div>
          <div>
            <FieldLabel>Phone</FieldLabel>
            <TextInput value={s.data.phone} onChange={(v) => set("phone", v)} maxLength={30} />
          </div>
        </div>
      </Panel>
      <Footer label="Save Need Help" saving={s.saving} onSave={save} error={s.error} meta={s.meta} />
    </div>
  );
}

/* ───────────────────────── Registration cards (managed elsewhere) ───────────────────────── */

export function RegisterNowCardsNote() {
  return (
    <p className="rounded-[6px] border border-[#e2e8f0] bg-[#f8fafc] p-[12px] text-[11px] text-[#334155]">
      The Single and Group registration cards, their images and the heading above them are managed on the{" "}
      <Link href="/add-registration" className="font-semibold text-[#0f766e] hover:underline">
        Add Registration
      </Link>{" "}
      page (System &amp; Security).
    </p>
  );
}

/* ───────────────────────── Shared-section note ───────────────────────── */

export function SharedSectionNote({ href, linkText, children }: { href: string; linkText: string; children: React.ReactNode }) {
  return (
    <p className="rounded-[6px] border border-[#bae6fd] bg-[#f0f9ff] p-[12px] text-[11px] text-[#334155]">
      <span className="mr-1 inline-block rounded-[3px] bg-[#0369a1] px-1.5 py-0.5 text-[9px] font-bold text-white">COMMON</span>
      {children}{" "}
      <Link href={href} className="font-semibold text-[#0f766e] hover:underline">
        {linkText}
      </Link>
      .
    </p>
  );
}

/* ───────────────────────── Your Registration Includes ───────────────────────── */

export function RegistrationIncludesEditor() {
  const s = useSection<"registrationIncludes">("registrationIncludes", { heading: "", items: [] }, "Your Registration Includes");
  const items = s.data.items;
  const setItems = (next: typeof items) => s.setData((prev) => ({ ...prev, items: next }));
  const update = (index: number, key: keyof (typeof items)[number], value: string) =>
    setItems(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));

  const save = () => {
    if (!s.data.heading.trim()) return s.setError("Enter the heading.");
    if (items.length === 0) return s.setError("Add at least one item.");
    for (const [i, item] of items.entries()) {
      if (!item.title.trim()) return s.setError(`Item ${i + 1}: enter the title.`);
      if (item.icon.trim() && !item.iconAlt.trim()) return s.setError(`Item ${i + 1}: enter the icon alt text.`);
    }
    s.save();
  };

  if (s.loading) return <Loading label="Your Registration Includes" />;
  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-[6px] border border-[#bae6fd] bg-[#f0f9ff] p-[10px] text-[10.5px] text-[#334155]">
        <span className="mr-1 inline-block rounded-[3px] bg-[#0369a1] px-1.5 py-0.5 text-[9px] font-bold text-white">COMMON</span>
        This section shows on both the Single and the Group registration pages — saving here updates both.
      </p>
      <Panel title="Heading">
        <TextInput value={s.data.heading} onChange={(v) => s.setData((prev) => ({ ...prev, heading: v }))} maxLength={60} />
      </Panel>
      <Panel
        title="Items"
        note="Left to right in this order. Press Enter in a title to start a new line on the website."
        action={
          <button
            type="button"
            onClick={() => setItems([...items, { title: "", icon: "", iconAlt: "" }])}
            disabled={items.length >= 8}
            className="inline-flex h-[26px] shrink-0 items-center gap-1 rounded-[4px] border border-[#cbd5e1] bg-[#f8fafc] px-[10px] text-[10.5px] font-semibold text-[#334155] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-3 w-3" /> Add Item ({items.length}/8)
          </button>
        }
      >
        {items.map((item, index) => (
          <div key={index} className="flex flex-col gap-[8px] rounded-[5px] border border-[#eef0f3] bg-[#fbfcfd] p-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-[#334155]">Item {index + 1}{item.title ? ` — ${item.title.replace(/\s+/g, " ")}` : ""}</span>
              <RowActions index={index} count={items.length} onMove={(by) => setItems(move(items, index, by))} onRemove={() => setItems(items.filter((_, i) => i !== index))} />
            </div>
            <div>
              <FieldLabel required>Title</FieldLabel>
              <Textarea value={item.title} onChange={(v) => update(index, "title", v.toUpperCase())} rows={2} maxLength={80} />
            </div>
            <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
              <CloudImageField upload={upload} label="Icon" value={item.icon} onChange={(v) => update(index, "icon", v)} hint="Square icon, PNG" previewClass="h-[48px] w-[48px]" />
              <div>
                <FieldLabel required={Boolean(item.icon)}>Icon Alt Text</FieldLabel>
                <TextInput value={item.iconAlt} onChange={(v) => update(index, "iconAlt", v)} maxLength={150} />
              </div>
            </div>
          </div>
        ))}
      </Panel>
      <Footer label="Save Your Registration Includes" saving={s.saving} onSave={save} error={s.error} meta={s.meta} />
    </div>
  );
}
