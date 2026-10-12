"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { FieldLabel, Textarea, TextInput, Toggle } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { paperTopicsApi, PaperTopic, PaperTopics } from "@/lib/paperPresentationApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   TOPICS OF INTEREST — the topic cards on the website Paper
   Presentation page. Loads from and saves straight to
   backend-arogya (icons go to Cloudinary), so it has its own
   Save button — page sections are only stored locally.
========================================================= */

const MAX_TOPICS = 16;

const EMPTY: PaperTopics = {
  heading: "TOPICS OF INTEREST",
  headingIcon: "",
  headingIconAlt: "Green leaf sprig decoration",
  decorImage: "",
  decorImageAlt: "Gold leaf branch decoration",
  topics: [],
};
const newTopic = (): PaperTopic => ({ title: "", description: "", icon: "", iconAlt: "", isActive: true });

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

export function PaperTopicsEditor() {
  const [data, setData] = useState<PaperTopics>(EMPTY);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    paperTopicsApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
        else setIsSaved(false);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load Topics of Interest."))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof PaperTopics>(key: K, value: PaperTopics[K]) => setData((prev) => ({ ...prev, [key]: value }));
  const setTopic = (index: number, patch: Partial<PaperTopic>) => set("topics", data.topics.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= data.topics.length) return;
    const next = [...data.topics];
    [next[index], next[target]] = [next[target], next[index]];
    set("topics", next);
  };

  const save = async () => {
    if (!data.heading.trim()) return setError("Enter the heading.");
    if (data.headingIcon && !data.headingIconAlt.trim()) return setError("Enter the alt text of the heading icon.");
    if (data.decorImage && !data.decorImageAlt.trim()) return setError("Enter the alt text of the decoration image.");
    for (const [i, t] of data.topics.entries()) {
      if (!t.title.trim()) return setError(`Topic ${i + 1}: enter the title.`);
      if (t.icon && !t.iconAlt.trim()) return setError(`${t.title}: enter the icon alt text.`);
    }

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await paperTopicsApi.save(input);
      setData({ ...EMPTY, ...saved });
      setIsSaved(true);
      showSuccess("Topics of Interest saved. The website updates within 30 seconds.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save Topics of Interest.";
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
        Loading Topics of Interest...
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

      <Panel title="Heading & Decorations">
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-[10px]">
          <div>
            <FieldLabel required>Heading</FieldLabel>
            <TextInput value={data.heading} onChange={(v) => set("heading", v.toUpperCase())} maxLength={30} />
          </div>
          <CloudImageField
            upload={paperTopicsApi.upload}
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
        <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
          <CloudImageField
            upload={paperTopicsApi.upload}
            label="Right Side Decoration"
            value={data.decorImage}
            onChange={(v) => set("decorImage", v)}
            hint="Transparent image"
            previewClass="h-[48px] w-[48px]"
          />
          <div>
            <FieldLabel required={Boolean(data.decorImage)}>Decoration Alt Text</FieldLabel>
            <TextInput value={data.decorImageAlt} onChange={(v) => set("decorImageAlt", v)} maxLength={150} />
          </div>
        </div>
      </Panel>

      <Panel
        title={`Topic Cards (${data.topics.length} total, ${data.topics.filter((t) => t.isActive).length} shown)`}
        note="Press Enter in a description to start a new line — the first line stays on one line on the website."
        action={
          <button
            type="button"
            onClick={() => set("topics", [...data.topics, newTopic()])}
            disabled={data.topics.length >= MAX_TOPICS}
            className="inline-flex h-[28px] shrink-0 items-center gap-[5px] border border-dashed border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] transition hover:bg-[#ccfbf1] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3 w-3" /> Add Topic
          </button>
        }
      >
        {data.topics.map((topic, index) => (
          <div key={index} className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-[#fbfbfa] p-[10px]">
            <div className="flex items-center gap-[8px]">
              {topic.icon && <img src={topic.icon} alt="" className="h-[22px] w-[22px] object-contain" />}
              <span className="text-[11px] font-bold text-[#4B1426]">{topic.title || `Topic ${index + 1}`}</span>
              <div className="ml-auto flex items-center gap-[6px]">
                <span className={`text-[10px] font-bold ${topic.isActive ? "text-[#16a34a]" : "text-[#dc2626]"}`}>{topic.isActive ? "Shown" : "Hidden"}</span>
                <Toggle checked={topic.isActive} onChange={(v) => setTopic(index, { isActive: v })} />
                <button type="button" title="Move up" disabled={index === 0} onClick={() => move(index, -1)}
                  className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button type="button" title="Move down" disabled={index === data.topics.length - 1} onClick={() => move(index, 1)}
                  className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                  <ArrowDown className="h-3 w-3" />
                </button>
                <button type="button" title="Remove topic" onClick={() => set("topics", data.topics.filter((_, i) => i !== index))}
                  className="grid h-[26px] w-[26px] place-items-center border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-[10px]">
              <div>
                <FieldLabel required>Title</FieldLabel>
                <TextInput value={topic.title} onChange={(v) => setTopic(index, { title: v })} placeholder="AYUSH Systems" maxLength={30} />
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <Textarea value={topic.description} onChange={(v) => setTopic(index, { description: v })} rows={2} maxLength={90} />
              </div>
            </div>
            <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
              <CloudImageField
                upload={paperTopicsApi.upload}
                label="Icon"
                value={topic.icon}
                onChange={(v) => setTopic(index, { icon: v })}
                hint="Transparent PNG"
                previewClass="h-[48px] w-[48px]"
              />
              <div>
                <FieldLabel required={Boolean(topic.icon)}>Icon Alt Text</FieldLabel>
                <TextInput value={topic.iconAlt} onChange={(v) => setTopic(index, { iconAlt: v })} placeholder="AYUSH Systems icon" maxLength={150} />
              </div>
            </div>
          </div>
        ))}
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
          Save Topics of Interest
        </button>
      </div>
    </div>
  );
}
