"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { FieldLabel, Textarea, TextInput, Toggle } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { paperWhyChooseApi, PaperWhyChoose, PaperWhyChooseFeature } from "@/lib/paperPresentationApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   WHY CHOOSE AROGYA SANGHOSTHI — the dark green feature band and
   the light CTA card on the website Paper Presentation page.
   Loads from and saves straight to backend-arogya (images go to
   Cloudinary), so it has its own Save button — page sections are
   only stored locally.
========================================================= */

const MAX_FEATURES = 8;

const EMPTY: PaperWhyChoose = {
  heading: "WHY CHOOSE AROGYA SANGHOSTHI FOR YOUR RESEARCH?",
  features: [],
  footnote: "",
  ctaText: "",
  ctaHeading: "",
  leafImage: "",
  leafImageAlt: "Green leaf branch decoration",
};
const newFeature = (): PaperWhyChooseFeature => ({ title: "", icon: "", iconAlt: "", isActive: true });
const oneLine = (text: string) => text.replace(/\n/g, " ");

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

export function PaperWhyChooseEditor() {
  const [data, setData] = useState<PaperWhyChoose>(EMPTY);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    paperWhyChooseApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
        else setIsSaved(false);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load Why Choose."))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof PaperWhyChoose>(key: K, value: PaperWhyChoose[K]) => setData((prev) => ({ ...prev, [key]: value }));
  const setFeature = (index: number, patch: Partial<PaperWhyChooseFeature>) =>
    set("features", data.features.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= data.features.length) return;
    const next = [...data.features];
    [next[index], next[target]] = [next[target], next[index]];
    set("features", next);
  };

  const save = async () => {
    if (!data.heading.trim()) return setError("Enter the heading.");
    if (data.leafImage && !data.leafImageAlt.trim()) return setError("Enter the alt text of the leaf image.");
    for (const [i, f] of data.features.entries()) {
      if (!f.title.trim()) return setError(`Feature ${i + 1}: enter the title.`);
      if (f.icon && !f.iconAlt.trim()) return setError(`${oneLine(f.title)}: enter the icon alt text.`);
    }

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await paperWhyChooseApi.save(input);
      setData({ ...EMPTY, ...saved });
      setIsSaved(true);
      showSuccess("Why Choose Arogya Sanghosthi saved. The website updates within 30 seconds.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save Why Choose.";
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
        Loading Why Choose Arogya Sanghosthi...
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
        title={`Features (${data.features.length} total, ${data.features.filter((f) => f.isActive).length} shown)`}
        note="Dark green band. Press Enter in a title to start a new line on the website."
        action={
          <button
            type="button"
            onClick={() => set("features", [...data.features, newFeature()])}
            disabled={data.features.length >= MAX_FEATURES}
            className="inline-flex h-[28px] shrink-0 items-center gap-[5px] border border-dashed border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] transition hover:bg-[#ccfbf1] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3 w-3" /> Add Feature
          </button>
        }
      >
        <div>
          <FieldLabel required>Heading</FieldLabel>
          <TextInput value={data.heading} onChange={(v) => set("heading", v.toUpperCase())} maxLength={70} />
        </div>
        {data.features.map((feature, index) => (
          <div key={index} className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-[#fbfbfa] p-[10px]">
            <div className="flex items-center gap-[8px]">
              {feature.icon && <img src={feature.icon} alt="" className="h-[22px] w-[22px] rounded bg-[#032e1c] object-contain p-[2px]" />}
              <span className="text-[11px] font-bold text-[#4B1426]">{oneLine(feature.title) || `Feature ${index + 1}`}</span>
              <div className="ml-auto flex items-center gap-[6px]">
                <span className={`text-[10px] font-bold ${feature.isActive ? "text-[#16a34a]" : "text-[#dc2626]"}`}>{feature.isActive ? "Shown" : "Hidden"}</span>
                <Toggle checked={feature.isActive} onChange={(v) => setFeature(index, { isActive: v })} />
                <button type="button" title="Move up" disabled={index === 0} onClick={() => move(index, -1)}
                  className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button type="button" title="Move down" disabled={index === data.features.length - 1} onClick={() => move(index, 1)}
                  className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                  <ArrowDown className="h-3 w-3" />
                </button>
                <button type="button" title="Remove feature" onClick={() => set("features", data.features.filter((_, i) => i !== index))}
                  className="grid h-[26px] w-[26px] place-items-center border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-[10px]">
              <div>
                <FieldLabel required>Title</FieldLabel>
                <Textarea value={feature.title} onChange={(v) => setFeature(index, { title: v })} rows={2} maxLength={40} />
              </div>
              <CloudImageField
                upload={paperWhyChooseApi.upload}
                label="Icon"
                value={feature.icon}
                onChange={(v) => setFeature(index, { icon: v })}
                hint="Light icon for the dark band"
                previewClass="h-[48px] w-[48px] bg-[#032e1c]"
              />
              <div>
                <FieldLabel required={Boolean(feature.icon)}>Icon Alt Text</FieldLabel>
                <TextInput value={feature.iconAlt} onChange={(v) => setFeature(index, { iconAlt: v })} placeholder="Interdisciplinary Platform icon" maxLength={150} />
              </div>
            </div>
          </div>
        ))}
        <div>
          <FieldLabel>Footnote</FieldLabel>
          <TextInput value={data.footnote} onChange={(v) => set("footnote", v)} placeholder="* Selected papers may be considered for publication..." maxLength={140} />
        </div>
      </Panel>

      <Panel title="CTA Card" note="Light card on the right. Press Enter for a new line. Leave both texts empty to hide the card.">
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel>Text</FieldLabel>
            <Textarea value={data.ctaText} onChange={(v) => set("ctaText", v)} rows={2} maxLength={120} />
          </div>
          <div>
            <FieldLabel>Heading</FieldLabel>
            <Textarea value={data.ctaHeading} onChange={(v) => set("ctaHeading", v)} rows={2} maxLength={80} />
          </div>
        </div>
        <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
          <CloudImageField
            upload={paperWhyChooseApi.upload}
            label="Leaf Decoration"
            value={data.leafImage}
            onChange={(v) => set("leafImage", v)}
            hint="Transparent PNG, bottom right"
            previewClass="h-[48px] w-[48px]"
          />
          <div>
            <FieldLabel required={Boolean(data.leafImage)}>Leaf Alt Text</FieldLabel>
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
          Save Why Choose
        </button>
      </div>
    </div>
  );
}
