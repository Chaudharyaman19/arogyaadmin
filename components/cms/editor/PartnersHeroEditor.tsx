"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { FieldLabel, Textarea, TextInput } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { partnersHeroApi, PartnersHero } from "@/lib/partnerLogosApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   PARTNERS HERO — the banner at the top of the website
   Partners & Supporters page. Loads from and saves straight to
   backend-arogya (images go to Cloudinary), so it has its own
   Save button — page sections are only stored locally.
========================================================= */

const EMPTY: PartnersHero = {
  blueTitle: "OUR PARTNERS",
  greenTitle: "",
  description: "",
  bgImage: "",
  bgImageAlt: "",
  badge1Title: "",
  badge1Icon: "",
  badge1IconAlt: "",
  badge2Title: "",
  badge2Icon: "",
  badge2IconAlt: "",
  badge3Title: "",
  badge3Icon: "",
  badge3IconAlt: "",
};

const BADGES = [1, 2, 3] as const;

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

export function PartnersHeroEditor() {
  const [data, setData] = useState<PartnersHero>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    partnersHeroApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load the hero."))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof PartnersHero, value: string) => setData((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    if (!data.blueTitle.trim()) return setError("Enter the title (blue line).");
    if (data.bgImage.trim() && !data.bgImageAlt.trim()) return setError("Enter the background image alt text.");
    for (const n of BADGES) {
      if (data[`badge${n}Icon`].trim() && !data[`badge${n}IconAlt`].trim()) return setError(`Badge ${n}: enter the icon alt text.`);
    }

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await partnersHeroApi.save(input);
      setData({ ...EMPTY, ...saved });
      showSuccess("Partners Hero saved. Refresh the website Partners page to see it.");
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
        Loading Partners Hero...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Panel title="Heading & Text" note="The two title lines together are the page's only H1 on the website.">
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel required>Title — Blue Line (H1)</FieldLabel>
            <TextInput value={data.blueTitle} onChange={(v) => set("blueTitle", v.toUpperCase())} maxLength={30} />
          </div>
          <div>
            <FieldLabel>Title — Green Line (H1)</FieldLabel>
            <TextInput value={data.greenTitle} onChange={(v) => set("greenTitle", v.toUpperCase())} maxLength={30} />
          </div>
        </div>
        <div>
          <FieldLabel>Description</FieldLabel>
          <Textarea value={data.description} onChange={(v) => set("description", v)} rows={2} maxLength={200} />
        </div>
      </Panel>

      <Panel title="Background Image" note="Wide banner behind the text — keep the left side plain so the text stays readable. Leave empty to use the website's built-in banner.">
        <CloudImageField
          upload={partnersHeroApi.upload}
          label="Background Image"
          value={data.bgImage}
          onChange={(v) => set("bgImage", v)}
          hint="About 1900 × 600 px, up to 5 MB"
          previewClass="h-[70px] w-[200px]"
        />
        <div>
          <FieldLabel required={Boolean(data.bgImage)}>Background Image Alt Text</FieldLabel>
          <TextInput
            value={data.bgImageAlt}
            onChange={(v) => set("bgImageAlt", v)}
            placeholder="Describe what the background shows (for SEO & screen readers)"
            maxLength={150}
          />
        </div>
      </Panel>

      <Panel title="Badges" note="The three badges under the description. The first word of a title goes on the top line, the rest below it.">
        {BADGES.map((n) => (
          <div key={n} className="grid grid-cols-[auto_1fr_1fr] items-end gap-[10px]">
            <CloudImageField
              upload={partnersHeroApi.upload}
              label={`Badge ${n} Icon`}
              value={data[`badge${n}Icon`]}
              onChange={(v) => set(`badge${n}Icon`, v)}
              hint="Round icon, PNG"
              previewClass="h-[48px] w-[48px]"
            />
            <div>
              <FieldLabel>Badge {n} Title</FieldLabel>
              <TextInput value={data[`badge${n}Title`]} onChange={(v) => set(`badge${n}Title`, v)} maxLength={30} />
            </div>
            <div>
              <FieldLabel required={Boolean(data[`badge${n}Icon`])}>Badge {n} Icon Alt Text</FieldLabel>
              <TextInput value={data[`badge${n}IconAlt`]} onChange={(v) => set(`badge${n}IconAlt`, v)} maxLength={150} />
            </div>
          </div>
        ))}
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
          Save Partners Hero
        </button>
      </div>
    </div>
  );
}
