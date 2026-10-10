"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Award,
  Briefcase,
  Building2,
  FlaskConical,
  Globe,
  GraduationCap,
  Handshake,
  HeartPulse,
  Hospital,
  Landmark,
  Leaf,
  Loader2,
  Pill,
  Plus,
  Save,
  Stethoscope,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { FieldLabel, TextInput, Toggle } from "./FormPrimitives";
import { supportedByApi, SupportedBy, SupportedByItem } from "@/lib/supportedByApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   SUPPORTED BY — the dark green strip under the website hero.
   Loads from and saves straight to backend-arogya, so it has
   its own Save button (page sections are only stored locally).
   Icon names must match backend models/home/SupportedBy.js and
   the website's TrustedBy component.
========================================================= */

const ICONS: { name: string; label: string; Icon: LucideIcon }[] = [
  { name: "stethoscope", label: "Stethoscope", Icon: Stethoscope },
  { name: "landmark", label: "Government", Icon: Landmark },
  { name: "leaf", label: "Leaf / AYUSH", Icon: Leaf },
  { name: "globe", label: "Globe", Icon: Globe },
  { name: "briefcase", label: "Briefcase", Icon: Briefcase },
  { name: "graduation-cap", label: "Education", Icon: GraduationCap },
  { name: "heart-pulse", label: "Heart Pulse", Icon: HeartPulse },
  { name: "hospital", label: "Hospital", Icon: Hospital },
  { name: "pill", label: "Pharma", Icon: Pill },
  { name: "flask", label: "Research", Icon: FlaskConical },
  { name: "users", label: "People", Icon: Users },
  { name: "handshake", label: "Partnership", Icon: Handshake },
  { name: "building", label: "Organisation", Icon: Building2 },
  { name: "award", label: "Award", Icon: Award },
];
const ICON_BY_NAME = Object.fromEntries(ICONS.map((i) => [i.name, i.Icon]));

const MAX_ITEMS = 12;
const HEX = /^#[0-9a-fA-F]{6}$/;

const newItem = (): SupportedByItem => ({
  line1: "",
  line2: "",
  icon: "stethoscope",
  color: "#15803d",
  isActive: true,
});

