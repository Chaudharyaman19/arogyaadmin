"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { FieldLabel, Textarea, TextInput, Toggle } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { aboutImpactApi, AboutImpact, ImpactStat } from "@/lib/aboutInitiativesApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   OUR IMPACT SO FAR — the bordered counter band at the bottom
   of the website About Us page. Loads from and saves straight
   to backend-arogya (icons go to Cloudinary), so it has its own
   Save button — page sections are only stored locally.
========================================================= */

const MAX_STATS = 8;
const EMPTY: AboutImpact = { title: "OUR IMPACT SO FAR", stats: [] };
const newStat = (): ImpactStat => ({ icon: "", iconAlt: "", value: "", suffix: "+", label: "", isActive: true });
const oneLine = (text: string) => text.replace(/\n/g, " ");

export function AboutImpactEditor() {
  const [data, setData] = useState<AboutImpact>(EMPTY);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    aboutImpactApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
        else setIsSaved(false);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load Our Impact."))
      .finally(() => setLoading(false));
  }, []);

  const setStats = (stats: ImpactStat[]) => setData((prev) => ({ ...prev, stats }));
  const setStat = (index: number, patch: Partial<ImpactStat>) => setStats(data.stats.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= data.stats.length) return;
    const next = [...data.stats];
    [next[index], next[target]] = [next[target], next[index]];
    setStats(next);
  };

  const save = async () => {
    if (!data.title.trim()) return setError("Enter the band title.");
    for (const [i, s] of data.stats.entries()) {
      const name = oneLine(s.label) || `Stat ${i + 1}`;
      if (!s.value.trim()) return setError(`${name}: enter the value.`);
      if (!s.label.trim()) return setError(`Stat ${i + 1}: enter the label.`);
      if (s.icon && !s.iconAlt.trim()) return setError(`${name}: enter the icon alt text.`);
    }

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await aboutImpactApi.save(input);
      setData({ ...EMPTY, ...saved });
      setIsSaved(true);
      showSuccess("Our Impact saved. The website updates within 30 seconds.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save Our Impact.";
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
        Loading Our Impact...
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

      <div>
        <FieldLabel required>Band Title</FieldLabel>
        <TextInput value={data.title} onChange={(v) => setData((prev) => ({ ...prev, title: v.toUpperCase() }))} maxLength={30} />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[12px] font-bold text-[#334155]">
          Impact Stats{" "}
          <span className="font-medium text-[#64748b]">({data.stats.length} total, {data.stats.filter((s) => s.isActive).length} shown)</span>
        </div>
        <button
          type="button"
          onClick={() => setStats([...data.stats, newStat()])}
          disabled={data.stats.length >= MAX_STATS}
          className="inline-flex h-[30px] items-center gap-[5px] border border-dashed border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] transition hover:bg-[#ccfbf1] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3 w-3" /> Add Impact Stat
        </button>
      </div>
      <p className="-mt-[6px] text-[10px] text-[#64748b]">A value of only digits (e.g. 1000) counts up on the website. Words like Countless are shown as they are.</p>

      {data.stats.map((stat, index) => (
        <div key={index} className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-white p-[12px]">
          <div className="flex items-center gap-[8px]">
            {stat.icon && <img src={stat.icon} alt="" className="h-[22px] w-[22px] object-contain" />}
            <span className="text-[11px] font-bold text-[#4B1426]">
              {stat.label ? `${oneLine(stat.label)} (${stat.value}${stat.suffix})` : `Stat ${index + 1}`}
            </span>
            <div className="ml-auto flex items-center gap-[6px]">
              <span className={`text-[10px] font-bold ${stat.isActive ? "text-[#16a34a]" : "text-[#dc2626]"}`}>{stat.isActive ? "Shown" : "Hidden"}</span>
              <Toggle checked={stat.isActive} onChange={(v) => setStat(index, { isActive: v })} />
              <button type="button" title="Move up" disabled={index === 0} onClick={() => move(index, -1)}
                className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                <ArrowUp className="h-3 w-3" />
              </button>
              <button type="button" title="Move down" disabled={index === data.stats.length - 1} onClick={() => move(index, 1)}
                className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                <ArrowDown className="h-3 w-3" />
              </button>
              <button type="button" title="Remove stat" onClick={() => setStats(data.stats.filter((_, i) => i !== index))}
                className="grid h-[26px] w-[26px] place-items-center border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[2fr_1fr_1fr] gap-[10px]">
            <div>
              <FieldLabel required>Label</FieldLabel>
              <Textarea value={stat.label} onChange={(v) => setStat(index, { label: v })} rows={2} maxLength={45} />
            </div>
            <div>
              <FieldLabel required>Value</FieldLabel>
              <TextInput value={stat.value} onChange={(v) => setStat(index, { value: v })} placeholder="1000" maxLength={12} />
            </div>
            <div>
              <FieldLabel>Suffix</FieldLabel>
              <TextInput value={stat.suffix} onChange={(v) => setStat(index, { suffix: v })} placeholder="+" maxLength={5} />
            </div>
          </div>

          <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
            <CloudImageField
              upload={aboutImpactApi.upload}
              label="Icon"
              value={stat.icon}
              onChange={(v) => setStat(index, { icon: v })}
              hint="Small icon, transparent"
              previewClass="h-[48px] w-[48px]"
            />
            <div>
              <FieldLabel required={Boolean(stat.icon)}>Icon Alt Text</FieldLabel>
              <TextInput value={stat.iconAlt} onChange={(v) => setStat(index, { iconAlt: v })} placeholder="Health Camps Organized icon" maxLength={150} />
            </div>
          </div>
        </div>
      ))}

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
          Save Our Impact
        </button>
      </div>
    </div>
  );
}
