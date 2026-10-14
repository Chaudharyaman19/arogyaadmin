"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { FieldLabel, TextInput } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { galleryJoinUsApi, GalleryJoinUs } from "@/lib/galleryHeroApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   GALLERY JOIN US BANNER — the dark green banner at the bottom
   of the website Gallery page. Loads from and saves straight to
   backend-arogya (the image goes to Cloudinary), so it has its
   own Save button — page sections are only stored locally.
========================================================= */

const EMPTY: GalleryJoinUs = {
  tagline: "",
  title: "",
  buttonLabel: "",
  buttonHref: "/register-now",
  date: "",
  dateSub: "",
  location: "",
  locationSub: "",
  image: "",
  imageAlt: "",
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

export function GalleryJoinUsEditor() {
  const [data, setData] = useState<GalleryJoinUs>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    galleryJoinUsApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load the banner."))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof GalleryJoinUs, value: string) => setData((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    const href = data.buttonHref.trim();
    if (!data.title.trim()) return setError("Enter the title.");
    if (!data.buttonLabel.trim()) return setError("Enter the button label.");
    if (!href) return setError("Enter the button link.");
    if (!/^(\/(?!\/)|https?:\/\/)/.test(href)) {
      return setError('The button link must start with "/" (a page on this website) or "https://".');
    }
    if (data.image.trim() && !data.imageAlt.trim()) return setError("Enter the image alt text.");

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await galleryJoinUsApi.save(input);
      setData({ ...EMPTY, ...saved });
      showSuccess("Join Us banner saved. Refresh the website Gallery page to see it.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save the banner.";
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
        Loading Join Us banner...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Panel title="Heading & Button">
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel>Tagline</FieldLabel>
            <TextInput value={data.tagline} onChange={(v) => set("tagline", v)} maxLength={45} />
          </div>
          <div>
            <FieldLabel required>Title</FieldLabel>
            <TextInput value={data.title} onChange={(v) => set("title", v)} maxLength={45} />
          </div>
          <div>
            <FieldLabel required>Button Label</FieldLabel>
            <TextInput value={data.buttonLabel} onChange={(v) => set("buttonLabel", v.toUpperCase())} maxLength={20} />
          </div>
          <div>
            <FieldLabel required>Button Link (Href)</FieldLabel>
            <TextInput value={data.buttonHref} onChange={(v) => set("buttonHref", v)} placeholder="/register-now" maxLength={120} />
          </div>
        </div>
        <p className="text-[10px] text-[#64748b]">
          Link: start with &quot;/&quot; for a page on the website (e.g. /register-now), or paste a full https:// link.
        </p>
      </Panel>

      <Panel title="Date & Location">
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel>Date</FieldLabel>
            <TextInput value={data.date} onChange={(v) => set("date", v)} maxLength={24} />
          </div>
          <div>
            <FieldLabel>Date Sub</FieldLabel>
            <TextInput value={data.dateSub} onChange={(v) => set("dateSub", v)} maxLength={20} />
          </div>
          <div>
            <FieldLabel>Location</FieldLabel>
            <TextInput value={data.location} onChange={(v) => set("location", v)} maxLength={20} />
          </div>
          <div>
            <FieldLabel>Location Sub</FieldLabel>
            <TextInput value={data.locationSub} onChange={(v) => set("locationSub", v)} maxLength={20} />
          </div>
        </div>
      </Panel>

      <Panel title="Banner Image" note="The decoration on the left of the banner. Leave empty to use the website's built-in image.">
        <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
          <CloudImageField
            upload={galleryJoinUsApi.upload}
            label="Image"
            value={data.image}
            onChange={(v) => set("image", v)}
            hint="Transparent PNG, up to 5 MB"
            previewClass="h-[60px] w-[90px]"
          />
          <div>
            <FieldLabel required={Boolean(data.image)}>Image Alt Text</FieldLabel>
            <TextInput
              value={data.imageAlt}
              onChange={(v) => set("imageAlt", v)}
              placeholder="Describe the image (for SEO & screen readers)"
              maxLength={150}
            />
          </div>
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
          Save Join Us Banner
        </button>
      </div>
    </div>
  );
}