export function SupportedByEditor() {
  const [data, setData] = useState<SupportedBy>({ eyebrow: "SUPPORTED BY", items: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supportedByApi
      .get()
      .then((res) => setData({ ...res, eyebrow: res.eyebrow ?? "", items: res.items ?? [] }))
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load the Supported By strip."))
      .finally(() => setLoading(false));
  }, []);

  const updateItem = <K extends keyof SupportedByItem>(index: number, key: K, value: SupportedByItem[K]) =>
    setData((prev) => ({ ...prev, items: prev.items.map((it, i) => (i === index ? { ...it, [key]: value } : it)) }));

  const moveItem = (index: number, direction: -1 | 1) =>
    setData((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.items.length) return prev;
      const items = [...prev.items];
      [items[index], items[target]] = [items[target], items[index]];
      return { ...prev, items };
    });

  const save = async () => {
    if (!data.eyebrow.trim()) return setError("Enter the heading (e.g. SUPPORTED BY).");
    if (!data.items.length) return setError("Add at least one group.");
    for (const [i, it] of data.items.entries()) {
      if (!it.line1.trim()) return setError(`Group ${i + 1}: enter the first line.`);
      if (!HEX.test(it.color)) return setError(`Group ${i + 1}: icon colour must look like #15803d.`);
    }

    setSaving(true);
    setError("");
    try {
      const saved = await supportedByApi.save({
        eyebrow: data.eyebrow.trim(),
        items: data.items.map(({ _id, ...it }) => ({ ...it, line1: it.line1.trim(), line2: it.line2.trim() })),
      });
      setData(saved);
      showSuccess("Supported By saved. The website updates within 30 seconds.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save the Supported By strip.";
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
        Loading the website Supported By strip...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[1fr_2fr] items-end gap-[12px]">
        <div>
          <FieldLabel required>Heading</FieldLabel>
          <TextInput
            value={data.eyebrow}
            onChange={(v) => setData((prev) => ({ ...prev, eyebrow: v }))}
            placeholder="SUPPORTED BY"
            maxLength={25}
          />
        </div>
        <p className="pb-[8px] text-[10px] text-[#64748b]">
          Shown in the pill above the groups. Each group has two lines — the second line appears slightly faded on the website.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[12px] font-bold text-[#334155]">
          Trusted Groups{" "}
          <span className="font-medium text-[#64748b]">
            ({data.items.length} total, {data.items.filter((i) => i.isActive).length} shown)
          </span>
        </div>
        <button
          type="button"
          onClick={() => setData((prev) => ({ ...prev, items: [...prev.items, newItem()] }))}
          disabled={data.items.length >= MAX_ITEMS}
          className="inline-flex h-[30px] items-center gap-[5px] border border-dashed border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] transition hover:bg-[#ccfbf1] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3 w-3" /> Add Trusted Group
        </button>
      </div>

      {data.items.map((item, index) => {
        const PreviewIcon = ICON_BY_NAME[item.icon] ?? Stethoscope;
        const previewColor = HEX.test(item.color) ? item.color : "#15803d";
        return (
          <div key={item._id ?? `new-${index}`} className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-white p-[12px]">
            {/* HEADER: live preview + controls */}
            <div className="flex items-center gap-[10px]">
              <div className="flex items-center gap-[8px] rounded-[4px] bg-[#00291b] px-[10px] py-[6px]">
                <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-white">
                  <PreviewIcon className="h-[13px] w-[13px]" color={previewColor} strokeWidth={2} />
                </span>
                <span className="leading-tight">
                  <span className="block text-[9px] font-bold uppercase text-white">{item.line1 || "First line"}</span>
                  <span className="block text-[9px] font-bold uppercase text-white/70">{item.line2 || "Second line"}</span>
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#4B1426]">Group {index + 1}</span>
              <div className="ml-auto flex items-center gap-[6px]">
                <span className={`text-[10px] font-bold ${item.isActive ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
                  {item.isActive ? "Shown" : "Hidden"}
                </span>
                <Toggle checked={item.isActive} onChange={(v) => updateItem(index, "isActive", v)} />
                <button type="button" title="Move up" disabled={index === 0} onClick={() => moveItem(index, -1)}
                  className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button type="button" title="Move down" disabled={index === data.items.length - 1} onClick={() => moveItem(index, 1)}
                  className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                  <ArrowDown className="h-3 w-3" />
                </button>
                <button type="button" title="Remove group"
                  onClick={() => setData((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))}
                  className="grid h-[26px] w-[26px] place-items-center border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* TEXT */}
            <div className="grid grid-cols-[1fr_1fr_150px] gap-[10px]">
              <div>
                <FieldLabel required>First Line</FieldLabel>
                <TextInput value={item.line1} onChange={(v) => updateItem(index, "line1", v.toUpperCase())} placeholder="HEALTHCARE" maxLength={30} />
              </div>
              <div>
                <FieldLabel>Second Line</FieldLabel>
                <TextInput value={item.line2} onChange={(v) => updateItem(index, "line2", v.toUpperCase())} placeholder="LEADERS" maxLength={30} />
              </div>
              <div>
                <FieldLabel>Icon Colour</FieldLabel>
                <div className="flex items-center gap-[6px]">
                  <input
                    type="color"
                    value={previewColor}
                    onChange={(e) => updateItem(index, "color", e.target.value)}
                    className="h-[35px] w-[40px] cursor-pointer border border-[#cbd5e1] bg-white p-[2px]"
                  />
                  <TextInput value={item.color} onChange={(v) => updateItem(index, "color", v)} maxLength={7} hideLimit />
                </div>
              </div>
            </div>

            {/* ICON PICKER */}
            <div>
              <FieldLabel>Icon</FieldLabel>
              <div className="flex flex-wrap gap-[6px]">
                {ICONS.map(({ name, label, Icon }) => {
                  const selected = item.icon === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      title={label}
                      onClick={() => updateItem(index, "icon", name)}
                      className={`flex h-[34px] items-center gap-[5px] rounded-[5px] border px-[8px] text-[10px] font-semibold transition ${
                        selected
                          ? "border-[#0f766e] bg-[#f0fdfa] text-[#0f766e] shadow-[0_0_0_1px_#0f766e]"
                          : "border-[#e2e8f0] bg-white text-[#475569] hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="h-[14px] w-[14px]" color={selected ? previewColor : "currentColor"} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}

      <div className="flex items-center justify-end gap-[10px]">
        {data.updatedAt && data.updatedBy !== "default" && (
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
          Save Supported By
        </button>
      </div>
    </div>
  );
}
