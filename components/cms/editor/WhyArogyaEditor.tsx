"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { FieldLabel, Textarea, TextInput, Toggle } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import {
  whyArogyaApi,
  TrackColor,
  WhyArogya,
  WhyArogyaBenefit,
  WhyArogyaTrack,
} from "@/lib/whyArogyaApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   WHY AROGYA & CONFERENCE TRACKS — the two panels under the
   "Supported By" strip on the website home page. Loads from and
   saves straight to backend-arogya (images go to Cloudinary), so
   it has its own Save button — page sections are only stored locally.
========================================================= */

const MAX_BENEFITS = 8;
const MAX_TRACKS = 12;

/* Same colours as the website's track medallions (frontend WhyArogyaAndTracks) */
const TRACK_COLORS: { value: TrackColor; label: string; text: string; ring: string; bg: string }[] = [
  { value: "green", label: "Green", text: "#0f5433", ring: "#b2d3c2", bg: "#e1efe8" },
  { value: "blue", label: "Blue", text: "#1a4f8b", ring: "#b5cce7", bg: "#e2ebf5" },
  { value: "purple", label: "Purple", text: "#632ca6", ring: "#ceb3eb", bg: "#ece0f7" },
  { value: "lime", label: "Leaf Green", text: "#3d7a1f", ring: "#c2ddb2", bg: "#e7f0e2" },
  { value: "brown", label: "Brown", text: "#7a541a", ring: "#dfc299", bg: "#f2e7d5" },
  { value: "teal", label: "Teal", text: "#0f5c54", ring: "#b2dbd5", bg: "#e1f0f5" },
];
const COLOR_BY_VALUE = Object.fromEntries(TRACK_COLORS.map((c) => [c.value, c]));

const EMPTY: WhyArogya = {
  leftHeading: "WHY AROGYA SANGHOSTHI?",
  leftHeadingImage: "",
  leftHeadingImageAlt: "Arogya Sangoshthi lotus logo",
  rightHeading: "CONFERENCE TRACKS",
  rightHeadingImage: "",
  rightHeadingImageAlt: "Arogya Sangoshthi lotus logo",
  benefits: [],
  tracks: [],
};

const newBenefit = (): WhyArogyaBenefit => ({ title: "", text: "", image: "", imageAlt: "", isActive: true });
const newTrack = (): WhyArogyaTrack => ({ label: "", image: "", imageAlt: "", color: "green", isActive: true });

