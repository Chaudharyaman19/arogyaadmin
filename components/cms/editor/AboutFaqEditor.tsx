"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { FieldLabel, Textarea, TextInput, Toggle } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { aboutFaqApi, AboutFaq, AboutFaqItem } from "@/lib/aboutFaqApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   FREQUENTLY ASKED QUESTIONS — accordion on the left, the open
   question's photo and the help-desk box on the right, on the
   website About Us page. Loads from and saves straight to
   backend-arogya (images go to Cloudinary), so it has its own
   Save button — page sections are only stored locally.
========================================================= */

const MAX_ITEMS = 20;
const LINK = /^(\/|https?:\/\/)/;

const EMPTY: AboutFaq = {
  subheading: "Support & Info",
  heading: "Frequently Asked",
  highlightText: "Questions",
  description: "",
  defaultImage: "",
  defaultImageAlt: "",
  leftImage: "",
  leftImageAlt: "Green leaf vine decoration",
  rightImage: "",
  rightImageAlt: "Gold leaf branch decoration",
  ctaQuestion: "",
  ctaLabel: "",
  ctaHref: "/contact",
  ctaNewTab: false,
  items: [],
};
const newItem = (): AboutFaqItem => ({ question: "", answer: "", image: "", imageAlt: "", isActive: true });

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

function ImageWithAlt({ label, image, alt, onImage, onAlt, hint, previewClass = "h-[48px] w-[48px]", required }: {
  label: string; image: string; alt: string; onImage: (v: string) => void; onAlt: (v: string) => void; hint: string; previewClass?: string; required?: boolean;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
      <CloudImageField upload={aboutFaqApi.upload} label={label} value={image} onChange={onImage} hint={hint} previewClass={previewClass} required={required} />
      <div>
        <FieldLabel required={Boolean(image)}>{label} Alt Text</FieldLabel>
        <TextInput value={alt} onChange={onAlt} placeholder="Describe the image (for SEO & screen readers)" maxLength={150} />
      </div>
    </div>
  );
}

