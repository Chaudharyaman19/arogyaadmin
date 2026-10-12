"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { FieldLabel, Textarea, TextInput, Toggle } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { paperDatesApi, PaperDate, PaperImportantDates } from "@/lib/paperPresentationApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   IMPORTANT DATES & WHY PRESENT — the dark green timeline and
   the "Why Present?" card on the website Paper Presentation page.
   Loads from and saves straight to backend-arogya (images go to
   Cloudinary), so it has its own Save button — page sections are
   only stored locally.
========================================================= */

const MAX_DATES = 8;
const MAX_REASONS = 8;

const EMPTY: PaperImportantDates = {
  heading: "IMPORTANT DATES",
  headingIcon: "",
  headingIconAlt: "Green leaf sprig decoration",
  dates: [],
  whyHeading: "WHY PRESENT?",
  whyLeafImage: "",
  whyLeafImageAlt: "Green leaf vine decoration",
  reasons: [],
};
const newDate = (): PaperDate => ({ label: "", date: "", icon: "", iconAlt: "", isActive: true });
const oneLine = (text: string) => text.replace(/\n/g, " ");

const swap = <T,>(list: T[], index: number, direction: -1 | 1): T[] => {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

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

function AddButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-[28px] shrink-0 items-center gap-[5px] border border-dashed border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] transition hover:bg-[#ccfbf1] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Plus className="h-3 w-3" /> {label}
    </button>
  );
}

