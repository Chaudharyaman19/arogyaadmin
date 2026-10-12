"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { FieldLabel, Textarea, TextInput } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { paperHeroApi, PaperHero } from "@/lib/paperPresentationApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   PAPER PRESENTATION HERO — the banner at the top of the
   website Paper Presentation page. Loads from and saves straight
   to backend-arogya (images go to Cloudinary), so it has its own
   Save button — page sections are only stored locally.
========================================================= */

const EMPTY: PaperHero = {
  eyebrow: "",
  title: "Paper\nPresentation",
  dividerImage: "",
  dividerImageAlt: "Green lotus logo",
  description: "",
  backgroundImage: "",
  backgroundImageAlt: "",
  badgeText: "",
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

export function PaperHeroEditor() {
  const [data, setData] = useState<PaperHero>(EMPTY);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    paperHeroApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
        else setIsSaved(false);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load the hero."))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof PaperHero, value: string) => setData((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!data.title.trim()) return setError("Enter the title.");
    if (data.dividerImage && !data.dividerImageAlt.trim()) return setError("Enter the alt text of the lotus divider.");
    if (!data.backgroundImage.trim()) return setError("Upload a background image.");
    if (!data.backgroundImageAlt.trim()) return setError("Enter the background image alt text.");

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await paperHeroApi.save(input);
      setData({ ...EMPTY, ...saved });
      setIsSaved(true);
      showSuccess("Paper Presentation Hero saved. The website updates within 30 seconds.");
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
        Loading Paper Presentation Hero...
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

      <Panel title="Heading & Text" note="Press Enter in the title, description or badge to start a new line on the website.">
        <div>
          <FieldLabel>Eyebrow</FieldLabel>
          <TextInput value={data.eyebrow} onChange={(v) => set("eyebrow", v.toUpperCase())} maxLength={45} />
        </div>
        <div>
          <FieldLabel required>Title (H1)</FieldLabel>
          <Textarea value={data.title} onChange={(v) => set("title", v)} rows={2} maxLength={50} />
          <p className="mt-[2px] text-[10px] text-[#64748b]">The page&apos;s only H1. First line is dark green, the next line gold.</p>
        </div>
        <div>
          <FieldLabel>Description</FieldLabel>
          <Textarea value={data.description} onChange={(v) => set("description", v)} rows={4} maxLength={450} />
        </div>
        <div>
          <FieldLabel>Badge Text (green circle)</FieldLabel>
          <Textarea value={data.badgeText} onChange={(v) => set("badgeText", v)} rows={3} maxLength={60} />
        </div>
      </Panel>

      <Panel title="Lotus Divider" note="Small icon on the gold line under the title. Leave empty to show only the line.">
        <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
          <CloudImageField
            upload={paperHeroApi.upload}
            label="Divider Image"
            value={data.dividerImage}
            onChange={(v) => set("dividerImage", v)}
            hint="Small icon, transparent"
            previewClass="h-[48px] w-[48px]"
          />
          <div>
            <FieldLabel required={Boolean(data.dividerImage)}>Divider Alt Text</FieldLabel>
            <TextInput value={data.dividerImageAlt} onChange={(v) => set("dividerImageAlt", v)} maxLength={150} />
          </div>
        </div>
      </Panel>

      <Panel title="Background Image" note="Wide banner — keep the left side plain so the text stays readable.">
        <CloudImageField
          upload={paperHeroApi.upload}
          label="Background Image"
          required
          value={data.backgroundImage}
          onChange={(v) => set("backgroundImage", v)}
          hint="About 1900 × 820 px, up to 5 MB"
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
          Save Paper Presentation Hero
        </button>
      </div>
    </div>
  );
}
