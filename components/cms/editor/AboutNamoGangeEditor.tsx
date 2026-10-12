"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { FieldLabel, Textarea, TextInput, Toggle } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { aboutNamoGangeApi, AboutNamoGange } from "@/lib/aboutNamoGangeApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   ABOUT NAMO GANGE TRUST — text + highlights on the left and
   the photo with the Vision / Mission card on the right, on the
   website About Us page. Loads from and saves straight to
   backend-arogya (images go to Cloudinary), so it has its own
   Save button — page sections are only stored locally.
========================================================= */

const MAX_HIGHLIGHTS = 6;

const EMPTY: AboutNamoGange = {
  heading: "ABOUT NAMO GANGE TRUST",
  subheading: "",
  paragraph: "",
  highlights: [],
  bulletIcon: "",
  bulletIconAlt: "Green lotus bullet icon",
  image: "",
  imageAlt: "",
  visionTitle: "Our Vision",
  visionText: "",
  missionTitle: "Our Mission",
  missionText: "",
  leafImage: "",
  leafImageAlt: "Decorative green leaves",
};

function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
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

export function AboutNamoGangeEditor() {
  const [data, setData] = useState<AboutNamoGange>(EMPTY);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    aboutNamoGangeApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
        else setIsSaved(false);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load About Namo Gange Trust."))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof AboutNamoGange>(key: K, value: AboutNamoGange[K]) => setData((prev) => ({ ...prev, [key]: value }));
  const setHighlight = (index: number, patch: Partial<AboutNamoGange["highlights"][number]>) =>
    set("highlights", data.highlights.map((h, i) => (i === index ? { ...h, ...patch } : h)));
  const moveHighlight = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= data.highlights.length) return;
    const next = [...data.highlights];
    [next[index], next[target]] = [next[target], next[index]];
    set("highlights", next);
  };

  const save = async () => {
    if (!data.heading.trim()) return setError("Enter the heading.");
    for (const [i, h] of data.highlights.entries()) {
      if (!h.text.trim()) return setError(`Highlight ${i + 1}: enter the text.`);
    }
    if (data.bulletIcon && !data.bulletIconAlt.trim()) return setError("Enter the alt text of the bullet icon.");
    if (!data.image.trim()) return setError("Upload the photo.");
    if (!data.imageAlt.trim()) return setError("Enter the photo alt text.");
    if (data.leafImage && !data.leafImageAlt.trim()) return setError("Enter the alt text of the leaf image.");

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await aboutNamoGangeApi.save(input);
      setData({ ...EMPTY, ...saved });
      setIsSaved(true);
      showSuccess("About Namo Gange Trust saved. The website updates within 30 seconds.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save About Namo Gange Trust.";
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
        Loading About Namo Gange Trust...
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

      <Panel title="Heading & Text" note="Left side of the section.">
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel required>Heading</FieldLabel>
            <TextInput value={data.heading} onChange={(v) => set("heading", v.toUpperCase())} maxLength={35} />
          </div>
          <div>
            <FieldLabel>Subheading</FieldLabel>
            <TextInput value={data.subheading} onChange={(v) => set("subheading", v)} maxLength={70} />
          </div>
        </div>
        <div>
          <FieldLabel>Paragraph</FieldLabel>
          <Textarea value={data.paragraph} onChange={(v) => set("paragraph", v)} rows={4} maxLength={520} />
        </div>
      </Panel>

      <Panel title="Key Highlights" note="The lines with the lotus icon under the paragraph. Hidden lines stay saved but are not shown.">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#64748b]">
            {data.highlights.length} total, {data.highlights.filter((h) => h.isActive).length} shown
          </span>
          <button
            type="button"
            onClick={() => set("highlights", [...data.highlights, { text: "", isActive: true }])}
            disabled={data.highlights.length >= MAX_HIGHLIGHTS}
            className="inline-flex h-[30px] items-center gap-[5px] border border-dashed border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] transition hover:bg-[#ccfbf1] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3 w-3" /> Add Highlight
          </button>
        </div>
        {data.highlights.map((h, index) => (
          <div key={index} className="flex items-center gap-[8px]">
            <div className="flex-1">
              <TextInput value={h.text} onChange={(v) => setHighlight(index, { text: v })} placeholder="Established with a vision for healthier communities" maxLength={75} />
            </div>
            <Toggle checked={h.isActive} onChange={(v) => setHighlight(index, { isActive: v })} />
            <button type="button" title="Move up" disabled={index === 0} onClick={() => moveHighlight(index, -1)}
              className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
              <ArrowUp className="h-3 w-3" />
            </button>
            <button type="button" title="Move down" disabled={index === data.highlights.length - 1} onClick={() => moveHighlight(index, 1)}
              className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
              <ArrowDown className="h-3 w-3" />
            </button>
            <button type="button" title="Remove highlight" onClick={() => set("highlights", data.highlights.filter((_, i) => i !== index))}
              className="grid h-[26px] w-[26px] place-items-center border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
        <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
          <CloudImageField
            upload={aboutNamoGangeApi.upload}
            label="Bullet Icon"
            value={data.bulletIcon}
            onChange={(v) => set("bulletIcon", v)}
            hint="Small icon, transparent background"
            previewClass="h-[48px] w-[48px]"
          />
          <div>
            <FieldLabel required={Boolean(data.bulletIcon)}>Bullet Icon Alt Text</FieldLabel>
            <TextInput value={data.bulletIconAlt} onChange={(v) => set("bulletIconAlt", v)} maxLength={150} />
          </div>
        </div>
      </Panel>

      <Panel title="Photo with Vision & Mission" note="Right side — the card sits over the bottom of the photo. Press Enter in the mission text for a new line (desktop).">
        <CloudImageField
          upload={aboutNamoGangeApi.upload}
          label="Photo"
          required
          value={data.image}
          onChange={(v) => set("image", v)}
          hint="Landscape, about 1000 × 670 px, up to 5 MB"
          previewClass="h-[70px] w-[110px]"
        />
        <div>
          <FieldLabel required>Photo Alt Text</FieldLabel>
          <TextInput value={data.imageAlt} onChange={(v) => set("imageAlt", v)} placeholder="Describe what the photo shows (for SEO & screen readers)" maxLength={150} />
        </div>
        <div className="grid grid-cols-[1fr_2fr] gap-[10px]">
          <div>
            <FieldLabel>Vision Title</FieldLabel>
            <TextInput value={data.visionTitle} onChange={(v) => set("visionTitle", v)} maxLength={20} />
          </div>
          <div>
            <FieldLabel>Vision Text</FieldLabel>
            <TextInput value={data.visionText} onChange={(v) => set("visionText", v)} maxLength={70} />
          </div>
        </div>
        <div>
          <FieldLabel>Mission Title</FieldLabel>
          <TextInput value={data.missionTitle} onChange={(v) => set("missionTitle", v)} maxLength={20} />
        </div>
        <div>
          <FieldLabel>Mission Text</FieldLabel>
          <Textarea value={data.missionText} onChange={(v) => set("missionText", v)} rows={3} maxLength={260} />
        </div>
      </Panel>

      <Panel title="Decoration" note="Faint leaves on the left edge. Leave empty to hide them.">
        <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
          <CloudImageField
            upload={aboutNamoGangeApi.upload}
            label="Leaves"
            value={data.leafImage}
            onChange={(v) => set("leafImage", v)}
            hint="Transparent PNG"
            previewClass="h-[56px] w-[56px]"
          />
          <div>
            <FieldLabel required={Boolean(data.leafImage)}>Leaves Alt Text</FieldLabel>
            <TextInput value={data.leafImageAlt} onChange={(v) => set("leafImageAlt", v)} maxLength={150} />
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
          Save About Namo Gange Trust
        </button>
      </div>
    </div>
  );
}
