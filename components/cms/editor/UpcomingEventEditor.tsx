"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Calendar, Globe, Loader2, MapPin, Plus, Save, Trash2, Users } from "lucide-react";
import { FieldLabel, Textarea, TextInput, Toggle } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { upcomingEventApi, AttendItem, UpcomingEvent } from "@/lib/upcomingEventApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   UPCOMING EVENT & COUNTDOWN — the event banner with the live
   countdown on the website home page. Loads from and saves straight
   to backend-arogya (images go to Cloudinary), so it has its own
   Save button — page sections are only stored locally.
========================================================= */

const MAX_ITEMS = 8;
const LINK_PATTERN = /^(\/|https?:\/\/)/;

const EMPTY: UpcomingEvent = {
  eyebrow: "Upcoming Event",
  title: "",
  subtitle: "",
  description: "",
  dateInfo: "",
  venueInfo: "",
  delegatesInfo: "",
  countriesInfo: "",
  countdownHeading: "The Countdown Has Begun!",
  targetDate: "",
  attendHeading: "Why You Should Attend",
  attendItems: [],
  attendImage: "",
  attendImageAlt: "",
  ctaLabel: "",
  ctaHref: "",
  ctaNewTab: true,
  backgroundImage: "",
  backgroundImageAlt: "",
};

function Panel({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-white p-[12px]">
      <div className="border-b border-gray-100 pb-1.5">
        <div className="text-[11px] font-bold text-[#1e40af]">{title}</div>
        {note && <p className="mt-[2px] text-[10px] text-[#64748b]">{note}</p>}
      </div>
      {children}
    </div>
  );
}

/** How long until the target (India time), for the hint under the date picker */
const countdownHint = (target: string) => {
  const ms = Date.parse(`${target}:00+05:30`);
  if (!target || Number.isNaN(ms)) return "Pick the date and time the countdown runs to (India time).";
  const diff = ms - Date.now();
  if (diff <= 0) return "This date has passed — the website countdown shows 0 0 0 0. Pick the next event date.";
  const days = Math.floor(diff / 86400000);
  return `Website countdown: ${days} day${days === 1 ? "" : "s"} to go (India time).`;
};