function RowButtons({ index, total, active, onActive, onMove, onRemove, title }: {
  index: number; total: number; active: boolean; onActive: (v: boolean) => void; onMove: (d: -1 | 1) => void; onRemove: () => void; title: string;
}) {
  return (
    <div className="ml-auto flex items-center gap-[6px]">
      <span className={`text-[10px] font-bold ${active ? "text-[#16a34a]" : "text-[#dc2626]"}`}>{active ? "Shown" : "Hidden"}</span>
      <Toggle checked={active} onChange={onActive} />
      <button type="button" title="Move up" disabled={index === 0} onClick={() => onMove(-1)}
        className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
        <ArrowUp className="h-3 w-3" />
      </button>
      <button type="button" title="Move down" disabled={index === total - 1} onClick={() => onMove(1)}
        className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
        <ArrowDown className="h-3 w-3" />
      </button>
      <button type="button" title={title} onClick={onRemove}
        className="grid h-[26px] w-[26px] place-items-center border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

export function PaperDatesEditor() {
  const [data, setData] = useState<PaperImportantDates>(EMPTY);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    paperDatesApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
        else setIsSaved(false);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load Important Dates."))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof PaperImportantDates>(key: K, value: PaperImportantDates[K]) => setData((prev) => ({ ...prev, [key]: value }));
  const setDate = (index: number, patch: Partial<PaperDate>) => set("dates", data.dates.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  const setReason = (index: number, patch: Partial<PaperImportantDates["reasons"][number]>) =>
    set("reasons", data.reasons.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const save = async () => {
    if (!data.heading.trim()) return setError("Enter the heading.");
    if (data.headingIcon && !data.headingIconAlt.trim()) return setError("Enter the alt text of the heading icon.");
    if (data.whyLeafImage && !data.whyLeafImageAlt.trim()) return setError("Enter the alt text of the leaf image.");
    for (const [i, d] of data.dates.entries()) {
      const name = oneLine(d.label) || `Date ${i + 1}`;
      if (!d.label.trim()) return setError(`Date ${i + 1}: enter the label.`);
      if (!d.date.trim()) return setError(`${name}: enter the date.`);
      if (d.icon && !d.iconAlt.trim()) return setError(`${name}: enter the icon alt text.`);
    }
    for (const [i, r] of data.reasons.entries()) {
      if (!r.text.trim()) return setError(`Reason ${i + 1}: enter the text.`);
    }

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await paperDatesApi.save(input);
      setData({ ...EMPTY, ...saved });
      setIsSaved(true);
      showSuccess("Important Dates & Why Present saved. The website updates within 30 seconds.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save Important Dates.";
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
        Loading Important Dates...
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

      <Panel
        title={`Important Dates (${data.dates.length} total, ${data.dates.filter((d) => d.isActive).length} shown)`}
        note="Press Enter in a label to put the rest on a second line."
        action={<AddButton label="Add Date" onClick={() => set("dates", [...data.dates, newDate()])} disabled={data.dates.length >= MAX_DATES} />}
      >
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-[10px]">
          <div>
            <FieldLabel required>Heading</FieldLabel>
            <TextInput value={data.heading} onChange={(v) => set("heading", v.toUpperCase())} maxLength={30} />
          </div>
          <CloudImageField
            upload={paperDatesApi.upload}
            label="Heading Icon (both sides)"
            value={data.headingIcon}
            onChange={(v) => set("headingIcon", v)}
            hint="Transparent"
            previewClass="h-[40px] w-[40px]"
          />
          <div>
            <FieldLabel required={Boolean(data.headingIcon)}>Heading Icon Alt Text</FieldLabel>
            <TextInput value={data.headingIconAlt} onChange={(v) => set("headingIconAlt", v)} maxLength={150} />
          </div>
        </div>

        {data.dates.map((item, index) => (
          <div key={index} className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-[#fbfbfa] p-[10px]">
            <div className="flex items-center gap-[8px]">
              {item.icon && <img src={item.icon} alt="" className="h-[22px] w-[22px] object-contain" />}
              <span className="text-[11px] font-bold text-[#4B1426]">
                {item.label ? `${oneLine(item.label)}${item.date ? ` — ${item.date}` : ""}` : `Date ${index + 1}`}
              </span>
              <RowButtons
                index={index}
                total={data.dates.length}
                active={item.isActive}
                onActive={(v) => setDate(index, { isActive: v })}
                onMove={(d) => set("dates", swap(data.dates, index, d))}
                onRemove={() => set("dates", data.dates.filter((_, i) => i !== index))}
                title="Remove date"
              />
            </div>
            <div className="grid grid-cols-[2fr_1fr] gap-[10px]">
              <div>
                <FieldLabel required>Label</FieldLabel>
                <Textarea value={item.label} onChange={(v) => setDate(index, { label: v })} rows={2} maxLength={65} />
              </div>
              <div>
                <FieldLabel required>Date</FieldLabel>
                <TextInput value={item.date} onChange={(v) => setDate(index, { date: v })} placeholder="25 May 2026" maxLength={25} />
              </div>
            </div>
            <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
              <CloudImageField
                upload={paperDatesApi.upload}
                label="Icon"
                value={item.icon}
                onChange={(v) => setDate(index, { icon: v })}
                hint="Round icon, transparent"
                previewClass="h-[48px] w-[48px]"
              />
              <div>
                <FieldLabel required={Boolean(item.icon)}>Icon Alt Text</FieldLabel>
                <TextInput value={item.iconAlt} onChange={(v) => setDate(index, { iconAlt: v })} placeholder="Abstract Submission Starts icon" maxLength={150} />
              </div>
            </div>
          </div>
        ))}
      </Panel>

      <Panel
        title={`Why Present? (${data.reasons.length} total, ${data.reasons.filter((r) => r.isActive).length} shown)`}
        note="The light card on the right of the dates."
        action={<AddButton label="Add Reason" onClick={() => set("reasons", [...data.reasons, { text: "", isActive: true }])} disabled={data.reasons.length >= MAX_REASONS} />}
      >
        <div>
          <FieldLabel>Why Heading</FieldLabel>
          <TextInput value={data.whyHeading} onChange={(v) => set("whyHeading", v.toUpperCase())} maxLength={20} />
        </div>
        {data.reasons.map((reason, index) => (
          <div key={index} className="flex items-center gap-[8px]">
            <div className="flex-1">
              <TextInput value={reason.text} onChange={(v) => setReason(index, { text: v })} placeholder="Share your innovative research with a global audience" maxLength={120} />
            </div>
            <RowButtons
              index={index}
              total={data.reasons.length}
              active={reason.isActive}
              onActive={(v) => setReason(index, { isActive: v })}
              onMove={(d) => set("reasons", swap(data.reasons, index, d))}
              onRemove={() => set("reasons", data.reasons.filter((_, i) => i !== index))}
              title="Remove reason"
            />
          </div>
        ))}
        <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
          <CloudImageField
            upload={paperDatesApi.upload}
            label="Leaf Decoration"
            value={data.whyLeafImage}
            onChange={(v) => set("whyLeafImage", v)}
            hint="Transparent PNG"
            previewClass="h-[48px] w-[48px]"
          />
          <div>
            <FieldLabel required={Boolean(data.whyLeafImage)}>Leaf Alt Text</FieldLabel>
            <TextInput value={data.whyLeafImageAlt} onChange={(v) => set("whyLeafImageAlt", v)} maxLength={150} />
          </div>
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
          Save Important Dates
        </button>
      </div>
    </div>
  );
}