export function AboutFaqEditor() {
  const [data, setData] = useState<AboutFaq>(EMPTY);
  const [open, setOpen] = useState<number | null>(0);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    aboutFaqApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
        else setIsSaved(false);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load the FAQ."))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof AboutFaq>(key: K, value: AboutFaq[K]) => setData((prev) => ({ ...prev, [key]: value }));
  const setItem = (index: number, patch: Partial<AboutFaqItem>) =>
    set("items", data.items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= data.items.length) return;
    const next = [...data.items];
    [next[index], next[target]] = [next[target], next[index]];
    set("items", next);
    setOpen(target);
  };

  const save = async () => {
    if (!data.heading.trim()) return setError("Enter the heading.");
    for (const [label, image, alt] of [
      ["default image", data.defaultImage, data.defaultImageAlt],
      ["left decoration", data.leftImage, data.leftImageAlt],
      ["right decoration", data.rightImage, data.rightImageAlt],
    ] as const) {
      if (image && !alt.trim()) return setError(`Enter the alt text of the ${label}.`);
    }
    if (data.ctaLabel.trim() && !LINK.test(data.ctaHref.trim())) return setError("The CTA button link must start with / or http(s)://");
    for (const [i, it] of data.items.entries()) {
      if (!it.question.trim()) return setError(`FAQ ${i + 1}: enter the question.`);
      if (!it.answer.trim()) return setError(`FAQ ${i + 1}: enter the answer.`);
      if (it.image && !it.imageAlt.trim()) return setError(`FAQ ${i + 1}: enter the image alt text.`);
    }

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await aboutFaqApi.save(input);
      setData({ ...EMPTY, ...saved });
      setIsSaved(true);
      showSuccess("FAQ saved. The website updates within 30 seconds.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save the FAQ.";
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
        Loading the FAQ...
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

      <Panel title="Heading & Text" note='The heading and the highlight text are shown together, e.g. "Frequently Asked" + "Questions".'>
        <div className="grid grid-cols-3 gap-[10px]">
          <div>
            <FieldLabel>Subheading</FieldLabel>
            <TextInput value={data.subheading} onChange={(v) => set("subheading", v)} maxLength={25} />
          </div>
          <div>
            <FieldLabel required>Heading</FieldLabel>
            <TextInput value={data.heading} onChange={(v) => set("heading", v)} maxLength={30} />
          </div>
          <div>
            <FieldLabel>Highlight Text (green)</FieldLabel>
            <TextInput value={data.highlightText} onChange={(v) => set("highlightText", v)} maxLength={25} />
          </div>
        </div>
        <div>
          <FieldLabel>Description</FieldLabel>
          <Textarea value={data.description} onChange={(v) => set("description", v)} rows={2} maxLength={140} />
        </div>
      </Panel>

      <Panel
        title={`FAQ Entries (${data.items.length} total, ${data.items.filter((i) => i.isActive).length} shown)`}
        note="Each question's photo shows on the right while it is open."
        action={
          <button
            type="button"
            onClick={() => {
              set("items", [...data.items, newItem()]);
              setOpen(data.items.length);
            }}
            disabled={data.items.length >= MAX_ITEMS}
            className="inline-flex h-[28px] shrink-0 items-center gap-[5px] border border-dashed border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] transition hover:bg-[#ccfbf1] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3 w-3" /> Add FAQ
          </button>
        }
      >
        {data.items.map((item, index) => {
          const isOpen = open === index;
          return (
            <div key={index} className="rounded-[6px] border border-[#e2e8f0] bg-[#fbfbfa]">
              <div className="flex items-center gap-[8px] px-[10px] py-[8px]">
                <button type="button" onClick={() => setOpen(isOpen ? null : index)} className="flex min-w-0 flex-1 items-center gap-[6px] text-left">
                  {isOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#1e40af]" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#1e40af]" />}
                  <span className="truncate text-[11px] font-bold text-[#4B1426]">{item.question || `FAQ ${index + 1}`}</span>
                </button>
                <span className={`text-[10px] font-bold ${item.isActive ? "text-[#16a34a]" : "text-[#dc2626]"}`}>{item.isActive ? "Shown" : "Hidden"}</span>
                <Toggle checked={item.isActive} onChange={(v) => setItem(index, { isActive: v })} />
                <button type="button" title="Move up" disabled={index === 0} onClick={() => move(index, -1)}
                  className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button type="button" title="Move down" disabled={index === data.items.length - 1} onClick={() => move(index, 1)}
                  className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                  <ArrowDown className="h-3 w-3" />
                </button>
                <button type="button" title="Remove FAQ" onClick={() => { set("items", data.items.filter((_, i) => i !== index)); setOpen(null); }}
                  className="grid h-[26px] w-[26px] place-items-center border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              {isOpen && (
                <div className="flex flex-col gap-[10px] border-t border-[#e2e8f0] p-[10px]">
                  <div>
                    <FieldLabel required>Question</FieldLabel>
                    <TextInput value={item.question} onChange={(v) => setItem(index, { question: v })} maxLength={150} />
                  </div>
                  <div>
                    <FieldLabel required>Answer</FieldLabel>
                    <Textarea value={item.answer} onChange={(v) => setItem(index, { answer: v })} rows={3} maxLength={600} />
                  </div>
                  <ImageWithAlt
                    label="Photo"
                    image={item.image}
                    alt={item.imageAlt}
                    onImage={(v) => setItem(index, { image: v })}
                    onAlt={(v) => setItem(index, { imageAlt: v })}
                    hint="Landscape 4:3, up to 5 MB"
                    previewClass="h-[54px] w-[72px]"
                  />
                </div>
              )}
            </div>
          );
        })}
      </Panel>

      <Panel title="Help Desk Box" note="Under the photo. Leave the button label empty to hide the button.">
        <div>
          <FieldLabel>CTA Question</FieldLabel>
          <TextInput value={data.ctaQuestion} onChange={(v) => set("ctaQuestion", v)} maxLength={95} />
        </div>
        <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-[10px]">
          <div>
            <FieldLabel>CTA Button Label</FieldLabel>
            <TextInput value={data.ctaLabel} onChange={(v) => set("ctaLabel", v)} maxLength={30} />
          </div>
          <div>
            <FieldLabel required={Boolean(data.ctaLabel)}>CTA Button Link</FieldLabel>
            <TextInput value={data.ctaHref} onChange={(v) => set("ctaHref", v)} placeholder="/contact or https://..." maxLength={300} hideLimit />
          </div>
          <label className="flex h-[38px] items-center gap-[6px] text-[10px] font-semibold text-[#475569]">
            <Toggle checked={data.ctaNewTab} onChange={(v) => set("ctaNewTab", v)} /> New tab
          </label>
        </div>
      </Panel>

      <Panel title="Images" note="Default image shows when no question is open. Leaf decorations sit on the left and right edges — leave empty to hide.">
        <ImageWithAlt label="Default Image" image={data.defaultImage} alt={data.defaultImageAlt}
          onImage={(v) => set("defaultImage", v)} onAlt={(v) => set("defaultImageAlt", v)} hint="Landscape 4:3" previewClass="h-[54px] w-[72px]" />
        <ImageWithAlt label="Left Decoration" image={data.leftImage} alt={data.leftImageAlt}
          onImage={(v) => set("leftImage", v)} onAlt={(v) => set("leftImageAlt", v)} hint="Transparent PNG" />
        <ImageWithAlt label="Right Decoration" image={data.rightImage} alt={data.rightImageAlt}
          onImage={(v) => set("rightImage", v)} onAlt={(v) => set("rightImageAlt", v)} hint="Transparent image" />
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
          Save FAQ
        </button>
      </div>
    </div>
  );
}
