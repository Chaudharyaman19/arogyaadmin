"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Award,
  Briefcase,
  Building2,
  Calendar,
  Globe,
  GraduationCap,
  Handshake,
  HeartPulse,
  Infinity as InfinityIcon,
  Loader2,
  MapPin,
  Mic,
  Plus,
  Presentation,
  Save,
  Star,
  Trash2,
  TrendingUp,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { FieldLabel, TextInput, Toggle } from "./FormPrimitives";
import { statsBandApi, StatsBandItem } from "@/lib/statsBandApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   STATS BAND — the dark green counter strip under "About The
   Conference". Loads from and saves straight to backend-arogya,
   so it has its own Save button (page sections are only stored
   locally). Icon names must match backend models/home/StatsBand.js
   and the website's StatsBand component.
========================================================= */

const ICONS: { name: string; label: string; Icon: LucideIcon }[] = [
  { name: "users", label: "People", Icon: Users },
  { name: "mic", label: "Microphone", Icon: Mic },
  { name: "calendar", label: "Calendar", Icon: Calendar },
  { name: "globe", label: "Globe", Icon: Globe },
  { name: "infinity", label: "Infinity", Icon: InfinityIcon },
  { name: "handshake", label: "Handshake", Icon: Handshake },
  { name: "award", label: "Award", Icon: Award },
  { name: "trophy", label: "Trophy", Icon: Trophy },
  { name: "presentation", label: "Presentation", Icon: Presentation },
  { name: "briefcase", label: "Briefcase", Icon: Briefcase },
  { name: "building", label: "Building", Icon: Building2 },
  { name: "star", label: "Star", Icon: Star },
  { name: "trending-up", label: "Growth", Icon: TrendingUp },
  { name: "heart-pulse", label: "Health", Icon: HeartPulse },
  { name: "graduation-cap", label: "Education", Icon: GraduationCap },
  { name: "map-pin", label: "Location", Icon: MapPin },
];
const ICON_BY_NAME = Object.fromEntries(ICONS.map((i) => [i.name, i.Icon]));
const MAX_ITEMS = 8;

const newItem = (): StatsBandItem => ({ number: "", label: "", icon: "users", isActive: true });

export function StatsBandEditor() {
  const [items, setItems] = useState<StatsBandItem[]>([]);
  const [meta, setMeta] = useState<{ updatedAt?: string; updatedBy?: string }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    statsBandApi
      .get()
      .then((res) => {
        setItems(res.items ?? []);
        setMeta({ updatedAt: res.updatedAt, updatedBy: res.updatedBy });
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load the counters."))
      .finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof StatsBandItem>(index: number, key: K, value: StatsBandItem[K]) =>
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [key]: value } : it)));

  const move = (index: number, direction: -1 | 1) =>
    setItems((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const save = async () => {
    if (!items.length) return setError("Add at least one counter.");
    for (const [i, it] of items.entries()) {
      if (!it.number.trim()) return setError(`Counter ${i + 1}: enter the number (e.g. 150+).`);
      if (!it.label.trim()) return setError(`Counter ${i + 1}: enter the label.`);
    }
    setSaving(true);
    setError("");
    try {
      const saved = await statsBandApi.save(
        items.map(({ _id, ...it }) => ({ ...it, number: it.number.trim(), label: it.label.trim() })),
      );
      setItems(saved.items);
      setMeta({ updatedAt: saved.updatedAt, updatedBy: saved.updatedBy });
      showSuccess("Counters saved. The website updates within 30 seconds.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save the counters.";
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
        Loading the website counters...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* LIVE PREVIEW of the website strip */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[8px] bg-[#032e1c] px-[14px] py-[10px]">
        {items.filter((it) => it.isActive).map((it, i) => {
          const Icon = ICON_BY_NAME[it.icon] ?? Users;
          return (
            <div key={i} className="flex items-center gap-[6px]">
              <Icon className="h-[18px] w-[18px] text-[#cfa144]" />
              <span className="leading-none">
                <span className="block text-[12px] font-semibold text-white">{it.number || "0"}</span>
                <span className="mt-[2px] block text-[8px] font-medium uppercase tracking-wider text-gray-300">{it.label || "LABEL"}</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[12px] font-bold text-[#334155]">
          Counter Stats{" "}
          <span className="font-medium text-[#64748b]">({items.length} total, {items.filter((i) => i.isActive).length} shown)</span>
        </div>
        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, newItem()])}
          disabled={items.length >= MAX_ITEMS}
          className="inline-flex h-[30px] items-center gap-[5px] border border-dashed border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] transition hover:bg-[#ccfbf1] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3 w-3" /> Add Stat
        </button>
      </div>

      {items.map((item, index) => (
        <div key={item._id ?? `new-${index}`} className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-white p-[12px]">
          <div className="flex items-center gap-[10px]">
            <span className="text-[11px] font-bold text-[#4B1426]">{item.label || `Counter ${index + 1}`}</span>
            <div className="ml-auto flex items-center gap-[6px]">
              <span className={`text-[10px] font-bold ${item.isActive ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
                {item.isActive ? "Shown" : "Hidden"}
              </span>
              <Toggle checked={item.isActive} onChange={(v) => update(index, "isActive", v)} />
              <button type="button" title="Move up" disabled={index === 0} onClick={() => move(index, -1)}
                className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                <ArrowUp className="h-3 w-3" />
              </button>
              <button type="button" title="Move down" disabled={index === items.length - 1} onClick={() => move(index, 1)}
                className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                <ArrowDown className="h-3 w-3" />
              </button>
              <button type="button" title="Remove counter" onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                className="grid h-[26px] w-[26px] place-items-center border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_2fr] gap-[10px]">
            <div>
              <FieldLabel required>Number</FieldLabel>
              <TextInput value={item.number} onChange={(v) => update(index, "number", v.toUpperCase())} placeholder="150+" maxLength={10} />
            </div>
            <div>
              <FieldLabel required>Label</FieldLabel>
              <TextInput value={item.label} onChange={(v) => update(index, "label", v.toUpperCase())} placeholder="EXPERT SPEAKERS" maxLength={30} />
            </div>
          </div>
          <p className="-mt-[4px] text-[10px] text-[#64748b]">Numbers like 150+ or 1,000+ count up on the website. Text like ENDLESS is shown as it is.</p>

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
                    onClick={() => update(index, "icon", name)}
                    className={`flex h-[34px] items-center gap-[5px] rounded-[5px] border px-[8px] text-[10px] font-semibold transition ${
                      selected
                        ? "border-[#0f766e] bg-[#f0fdfa] text-[#0f766e] shadow-[0_0_0_1px_#0f766e]"
                        : "border-[#e2e8f0] bg-white text-[#475569] hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={`h-[14px] w-[14px] ${selected ? "text-[#cfa144]" : ""}`} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}

      <div className="flex items-center justify-end gap-[10px]">
        {meta.updatedAt && meta.updatedBy !== "default" && (
          <span className="text-[10px] text-[#64748b]">
            Last saved {new Date(meta.updatedAt).toLocaleString("en-IN")}
            {meta.updatedBy ? ` by ${meta.updatedBy}` : ""}
          </span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex h-[32px] items-center gap-1.5 rounded-[4px] bg-[#16a34a] px-[14px] text-[12px] font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save Counters
        </button>
      </div>
    </div>
  );
}
