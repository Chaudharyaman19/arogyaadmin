"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";
import { FieldLabel, Textarea, TextInput } from "./FormPrimitives";
import { galleryVideoSectionApi, GalleryVideoSection } from "@/lib/galleryHeroApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   GALLERY VIDEO HIGHLIGHTS — the section heading and the
   "Share Your Moments" box on the website Gallery page. Loads
   from and saves straight to backend-arogya, so it has its own
   Save button. The videos are managed on the Video Highlights page.
========================================================= */

const EMPTY: GalleryVideoSection = {
  heading: "VIDEO HIGHLIGHTS",
  shareTitle: "",
  shareDescription: "",
  shareButton: "",
};

export function GalleryVideoSectionEditor() {
  const [data, setData] = useState<GalleryVideoSection>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    galleryVideoSectionApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load the section."))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof GalleryVideoSection, value: string) => setData((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!data.heading.trim()) return setError("Enter the heading.");
    if (!data.shareTitle.trim()) return setError("Enter the share title.");
    if (!data.shareDescription.trim()) return setError("Enter the share description.");
    if (!data.shareButton.trim()) return setError("Enter the share button text.");

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await galleryVideoSectionApi.save(input);
      setData({ ...EMPTY, ...saved });
      showSuccess("Video Highlights section saved. Refresh the website Gallery page to see it.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save the section.";
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
        Loading Video Highlights section...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-white p-[12px]">
        <div>
          <FieldLabel required>Heading</FieldLabel>
          <TextInput value={data.heading} onChange={(v) => set("heading", v.toUpperCase())} maxLength={24} />
        </div>
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel required>Share Title</FieldLabel>
            <TextInput value={data.shareTitle} onChange={(v) => set("shareTitle", v)} maxLength={24} />
          </div>
          <div>
            <FieldLabel required>Share Button</FieldLabel>
            <TextInput value={data.shareButton} onChange={(v) => set("shareButton", v)} maxLength={24} />
          </div>
        </div>
        <div>
          <FieldLabel required>Share Description</FieldLabel>
          <Textarea value={data.shareDescription} onChange={(v) => set("shareDescription", v)} rows={2} maxLength={120} />
          <p className="mt-[2px] text-[10px] text-[#64748b]">Press Enter to start a new line on the website.</p>
        </div>
      </div>

      <p className="text-[10px] text-[#64748b]">
        The videos shown in this section are added and ordered on the{" "}
        <Link href="/video-highlights" className="font-semibold text-[#0f766e] hover:underline">
          Video Highlights
        </Link>{" "}
        page.
      </p>

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
          Save Video Highlights Section
        </button>
      </div>
    </div>
  );
}
