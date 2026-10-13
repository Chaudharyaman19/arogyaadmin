"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { FieldLabel, Textarea, TextInput } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { galleryHeroApi, GalleryHero } from "@/lib/galleryHeroApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   GALLERY HERO — the banner at the top of the website Gallery
   page. Loads from and saves straight to backend-arogya (the
   image goes to Cloudinary), so it has its own Save button —
   page sections are only stored locally.
========================================================= */

const EMPTY: GalleryHero = {
  heading: "GLIMPSES",
  subheading: "",
  description: "",
  bgImage: "",
  bgAlt: "",
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

export function GalleryHeroEditor() {
  const [data, setData] = useState<GalleryHero>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    galleryHeroApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load the hero."))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof GalleryHero, value: string) => setData((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!data.heading.trim()) return setError("Enter the heading.");
    if (data.bgImage.trim() && !data.bgAlt.trim()) return setError("Enter the background image alt text.");

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await galleryHeroApi.save(input);
      setData({ ...EMPTY, ...saved });
      showSuccess("Gallery Hero saved. Refresh the website Gallery page to see it.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save the hero.";
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
        Loading Gallery Hero...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Panel title="Heading & Text">
        <div>
          <FieldLabel required>Heading (H1)</FieldLabel>
          <TextInput value={data.heading} onChange={(v) => set("heading", v.toUpperCase())} maxLength={16} />
          <p className="mt-[2px] text-[10px] text-[#64748b]">The Gallery page&apos;s only H1 on the website.</p>
        </div>
        <div>
          <FieldLabel>Subheading</FieldLabel>
          <TextInput value={data.subheading} onChange={(v) => set("subheading", v)} maxLength={60} />
        </div>
        <div>
          <FieldLabel>Description</FieldLabel>
          <Textarea value={data.description} onChange={(v) => set("description", v)} rows={4} maxLength={300} />
        </div>
      </Panel>

      <Panel title="Background Image" note="Wide banner behind the text. Leave empty to use the website's built-in banner.">
        <CloudImageField
          upload={galleryHeroApi.upload}
          label="Background Image"
          value={data.bgImage}
          onChange={(v) => set("bgImage", v)}
          hint="About 1900 × 500 px, up to 5 MB"
          previewClass="h-[70px] w-[200px]"
        />
        <div>
          <FieldLabel required={Boolean(data.bgImage)}>Background Image Alt Text</FieldLabel>
          <TextInput
            value={data.bgAlt}
            onChange={(v) => set("bgAlt", v)}
            placeholder="Describe what the background shows (for SEO & screen readers)"
            maxLength={150}
          />
        </div>
      </Panel>

      {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}

      <div className="flex items-center justify-end gap-[10px]">
        {data.updatedAt && data.updatedBy && (
          <span className="text-[10px] text-[#64748b]">
            Last saved {new Date(data.updatedAt).toLocaleString("en-IN")} by {data.updatedBy}
          </span>
        )}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex h-[32px] items-center gap-1.5 rounded-[4px] bg-[#16a34a] px-[14px] text-[12px] font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save Gallery Hero
        </button>
      </div>
    </div>
  );
}