/* ---------- Card shell shared by benefits & tracks ---------- */
function ItemCard({
  title,
  preview,
  isActive,
  onActive,
  onUp,
  onDown,
  onRemove,
  children,
}: {
  title: string;
  preview: ReactNode;
  isActive: boolean;
  onActive: (v: boolean) => void;
  onUp?: () => void;
  onDown?: () => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-white p-[12px]">
      <div className="flex items-center gap-[10px]">
        {preview}
        <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-[#4B1426]">{title}</span>
        <span className={`text-[10px] font-bold ${isActive ? "text-[#16a34a]" : "text-[#dc2626]"}`}>{isActive ? "Shown" : "Hidden"}</span>
        <Toggle checked={isActive} onChange={onActive} />
        <button type="button" title="Move up" disabled={!onUp} onClick={onUp}
          className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
          <ArrowUp className="h-3 w-3" />
        </button>
        <button type="button" title="Move down" disabled={!onDown} onClick={onDown}
          className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
          <ArrowDown className="h-3 w-3" />
        </button>
        <button type="button" title="Remove" onClick={onRemove}
          className="grid h-[26px] w-[26px] place-items-center border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      {children}
    </div>
  );
}

function ListHeader({ title, count, shown, addLabel, onAdd, disabled }: {
  title: string; count: number; shown: number; addLabel: string; onAdd: () => void; disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-[12px] font-bold text-[#334155]">
        {title} <span className="font-medium text-[#64748b]">({count} total, {shown} shown)</span>
      </div>
      <button type="button" onClick={onAdd} disabled={disabled}
        className="inline-flex h-[30px] items-center gap-[5px] border border-dashed border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] transition hover:bg-[#ccfbf1] disabled:cursor-not-allowed disabled:opacity-40">
        <Plus className="h-3 w-3" /> {addLabel}
      </button>
    </div>
  );
}

const move = <T,>(list: T[], index: number, direction: -1 | 1): T[] => {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

export function WhyArogyaEditor() {
  const [data, setData] = useState<WhyArogya>(EMPTY);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    whyArogyaApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
        else {
          setData({ ...EMPTY, benefits: [newBenefit()], tracks: [newTrack()] });
          setIsSaved(false);
        }
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load this section."))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof WhyArogya>(key: K, value: WhyArogya[K]) => setData((prev) => ({ ...prev, [key]: value }));

  const updateBenefit = <K extends keyof WhyArogyaBenefit>(i: number, key: K, value: WhyArogyaBenefit[K]) =>
    setData((prev) => ({ ...prev, benefits: prev.benefits.map((b, idx) => (idx === i ? { ...b, [key]: value } : b)) }));
  const updateTrack = <K extends keyof WhyArogyaTrack>(i: number, key: K, value: WhyArogyaTrack[K]) =>
    setData((prev) => ({ ...prev, tracks: prev.tracks.map((t, idx) => (idx === i ? { ...t, [key]: value } : t)) }));

  const validate = (): string | null => {
    if (!data.leftHeading.trim()) return "Enter the left heading.";
    if (!data.rightHeading.trim()) return "Enter the right heading.";
    if (data.leftHeadingImage && !data.leftHeadingImageAlt.trim()) return "Left heading image: enter the alt text.";
    if (data.rightHeadingImage && !data.rightHeadingImageAlt.trim()) return "Right heading image: enter the alt text.";
    if (!data.benefits.length) return "Add at least one benefit.";
    for (const [i, b] of data.benefits.entries()) {
      if (!b.title.trim()) return `Benefit ${i + 1}: enter the title.`;
      if (b.image && !b.imageAlt.trim()) return `Benefit ${i + 1}: enter the image alt text.`;
    }
    if (!data.tracks.length) return "Add at least one track.";
    for (const [i, t] of data.tracks.entries()) {
      if (!t.label.trim()) return `Track ${i + 1}: enter the label.`;
      if (t.image && !t.imageAlt.trim()) return `Track ${i + 1}: enter the image alt text.`;
    }
    return null;
  };

  const save = async () => {
    const problem = validate();
    if (problem) return setError(problem);
    setSaving(true);
    setError("");
    try {
      const strip = <T extends { _id?: string }>({ _id, ...rest }: T) => rest;
      const saved = await whyArogyaApi.save({
        ...data,
        leftHeading: data.leftHeading.trim(),
        rightHeading: data.rightHeading.trim(),
        benefits: data.benefits.map((b) => strip(b) as WhyArogyaBenefit),
        tracks: data.tracks.map((t) => strip(t) as WhyArogyaTrack),
      });
      setData({ ...EMPTY, ...saved });
      setIsSaved(true);
      showSuccess("Why Arogya & Conference Tracks saved. The website updates within 30 seconds.");
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
        Loading Why Arogya & Conference Tracks...
      </div>
    );
  }

  const headingBlock = (side: "left" | "right") => {
    const heading = side === "left" ? "leftHeading" : "rightHeading";
    const image = side === "left" ? "leftHeadingImage" : "rightHeadingImage";
    const alt = side === "left" ? "leftHeadingImageAlt" : "rightHeadingImageAlt";
    return (
      <div className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-white p-[12px]">
        <div className="text-[11px] font-bold text-[#1e40af]">{side === "left" ? "Left Panel — Why Arogya" : "Right Panel — Conference Tracks"}</div>
        <div>
          <FieldLabel required>Heading</FieldLabel>
          <TextInput value={data[heading]} onChange={(v) => set(heading, v)} maxLength={40} />
        </div>
        <CloudImageField
          upload={whyArogyaApi.upload}
          label="Image above the heading"
          value={data[image]}
          onChange={(v) => set(image, v)}
          hint="Small lotus / logo icon"
          previewClass="h-[60px] w-[60px]"
        />
        <div>
          <FieldLabel required={Boolean(data[image])}>Image Alt Text</FieldLabel>
          <TextInput value={data[alt]} onChange={(v) => set(alt, v)} placeholder="Arogya Sangoshthi lotus logo" maxLength={150} />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {!isSaved && (
        <span className="w-fit rounded-[3px] border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
          NOT SAVED YET
        </span>
      )}

      <div className="grid grid-cols-2 gap-[12px]">
        {headingBlock("left")}
        {headingBlock("right")}
      </div>

      {/* BENEFITS */}
      <ListHeader
        title="Why Arogya Benefits"
        count={data.benefits.length}
        shown={data.benefits.filter((b) => b.isActive).length}
        addLabel="Add Benefit"
        onAdd={() => set("benefits", [...data.benefits, newBenefit()])}
        disabled={data.benefits.length >= MAX_BENEFITS}
      />
      {data.benefits.map((b, i) => (
        <ItemCard
          key={b._id ?? `benefit-${i}`}
          title={b.title || `Benefit ${i + 1}`}
          preview={
            <div className="grid h-[34px] w-[34px] shrink-0 place-items-center overflow-hidden rounded-[6px] border border-[#ebe7da] bg-[#f5f2e6]">
              {b.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.image} alt="" className="h-[24px] w-auto object-contain" />
              )}
            </div>
          }
          isActive={b.isActive}
          onActive={(v) => updateBenefit(i, "isActive", v)}
          onUp={i > 0 ? () => set("benefits", move(data.benefits, i, -1)) : undefined}
          onDown={i < data.benefits.length - 1 ? () => set("benefits", move(data.benefits, i, 1)) : undefined}
          onRemove={() => set("benefits", data.benefits.filter((_, idx) => idx !== i))}
        >
          <div className="grid grid-cols-[1fr_1.4fr] gap-[10px]">
            <div>
              <FieldLabel required>Title</FieldLabel>
              <TextInput value={b.title} onChange={(v) => updateBenefit(i, "title", v.toUpperCase())} placeholder="INTEGRATED HEALTHCARE" maxLength={30} />
            </div>
            <div>
              <FieldLabel>Text</FieldLabel>
              <Textarea value={b.text} onChange={(v) => updateBenefit(i, "text", v)} rows={2} maxLength={130} />
            </div>
          </div>
          <div className="grid grid-cols-[1.4fr_1fr] gap-[10px]">
            <CloudImageField upload={whyArogyaApi.upload} label="Icon Image" value={b.image}
              onChange={(v) => updateBenefit(i, "image", v)} hint="Square icon, transparent background" previewClass="h-[60px] w-[60px]" />
            <div>
              <FieldLabel required={Boolean(b.image)}>Image Alt Text</FieldLabel>
              <TextInput value={b.imageAlt} onChange={(v) => updateBenefit(i, "imageAlt", v)} placeholder="Describe the icon" maxLength={150} />
            </div>
          </div>
        </ItemCard>
      ))}

      {/* TRACKS */}
      <ListHeader
        title="Conference Tracks"
        count={data.tracks.length}
        shown={data.tracks.filter((t) => t.isActive).length}
        addLabel="Add Track"
        onAdd={() => set("tracks", [...data.tracks, newTrack()])}
        disabled={data.tracks.length >= MAX_TRACKS}
      />
      {data.tracks.map((t, i) => {
        const color = COLOR_BY_VALUE[t.color] ?? TRACK_COLORS[0];
        return (
          <ItemCard
            key={t._id ?? `track-${i}`}
            title={t.label.replace(/\n/g, " ") || `Track ${i + 1}`}
            preview={
              <div
                className="grid h-[34px] w-[34px] shrink-0 place-items-center overflow-hidden rounded-full border-2"
                style={{ borderColor: color.ring, background: color.bg }}
              >
                {t.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.image} alt="" className="h-[20px] w-auto object-contain" />
                )}
              </div>
            }
            isActive={t.isActive}
            onActive={(v) => updateTrack(i, "isActive", v)}
            onUp={i > 0 ? () => set("tracks", move(data.tracks, i, -1)) : undefined}
            onDown={i < data.tracks.length - 1 ? () => set("tracks", move(data.tracks, i, 1)) : undefined}
            onRemove={() => set("tracks", data.tracks.filter((_, idx) => idx !== i))}
          >
            <div className="grid grid-cols-[1fr_1.4fr] gap-[10px]">
              <div>
                <FieldLabel required>Label</FieldLabel>
                <Textarea value={t.label} onChange={(v) => updateTrack(i, "label", v.toUpperCase())} rows={2} maxLength={40} />
                <p className="mt-[2px] text-[10px] text-[#64748b]">Press Enter to put the rest on a second line.</p>
              </div>
              <div>
                <FieldLabel>Colour</FieldLabel>
                <div className="flex flex-wrap gap-[6px]">
                  {TRACK_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => updateTrack(i, "color", c.value)}
                      className={`flex h-[30px] items-center gap-[6px] rounded-[5px] border px-[8px] text-[10px] font-bold transition ${
                        t.color === c.value ? "shadow-[0_0_0_1px_currentColor]" : "border-[#e2e8f0] hover:bg-slate-50"
                      }`}
                      style={{ color: c.text, borderColor: t.color === c.value ? c.text : undefined }}
                    >
                      <span className="h-[12px] w-[12px] rounded-full border-2" style={{ borderColor: c.ring, background: c.bg }} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[1.4fr_1fr] gap-[10px]">
              <CloudImageField upload={whyArogyaApi.upload} label="Icon Image" value={t.image}
                onChange={(v) => updateTrack(i, "image", v)} hint="Square icon, transparent background" previewClass="h-[60px] w-[60px]" />
              <div>
                <FieldLabel required={Boolean(t.image)}>Image Alt Text</FieldLabel>
                <TextInput value={t.imageAlt} onChange={(v) => updateTrack(i, "imageAlt", v)} placeholder="Describe the icon" maxLength={150} />
              </div>
            </div>
          </ItemCard>
        );
      })}

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
          Save Why Arogya & Tracks
        </button>
      </div>
    </div>
  );
}
