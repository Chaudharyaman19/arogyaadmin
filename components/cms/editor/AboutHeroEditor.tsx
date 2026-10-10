"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Award,
  BookOpen,
  Building2,
  Calendar,
  Globe,
  GraduationCap,
  HeartPulse,
  Leaf,
  Loader2,
  Mic,
  MonitorPlay,
  Plus,
  Save,
  Star,
  Stethoscope,
  Trash2,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { FieldLabel, Textarea, TextInput, Toggle } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { aboutHeroApi, AboutHero, AboutHeroIcon, AboutHeroStat } from "@/lib/aboutHeroApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   ABOUT HERO — the banner at the top of the website About Us
   page. Loads from and saves straight to backend-arogya (images
   go to Cloudinary), so it has its own Save button — page
   sections are only stored locally.
========================================================= */

const ICONS: { name: AboutHeroIcon; label: string; Icon: LucideIcon }[] = [
  { name: "BookOpen", label: "Book", Icon: BookOpen },
  { name: "Users", label: "People", Icon: Users },
  { name: "Globe", label: "Globe", Icon: Globe },
  { name: "MonitorPlay", label: "Session", Icon: MonitorPlay },
  { name: "Award", label: "Award", Icon: Award },
  { name: "Calendar", label: "Calendar", Icon: Calendar },
  { name: "Mic", label: "Microphone", Icon: Mic },
  { name: "Building2", label: "Building", Icon: Building2 },
  { name: "HeartPulse", label: "Health", Icon: HeartPulse },
  { name: "Stethoscope", label: "Doctor", Icon: Stethoscope },
  { name: "Leaf", label: "Leaf", Icon: Leaf },
  { name: "Star", label: "Star", Icon: Star },
  { name: "Trophy", label: "Trophy", Icon: Trophy },
  { name: "GraduationCap", label: "Education", Icon: GraduationCap },
];
const ICON_BY_NAME = Object.fromEntries(ICONS.map((i) => [i.name, i.Icon])) as Record<string, LucideIcon>;
const MAX_STATS = 6;

const EMPTY: AboutHero = {
  eyebrow: "ABOUT US",
  headline: "",
  dividerImage: "",
  dividerImageAlt: "Lotus divider",
  paragraph: "",
  backgroundImage: "",
  backgroundImageAlt: "",
  stats: [],
};
const newStat = (): AboutHeroStat => ({ icon: "BookOpen", value: 0, suffix: "+", label: "", isActive: true });

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

