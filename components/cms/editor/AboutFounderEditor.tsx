"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { FieldLabel, Textarea, TextInput } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { aboutFounderApi, AboutFounder } from "@/lib/aboutFounderApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   ABOUT THE FOUNDER — the dark green founder card on the
   website About Us page. Loads from and saves straight to
   backend-arogya (images go to Cloudinary), so it has its own
   Save button — page sections are only stored locally.
========================================================= */

const EMPTY: AboutFounder = {
  heading: "ABOUT THE FOUNDER",
  name: "",
  designation: "",
  description: "",
  messageHeading: "FOUNDER'S MESSAGE",
  message: "",
  image: "",
  imageAlt: "",
  leafImage: "",
  leafImageAlt: "Gold leaf decoration",
  lotusImage: "",
  lotusImageAlt: "Gold lotus decoration",
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

export function AboutFounderEditor() {
  const [data, setData] = useState<AboutFounder>(EMPTY);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    aboutFounderApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
        else setIsSaved(false);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load About The Founder."))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof AboutFounder, value: string) => setData((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!data.heading.trim()) return setError("Enter the heading (e.g. ABOUT THE FOUNDER).");
    if (!data.name.trim()) return setError("Enter the founder's name.");
    if (!data.image.trim()) return setError("Upload the founder photo.");
    if (!data.imageAlt.trim()) return setError("Enter the founder photo alt text.");
    if (data.leafImage && !data.leafImageAlt.trim()) return setError("Enter the alt text of the leaf image.");
    if (data.lotusImage && !data.lotusImageAlt.trim()) return setError("Enter the alt text of the lotus image.");

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await aboutFounderApi.save(input);
      setData({ ...EMPTY, ...saved });
      setIsSaved(true);
      showSuccess("About The Founder saved. The website updates within 30 seconds.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save About The Founder.";
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
        Loading About The Founder...
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

      <Panel title="Founder" note="Left side of the card. The name is also shown under the message.">
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel required>Heading</FieldLabel>
            <TextInput value={data.heading} onChange={(v) => set("heading", v.toUpperCase())} maxLength={30} />
          </div>
          <div>
            <FieldLabel required>Founder Name</FieldLabel>
            <TextInput value={data.name} onChange={(v) => set("name", v)} placeholder="Mr. Vijay Sharma" maxLength={40} />
          </div>
        </div>
        <div>
          <FieldLabel>Designation</FieldLabel>
          <TextInput value={data.designation} onChange={(v) => set("designation", v)} placeholder="Founder, Namo Gange Trust" maxLength={50} />
        </div>
        <div>
          <FieldLabel>Description</FieldLabel>
          <Textarea value={data.description} onChange={(v) => set("description", v)} rows={4} maxLength={450} />
        </div>
      </Panel>

      <Panel title="Founder Photo" note="Shown in the gold ring — a square photo with the face near the top works best.">
        <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
          <CloudImageField
            upload={aboutFounderApi.upload}
            label="Photo"
            required
            value={data.image}
            onChange={(v) => set("image", v)}
            hint="Square, at least 400 × 400 px"
            previewClass="h-[70px] w-[70px]"
          />
          <div>
            <FieldLabel required>Photo Alt Text</FieldLabel>
            <TextInput value={data.imageAlt} onChange={(v) => set("imageAlt", v)} placeholder="Mr. Vijay Sharma, Founder of Namo Gange Trust" maxLength={150} />
          </div>
        </div>
      </Panel>

      <Panel title="Founder's Message" note="Right side of the card, between the gold quote marks. Press Enter for a new line.">
        <div>
          <FieldLabel>Message Heading</FieldLabel>
          <TextInput value={data.messageHeading} onChange={(v) => set("messageHeading", v.toUpperCase())} maxLength={30} />
        </div>
        <div>
          <FieldLabel>Message</FieldLabel>
          <Textarea value={data.message} onChange={(v) => set("message", v)} rows={4} maxLength={700} />
        </div>
      </Panel>

      <Panel title="Decorations" note="Leave an image empty to hide it.">
        <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
          <CloudImageField
            upload={aboutFounderApi.upload}
            label="Gold Leaf (beside the photo)"
            value={data.leafImage}
            onChange={(v) => set("leafImage", v)}
            hint="Transparent PNG"
            previewClass="h-[56px] w-[56px]"
          />
          <div>
            <FieldLabel required={Boolean(data.leafImage)}>Leaf Image Alt Text</FieldLabel>
            <TextInput value={data.leafImageAlt} onChange={(v) => set("leafImageAlt", v)} maxLength={150} />
          </div>
        </div>
        <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
          <CloudImageField
            upload={aboutFounderApi.upload}
            label="Lotus (faint, bottom right)"
            value={data.lotusImage}
            onChange={(v) => set("lotusImage", v)}
            hint="Transparent image"
            previewClass="h-[56px] w-[56px]"
          />
          <div>
            <FieldLabel required={Boolean(data.lotusImage)}>Lotus Image Alt Text</FieldLabel>
            <TextInput value={data.lotusImageAlt} onChange={(v) => set("lotusImageAlt", v)} maxLength={150} />
          </div>
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
          Save About The Founder
        </button>
      </div>
    </div>
  );
}
