"use client";

import { useEffect, useState } from "react";
import { Calendar, Loader2, MapPin, Save, Users } from "lucide-react";
import { FieldLabel, Textarea, TextInput } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { aboutConferenceApi, AboutConference } from "@/lib/aboutConferenceApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   ABOUT THE CONFERENCE — the banner section under "Why Arogya"
   on the website home page. Loads from and saves straight to
   backend-arogya (images go to Cloudinary), so it has its own
   Save button — page sections are only stored locally.
========================================================= */

const EMPTY: AboutConference = {
  eyebrow: "ABOUT",
  eyebrowImage: "",
  eyebrowImageAlt: "Green lotus logo",
  headingLine1: "ABOUT",
  headingLine2: "THE CONFERENCE",
  subtitle: "",
  paragraph1: "",
  paragraph2: "",
  dateBadge: "",
  venueBadge: "",
  delegatesBadge: "",
  backgroundImage: "",
  backgroundImageAlt: "",
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

export function AboutConferenceEditor() {
  const [data, setData] = useState<AboutConference>(EMPTY);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    aboutConferenceApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
        else setIsSaved(false);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load this section."))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof AboutConference, value: string) => setData((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!data.eyebrow.trim()) return setError("Enter the eyebrow (e.g. ABOUT).");
    if (!data.headingLine1.trim()) return setError("Enter heading line 1.");
    if (data.eyebrowImage && !data.eyebrowImageAlt.trim()) return setError("Enter the alt text of the image next to the eyebrow.");
    if (!data.backgroundImage.trim()) return setError("Upload a background image.");
    if (!data.backgroundImageAlt.trim()) return setError("Enter the background image alt text.");

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await aboutConferenceApi.save(input);
      setData({ ...EMPTY, ...saved });
      setIsSaved(true);
      showSuccess("About The Conference saved. The website updates within 30 seconds.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save this section.";
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
        Loading About The Conference...
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

      <Panel title="Eyebrow" note="Small gold label with the lotus image between two lines.">
        <div className="grid grid-cols-[1fr_2fr] gap-[10px]">
          <div>
            <FieldLabel required>Eyebrow Text</FieldLabel>
            <TextInput value={data.eyebrow} onChange={(v) => set("eyebrow", v.toUpperCase())} maxLength={15} />
          </div>
          <div>
            <FieldLabel required={Boolean(data.eyebrowImage)}>Lotus Image Alt Text</FieldLabel>
            <TextInput value={data.eyebrowImageAlt} onChange={(v) => set("eyebrowImageAlt", v)} placeholder="Green lotus logo" maxLength={150} />
          </div>
        </div>
        <CloudImageField
          upload={aboutConferenceApi.upload}
          label="Lotus Image (next to the eyebrow)"
          value={data.eyebrowImage}
          onChange={(v) => set("eyebrowImage", v)}
          hint="Small icon, transparent background"
          previewClass="h-[60px] w-[60px]"
        />
      </Panel>

      <Panel title="Heading & Text">
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel required>Heading Line 1 (dark)</FieldLabel>
            <TextInput value={data.headingLine1} onChange={(v) => set("headingLine1", v.toUpperCase())} maxLength={30} />
          </div>
          <div>
            <FieldLabel>Heading Line 2 (gold)</FieldLabel>
            <TextInput value={data.headingLine2} onChange={(v) => set("headingLine2", v.toUpperCase())} maxLength={30} />
          </div>
        </div>
        <div>
          <FieldLabel>Subtitle</FieldLabel>
          <TextInput value={data.subtitle} onChange={(v) => set("subtitle", v.toUpperCase())} maxLength={80} />
        </div>
        <div>
          <FieldLabel>Paragraph 1</FieldLabel>
          <Textarea value={data.paragraph1} onChange={(v) => set("paragraph1", v)} rows={3} maxLength={260} />
        </div>
        <div>
          <FieldLabel>Paragraph 2</FieldLabel>
          <Textarea value={data.paragraph2} onChange={(v) => set("paragraph2", v)} rows={3} maxLength={300} />
        </div>
      </Panel>

      <Panel title="Info Badges" note="Press Enter to put the rest of a badge on a second line. Leave one empty to hide it.">
        <div className="grid grid-cols-3 gap-[10px]">
          {([
            ["dateBadge", "Date Badge", Calendar, 40],
            ["venueBadge", "Venue Badge", MapPin, 60],
            ["delegatesBadge", "Delegates Badge", Users, 70],
          ] as const).map(([key, label, Icon, max]) => (
            <div key={key}>
              <FieldLabel>
                <span className="inline-flex items-center gap-[4px]">
                  <Icon className="h-3 w-3 text-[#a07b30]" /> {label}
                </span>
              </FieldLabel>
              <Textarea value={data[key]} onChange={(v) => set(key, v.toUpperCase())} rows={2} maxLength={max} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Background Image" note="Wide banner behind the text — keep the left side plain so the text stays readable.">
        <CloudImageField
          upload={aboutConferenceApi.upload}
          label="Background Image"
          required
          value={data.backgroundImage}
          onChange={(v) => set("backgroundImage", v)}
          hint="About 1600 × 500 px, up to 5 MB"
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
          Save About The Conference
        </button>
      </div>
    </div>
  );
}