export function UpcomingEventEditor() {
  const [data, setData] = useState<UpcomingEvent>(EMPTY);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    upcomingEventApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
        else setIsSaved(false);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load this section."))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof UpcomingEvent>(key: K, value: UpcomingEvent[K]) => setData((prev) => ({ ...prev, [key]: value }));
  const updateItem = <K extends keyof AttendItem>(i: number, key: K, value: AttendItem[K]) =>
    set("attendItems", data.attendItems.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)));
  const moveItem = (i: number, direction: -1 | 1) => {
    const target = i + direction;
    if (target < 0 || target >= data.attendItems.length) return;
    const items = [...data.attendItems];
    [items[i], items[target]] = [items[target], items[i]];
    set("attendItems", items);
  };

  const validate = (): string | null => {
    if (!data.eyebrow.trim()) return "Enter the eyebrow.";
    if (!data.title.trim()) return "Enter the title.";
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(data.targetDate)) return "Pick the countdown date and time.";
    for (const [i, it] of data.attendItems.entries()) if (!it.text.trim()) return `Checklist item ${i + 1}: enter the text.`;
    if (data.attendImage && !data.attendImageAlt.trim()) return "Enter the Why Attend image alt text.";
    if (data.ctaLabel.trim() && !data.ctaHref.trim()) return "Enter the button link.";
    if (data.ctaHref.trim() && !LINK_PATTERN.test(data.ctaHref.trim())) return "Button link must start with / or http(s)://";
    if (!data.backgroundImage.trim()) return "Upload a background image.";
    if (!data.backgroundImageAlt.trim()) return "Enter the background image alt text.";
    return null;
  };

  const save = async () => {
    const problem = validate();
    if (problem) return setError(problem);
    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await upcomingEventApi.save({
        ...input,
        ctaHref: input.ctaHref.trim(),
        attendItems: input.attendItems.map(({ _id, ...it }) => it),
      });
      setData({ ...EMPTY, ...saved });
      setIsSaved(true);
      showSuccess("Upcoming Event saved. The website updates within 30 seconds.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save this section.";
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
        Loading Upcoming Event...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {!isSaved && (
        <span className="w-fit rounded-[3px] border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
          NOT SAVED YET
        </span>
      )}

      <Panel title="Heading & Text">
        <div className="grid grid-cols-[1fr_2fr] gap-[10px]">
          <div>
            <FieldLabel required>Eyebrow</FieldLabel>
            <TextInput value={data.eyebrow} onChange={(v) => set("eyebrow", v)} maxLength={30} />
          </div>
          <div>
            <FieldLabel required>Title (H1)</FieldLabel>
            <TextInput value={data.title} onChange={(v) => set("title", v)} maxLength={45} />
          </div>
        </div>
        <div>
          <FieldLabel>Subtitle</FieldLabel>
          <TextInput value={data.subtitle} onChange={(v) => set("subtitle", v.toUpperCase())} maxLength={95} />
        </div>
        <div>
          <FieldLabel>Description</FieldLabel>
          <Textarea value={data.description} onChange={(v) => set("description", v)} rows={3} maxLength={300} />
          <p className="mt-[2px] text-[10px] text-[#64748b]">Press Enter for a new line on the website.</p>
        </div>
      </Panel>

      <Panel title="Info Row" note="Two lines each (press Enter). A number on the first line — like 1000+ — counts up on the website. Leave one empty to hide it.">
        <div className="grid grid-cols-4 gap-[10px]">
          {([
            ["dateInfo", "Event Dates", Calendar, 45],
            ["venueInfo", "Venue", MapPin, 50],
            ["delegatesInfo", "Delegates", Users, 30],
            ["countriesInfo", "Countries", Globe, 30],
          ] as const).map(([key, label, Icon, max]) => (
            <div key={key}>
              <FieldLabel>
                <span className="inline-flex items-center gap-[4px]">
                  <Icon className="h-3 w-3 text-[#001810]" /> {label}
                </span>
              </FieldLabel>
              <Textarea value={data[key]} onChange={(v) => set(key, v.toUpperCase())} rows={2} maxLength={max} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Countdown">
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel>Countdown Heading</FieldLabel>
            <TextInput value={data.countdownHeading} onChange={(v) => set("countdownHeading", v)} maxLength={45} />
          </div>
          <div>
            <FieldLabel required>Countdown Target (India time)</FieldLabel>
            <input
              type="datetime-local"
              value={data.targetDate}
              onChange={(e) => set("targetDate", e.target.value)}
              className="h-[35px] w-full rounded border border-[#cbd5e1] bg-white px-2.5 text-[12px] text-[#1e293b] focus:border-[#0f766e] focus:outline-none"
            />
            <p className={`mt-[3px] text-[10px] ${Date.parse(`${data.targetDate}:00+05:30`) < Date.now() ? "font-semibold text-amber-700" : "text-[#64748b]"}`}>
              {countdownHint(data.targetDate)}
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="Why You Should Attend">
        <div className="grid grid-cols-[1fr_auto] items-end gap-[10px]">
          <div>
            <FieldLabel>Heading</FieldLabel>
            <TextInput value={data.attendHeading} onChange={(v) => set("attendHeading", v)} maxLength={45} />
          </div>
          <button
            type="button"
            onClick={() => set("attendItems", [...data.attendItems, { text: "", isActive: true }])}
            disabled={data.attendItems.length >= MAX_ITEMS}
            className="inline-flex h-[35px] items-center gap-[5px] border border-dashed border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] transition hover:bg-[#ccfbf1] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3 w-3" /> Add Checklist Item
          </button>
        </div>
        {data.attendItems.map((item, i) => (
          <div key={item._id ?? `item-${i}`} className="flex items-center gap-[8px]">
            <span className="w-[18px] text-center text-[11px] font-bold text-[#cba344]">✓</span>
            <div className="min-w-0 flex-1">
              <TextInput value={item.text} onChange={(v) => updateItem(i, "text", v)} placeholder="Gain insights from global leaders" maxLength={70} />
            </div>
            <Toggle checked={item.isActive} onChange={(v) => updateItem(i, "isActive", v)} />
            <button type="button" title="Move up" disabled={i === 0} onClick={() => moveItem(i, -1)}
              className="grid h-[30px] w-[30px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
              <ArrowUp className="h-3 w-3" />
            </button>
            <button type="button" title="Move down" disabled={i === data.attendItems.length - 1} onClick={() => moveItem(i, 1)}
              className="grid h-[30px] w-[30px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
              <ArrowDown className="h-3 w-3" />
            </button>
            <button type="button" title="Remove" onClick={() => set("attendItems", data.attendItems.filter((_, idx) => idx !== i))}
              className="grid h-[30px] w-[30px] place-items-center border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        <div className="grid grid-cols-[1.4fr_1fr] gap-[10px]">
          <CloudImageField upload={upcomingEventApi.upload} label="Box Decoration Image" value={data.attendImage}
            onChange={(v) => set("attendImage", v)} hint="Faint lotus in the box corner" previewClass="h-[60px] w-[60px]" />
          <div>
            <FieldLabel required={Boolean(data.attendImage)}>Decoration Image Alt Text</FieldLabel>
            <TextInput value={data.attendImageAlt} onChange={(v) => set("attendImageAlt", v)} placeholder="Gold decorative lotus" maxLength={150} />
          </div>
        </div>
      </Panel>

      <Panel title="Button" note="Leave the label empty to hide the button.">
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel>Button Label</FieldLabel>
            <TextInput value={data.ctaLabel} onChange={(v) => set("ctaLabel", v)} placeholder="Register as Delegate" maxLength={30} />
          </div>
          <div>
            <FieldLabel required={Boolean(data.ctaLabel)}>Button Link</FieldLabel>
            <TextInput value={data.ctaHref} onChange={(v) => set("ctaHref", v)} placeholder="/delegate-registration or https://..." maxLength={300} />
          </div>
        </div>
        <div className="flex items-center gap-[8px]">
          <Toggle checked={data.ctaNewTab} onChange={(v) => set("ctaNewTab", v)} />
          <span className="text-[11px] text-[#475569]">Open link in a new tab</span>
        </div>
      </Panel>

      <Panel title="Background Image" note="Wide banner — keep the left side plain so the text stays readable.">
        <CloudImageField upload={upcomingEventApi.upload} label="Background Image" required value={data.backgroundImage}
          onChange={(v) => set("backgroundImage", v)} hint="About 1800 × 900 px, up to 5 MB" previewClass="h-[70px] w-[140px]" />
        <div>
          <FieldLabel required>Background Image Alt Text</FieldLabel>
          <TextInput value={data.backgroundImageAlt} onChange={(v) => set("backgroundImageAlt", v)}
            placeholder="Describe what the background shows (for SEO & screen readers)" maxLength={150} />
        </div>
      </Panel>

      {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}

      <div className="flex items-center justify-end gap-[10px]">
        {data.updatedAt && data.updatedBy !== "seed" && (
          <span className="text-[10px] text-[#64748b]">
            Last saved {new Date(data.updatedAt).toLocaleString("en-IN")}
            {data.updatedBy ? ` by ${data.updatedBy}` : ""}
          </span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex h-[32px] items-center gap-1.5 rounded-[4px] bg-[#16a34a] px-[14px] text-[12px] font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save Upcoming Event
        </button>
      </div>
    </div>
  );
}
