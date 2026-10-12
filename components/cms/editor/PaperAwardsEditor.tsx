"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { FieldLabel, Textarea, TextInput, Toggle } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { paperAwardsApi, PaperAward, PaperAwards } from "@/lib/paperPresentationApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   AWARDS & RECOGNITION — the award cards and the trophy
   graphic on the website Paper Presentation page. Loads from and
   saves straight to backend-arogya (images go to Cloudinary), so
   it has its own Save button — page sections are only stored locally.
========================================================= */

const MAX_AWARDS = 8;

const EMPTY: PaperAwards = {
  heading: "AWARDS & RECOGNITION",
  headingIcon: "",
  headingIconAlt: "Green leaf sprig decoration",
  awards: [],
  graphic: "",
  graphicAlt: "",
};
const newAward = (): PaperAward => ({ title: "", icon: "", iconAlt: "", isActive: true });
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

export function PaperAwardsEditor() {
  const [data, setData] = useState<PaperAwards>(EMPTY);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    paperAwardsApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
        else setIsSaved(false);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load Awards & Recognition."))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof PaperAwards>(key: K, value: PaperAwards[K]) => setData((prev) => ({ ...prev, [key]: value }));
  const setAward = (index: number, patch: Partial<PaperAward>) => set("awards", data.awards.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= data.awards.length) return;
    const next = [...data.awards];
    [next[index], next[target]] = [next[target], next[index]];
    set("awards", next);
  };

  const save = async () => {
    if (!data.heading.trim()) return setError("Enter the heading.");
    if (data.headingIcon && !data.headingIconAlt.trim()) return setError("Enter the alt text of the heading icon.");
    if (data.graphic && !data.graphicAlt.trim()) return setError("Enter the alt text of the awards graphic.");
    for (const [i, a] of data.awards.entries()) {
      if (!a.title.trim()) return setError(`Award ${i + 1}: enter the title.`);
      if (a.icon && !a.iconAlt.trim()) return setError(`${oneLine(a.title)}: enter the icon alt text.`);
    }

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await paperAwardsApi.save(input);
      setData({ ...EMPTY, ...saved });
      setIsSaved(true);
      showSuccess("Awards & Recognition saved. The website updates within 30 seconds.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save Awards & Recognition.";
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
        Loading Awards & Recognition...
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

      <Panel title="Heading & Graphic" note="The graphic shows on the right on wide screens.">
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-[10px]">
          <div>
            <FieldLabel required>Heading</FieldLabel>
            <TextInput value={data.heading} onChange={(v) => set("heading", v.toUpperCase())} maxLength={30} />
          </div>
          <CloudImageField
            upload={paperAwardsApi.upload}
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
            upload={paperAwardsApi.upload}
            label="Awards Graphic"
            value={data.graphic}
            onChange={(v) => set("graphic", v)}
            hint="Transparent PNG"
            previewClass="h-[56px] w-[90px]"
          />
          <div>
            <FieldLabel required={Boolean(data.graphic)}>Graphic Alt Text</FieldLabel>
            <TextInput value={data.graphicAlt} onChange={(v) => set("graphicAlt", v)} placeholder="Golden trophy surrounded by green leaves" maxLength={150} />
          </div>
        </div>
      </Panel>

      <Panel
        title={`Award Cards (${data.awards.length} total, ${data.awards.filter((a) => a.isActive).length} shown)`}
        note="Press Enter in a title to put the rest on the second line of the card."
        action={
          <button
            type="button"
            onClick={() => set("awards", [...data.awards, newAward()])}
            disabled={data.awards.length >= MAX_AWARDS}
            className="inline-flex h-[28px] shrink-0 items-center gap-[5px] border border-dashed border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] transition hover:bg-[#ccfbf1] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3 w-3" /> Add Award
          </button>
        }
      >
        {data.awards.map((award, index) => (
          <div key={index} className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-[#fbfbfa] p-[10px]">
            <div className="flex items-center gap-[8px]">
              {award.icon && <img src={award.icon} alt="" className="h-[22px] w-[22px] object-contain" />}
              <span className="text-[11px] font-bold text-[#4B1426]">{oneLine(award.title) || `Award ${index + 1}`}</span>
              <div className="ml-auto flex items-center gap-[6px]">
                <span className={`text-[10px] font-bold ${award.isActive ? "text-[#16a34a]" : "text-[#dc2626]"}`}>{award.isActive ? "Shown" : "Hidden"}</span>
                <Toggle checked={award.isActive} onChange={(v) => setAward(index, { isActive: v })} />
                <button type="button" title="Move up" disabled={index === 0} onClick={() => move(index, -1)}
                  className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button type="button" title="Move down" disabled={index === data.awards.length - 1} onClick={() => move(index, 1)}
                  className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                  <ArrowDown className="h-3 w-3" />
                </button>
                <button type="button" title="Remove award" onClick={() => set("awards", data.awards.filter((_, i) => i !== index))}
                  className="grid h-[26px] w-[26px] place-items-center border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-[10px]">
              <div>
                <FieldLabel required>Title</FieldLabel>
                <Textarea value={award.title} onChange={(v) => setAward(index, { title: v })} rows={2} maxLength={75} />
              </div>
              <CloudImageField
                upload={paperAwardsApi.upload}
                label="Icon"
                value={award.icon}
                onChange={(v) => setAward(index, { icon: v })}
                hint="Transparent PNG"
                previewClass="h-[48px] w-[48px]"
              />
              <div>
                <FieldLabel required={Boolean(award.icon)}>Icon Alt Text</FieldLabel>
                <TextInput value={award.iconAlt} onChange={(v) => setAward(index, { iconAlt: v })} placeholder="Best Oral Presentation icon" maxLength={150} />
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
          Save Awards & Recognition
        </button>
      </div>
    </div>
  );
}
