"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { FieldLabel, Textarea, TextInput } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { galleryCountersApi, GalleryCounter } from "@/lib/galleryHeroApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   GALLERY IMPACT COUNTERS — the stats strip under the photo
   grid on the website Gallery page. Loads from and saves
   straight to backend-arogya (icons go to Cloudinary), so it
   has its own Save button — page sections are only stored locally.
========================================================= */

const MAX_COUNTERS = 8;

const blank = (): GalleryCounter => ({ number: "", label: "", image: "", imageAlt: "" });

export function GalleryCountersEditor() {
  const [counters, setCounters] = useState<GalleryCounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    galleryCountersApi
      .get()
      .then((res) => setCounters(res ?? []))
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load the counters."))
      .finally(() => setLoading(false));
  }, []);

  const update = (index: number, key: keyof GalleryCounter, value: string) =>
    setCounters((prev) => prev.map((c, i) => (i === index ? { ...c, [key]: value } : c)));

  const move = (index: number, by: -1 | 1) =>
    setCounters((prev) => {
      const next = [...prev];
      const target = index + by;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const save = async () => {
    if (counters.length === 0) return setError("Add at least one counter.");
    for (const [i, c] of counters.entries()) {
      if (!c.number.trim()) return setError(`Counter ${i + 1}: enter the number.`);
      if (!c.label.trim()) return setError(`Counter ${i + 1}: enter the label.`);
      if (c.image.trim() && !c.imageAlt.trim()) return setError(`Counter ${i + 1}: enter the icon alt text.`);
    }

    setSaving(true);
    setError("");
    try {
      setCounters(await galleryCountersApi.save(counters));
      showSuccess("Gallery counters saved. Refresh the website Gallery page to see them.");
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
        Loading Gallery Counters...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-[#64748b]">
          Shown left to right in this order. Press Enter in a label to split it over two lines on the website.
        </p>
        <button
          type="button"
          onClick={() => setCounters((prev) => [...prev, blank()])}
          disabled={counters.length >= MAX_COUNTERS}
          className="inline-flex h-[26px] shrink-0 items-center gap-1 rounded-[4px] border border-[#cbd5e1] bg-[#f8fafc] px-[10px] text-[10.5px] font-semibold text-[#334155] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3 w-3" />
          Add Counter ({counters.length}/{MAX_COUNTERS})
        </button>
      </div>

      {counters.map((counter, index) => (
        <div key={counter._id ?? `new-${index}`} className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-white p-[12px]">
          <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
            <div className="text-[11px] font-bold text-[#1e40af]">
              Counter {index + 1}
              {counter.label.trim() && <span className="font-medium text-[#64748b]"> — {counter.label.replace(/\s+/g, " ")}</span>}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Move up"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:opacity-30"
              >
                <ArrowUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                title="Move down"
                onClick={() => move(index, 1)}
                disabled={index === counters.length - 1}
                className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:opacity-30"
              >
                <ArrowDown className="h-3 w-3" />
              </button>
              <button
                type="button"
                title="Remove counter"
                onClick={() => setCounters((prev) => prev.filter((_, i) => i !== index))}
                className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[10px]">
            <div>
              <FieldLabel required>Number</FieldLabel>
              <TextInput value={counter.number} onChange={(v) => update(index, "number", v)} placeholder="e.g. 25,000+" maxLength={12} />
            </div>
            <div>
              <FieldLabel required>Label</FieldLabel>
              <Textarea value={counter.label} onChange={(v) => update(index, "label", v)} rows={2} maxLength={40} />
            </div>
          </div>

          <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
            <CloudImageField
              upload={galleryCountersApi.upload}
              label="Icon"
              value={counter.image}
              onChange={(v) => update(index, "image", v)}
              hint="Small icon, transparent PNG"
              previewClass="h-[48px] w-[48px]"
            />
            <div>
              <FieldLabel required={Boolean(counter.image)}>Icon Alt Text</FieldLabel>
              <TextInput
                value={counter.imageAlt}
                onChange={(v) => update(index, "imageAlt", v)}
                placeholder="Describe the icon (for SEO & screen readers)"
                maxLength={150}
              />
            </div>
          </div>
        </div>
      ))}

      {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex h-[32px] items-center gap-1.5 rounded-[4px] bg-[#16a34a] px-[14px] text-[12px] font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save Gallery Counters
        </button>
      </div>
    </div>
  );
}