export function AboutHeroEditor() {
  const [data, setData] = useState<AboutHero>(EMPTY);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    aboutHeroApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
        else setIsSaved(false);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load the About Hero."))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof AboutHero>(key: K, value: AboutHero[K]) => setData((prev) => ({ ...prev, [key]: value }));
  const setStat = <K extends keyof AboutHeroStat>(index: number, key: K, value: AboutHeroStat[K]) =>
    set("stats", data.stats.map((s, i) => (i === index ? { ...s, [key]: value } : s)));
  const moveStat = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= data.stats.length) return;
    const next = [...data.stats];
    [next[index], next[target]] = [next[target], next[index]];
    set("stats", next);
  };

  const save = async () => {
    if (!data.eyebrow.trim()) return setError("Enter the eyebrow (e.g. ABOUT US).");
    if (!data.headline.trim()) return setError("Enter the headline.");
    if (data.dividerImage && !data.dividerImageAlt.trim()) return setError("Enter the alt text of the divider image.");
    if (!data.backgroundImage.trim()) return setError("Upload a background image.");
    if (!data.backgroundImageAlt.trim()) return setError("Enter the background image alt text.");
    for (const [i, s] of data.stats.entries()) {
      if (!s.label.trim()) return setError(`Counter ${i + 1}: enter the label.`);
    }

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await aboutHeroApi.save(input);
      setData({ ...EMPTY, ...saved });
      setIsSaved(true);
      showSuccess("About Hero saved. The website updates within 30 seconds.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save the About Hero.";
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
        Loading About Hero...
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

      <Panel title="Heading & Text" note="Press Enter in the headline or paragraph to start a new line on the website.">
        <div>
          <FieldLabel required>Eyebrow</FieldLabel>
          <TextInput value={data.eyebrow} onChange={(v) => set("eyebrow", v.toUpperCase())} maxLength={30} />
        </div>
        <div>
          <FieldLabel required>Headline (H1)</FieldLabel>
          <Textarea value={data.headline} onChange={(v) => set("headline", v)} rows={2} maxLength={80} />
        </div>
        <div>
          <FieldLabel>Paragraph</FieldLabel>
          <Textarea value={data.paragraph} onChange={(v) => set("paragraph", v)} rows={3} maxLength={320} />
        </div>
      </Panel>

      <Panel title="Lotus Divider" note="Small icon on the gold line under the headline. Leave empty to show only the line.">
        <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
          <CloudImageField
            upload={aboutHeroApi.upload}
            label="Divider Image"
            value={data.dividerImage}
            onChange={(v) => set("dividerImage", v)}
            hint="Small icon, transparent background"
            previewClass="h-[56px] w-[56px]"
          />
          <div>
            <FieldLabel required={Boolean(data.dividerImage)}>Divider Image Alt Text</FieldLabel>
            <TextInput value={data.dividerImageAlt} onChange={(v) => set("dividerImageAlt", v)} placeholder="Lotus divider" maxLength={150} />
          </div>
        </div>
      </Panel>

      <Panel title="Background Image" note="Wide banner — keep the left side plain so the text stays readable.">
        <CloudImageField
          upload={aboutHeroApi.upload}
          label="Background Image"
          required
          value={data.backgroundImage}
          onChange={(v) => set("backgroundImage", v)}
          hint="About 1900 × 700 px, up to 5 MB"
          previewClass="h-[70px] w-[200px]"
        />
        <div>
          <FieldLabel required>Background Image Alt Text</FieldLabel>
          <TextInput
            value={data.backgroundImageAlt}
            onChange={(v) => set("backgroundImageAlt", v)}
            placeholder="Describe what the background shows (for SEO & screen readers)"
            maxLength={150}
          />
        </div>
      </Panel>

      <Panel title="Hero Stats" note="Numbers count up on the website. Hidden counters stay saved but are not shown.">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#64748b]">
            {data.stats.length} total, {data.stats.filter((s) => s.isActive).length} shown
          </span>
          <button
            type="button"
            onClick={() => set("stats", [...data.stats, newStat()])}
            disabled={data.stats.length >= MAX_STATS}
            className="inline-flex h-[30px] items-center gap-[5px] border border-dashed border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] transition hover:bg-[#ccfbf1] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3 w-3" /> Add Stat
          </button>
        </div>

        {data.stats.map((stat, index) => {
          const PreviewIcon = ICON_BY_NAME[stat.icon] ?? BookOpen;
          return (
            <div key={index} className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-[#fbfbfa] p-[10px]">
              <div className="flex items-center gap-[8px]">
                <PreviewIcon className="h-[18px] w-[18px] text-[#032e1c]" strokeWidth={1.5} />
                <span className="text-[11px] font-bold text-[#4B1426]">
                  {stat.label ? `${stat.label} (${stat.value}${stat.suffix})` : `Counter ${index + 1}`}
                </span>
                <div className="ml-auto flex items-center gap-[6px]">
                  <span className={`text-[10px] font-bold ${stat.isActive ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
                    {stat.isActive ? "Shown" : "Hidden"}
                  </span>
                  <Toggle checked={stat.isActive} onChange={(v) => setStat(index, "isActive", v)} />
                  <button type="button" title="Move up" disabled={index === 0} onClick={() => moveStat(index, -1)}
                    className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button type="button" title="Move down" disabled={index === data.stats.length - 1} onClick={() => moveStat(index, 1)}
                    className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button type="button" title="Remove counter" onClick={() => set("stats", data.stats.filter((_, i) => i !== index))}
                    className="grid h-[26px] w-[26px] place-items-center border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-[2fr_1fr_1fr] gap-[10px]">
                <div>
                  <FieldLabel required>Label</FieldLabel>
                  <TextInput value={stat.label} onChange={(v) => setStat(index, "label", v)} placeholder="Editions" maxLength={22} />
                </div>
                <div>
                  <FieldLabel required>Value</FieldLabel>
                  <TextInput
                    value={String(stat.value)}
                    onChange={(v) => setStat(index, "value", Number(v.replace(/\D/g, "").slice(0, 8)) || 0)}
                    placeholder="18"
                    maxLength={8}
                  />
                </div>
                <div>
                  <FieldLabel>Suffix</FieldLabel>
                  <TextInput value={stat.suffix} onChange={(v) => setStat(index, "suffix", v)} placeholder="+" maxLength={5} />
                </div>
              </div>

              <div>
                <FieldLabel>Icon</FieldLabel>
                <div className="flex flex-wrap gap-[6px]">
                  {ICONS.map(({ name, label, Icon }) => {
                    const selected = stat.icon === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        title={label}
                        onClick={() => setStat(index, "icon", name)}
                        className={`flex h-[30px] items-center gap-[5px] rounded-[5px] border px-[8px] text-[10px] font-semibold transition ${
                          selected
                            ? "border-[#0f766e] bg-[#f0fdfa] text-[#0f766e] shadow-[0_0_0_1px_#0f766e]"
                            : "border-[#e2e8f0] bg-white text-[#475569] hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="h-[13px] w-[13px]" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
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
          Save About Hero
        </button>
      </div>
    </div>
  );
}
