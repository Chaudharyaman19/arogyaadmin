"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { FieldLabel, Textarea, TextInput, Toggle } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { visionMissionApi, ChairmanCard, MissionBlock, VisionMission } from "@/lib/visionMissionApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   VISION, MISSION & CHAIRMAN — the three cards under the stats
   band on the website home page. Loads from and saves straight to
   backend-arogya (images go to Cloudinary), so it has its own Save
   button — page sections are only stored locally. The chairman card
   is the same record admin-arogya edits (Chairman Message).
========================================================= */

const MAX_BLOCKS = 6;

const EMPTY_CHAIRMAN: ChairmanCard = {
  heading: "CHAIRMAN'S MESSAGE",
  message: "",
  name: "",
  designation: "Chairman",
  image: "",
  imageAlt: "",
  leafImage: "",
  leafImageAlt: "Green leaf decoration",
};

const EMPTY: VisionMission = {
  dividerImage: "",
  dividerImageAlt: "Green lotus divider",
  visionHeading: "OUR VISION",
  visionText: "",
  visionIcon: "",
  visionIconAlt: "",
  visionImage: "",
  visionImageAlt: "",
  missionHeading: "OUR MISSION",
  missionBlocks: [],
  chairman: EMPTY_CHAIRMAN,
};

const newBlock = (): MissionBlock => ({ heading: "", body: "", image: "", imageAlt: "", isActive: true });

function Panel({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
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

/** Image upload + its alt text side by side */
function ImageWithAlt({ label, value, alt, onImage, onAlt, hint, previewClass, required }: {
  label: string; value: string; alt: string; onImage: (v: string) => void; onAlt: (v: string) => void;
  hint: string; previewClass: string; required?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1.4fr_1fr] gap-[10px]">
      <CloudImageField upload={visionMissionApi.upload} label={label} required={required} value={value}
        onChange={onImage} hint={hint} previewClass={previewClass} />
      <div>
        <FieldLabel required={required || Boolean(value)}>{label} Alt Text</FieldLabel>
        <TextInput value={alt} onChange={onAlt} placeholder="Describe the image" maxLength={150} />
      </div>
    </div>
  );
}

export function VisionMissionEditor() {
  const [data, setData] = useState<VisionMission>(EMPTY);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    visionMissionApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res, chairman: { ...EMPTY_CHAIRMAN, ...res.chairman } });
        else {
          setData({ ...EMPTY, missionBlocks: [newBlock()] });
          setIsSaved(false);
        }
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load this section."))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof VisionMission>(key: K, value: VisionMission[K]) => setData((prev) => ({ ...prev, [key]: value }));
  const setChairman = (key: keyof ChairmanCard, value: string) =>
    setData((prev) => ({ ...prev, chairman: { ...prev.chairman, [key]: value } }));
  const updateBlock = <K extends keyof MissionBlock>(i: number, key: K, value: MissionBlock[K]) =>
    setData((prev) => ({ ...prev, missionBlocks: prev.missionBlocks.map((b, idx) => (idx === i ? { ...b, [key]: value } : b)) }));
  const moveBlock = (i: number, direction: -1 | 1) =>
    setData((prev) => {
      const target = i + direction;
      if (target < 0 || target >= prev.missionBlocks.length) return prev;
      const blocks = [...prev.missionBlocks];
      [blocks[i], blocks[target]] = [blocks[target], blocks[i]];
      return { ...prev, missionBlocks: blocks };
    });

  const validate = (): string | null => {
    const needsAlt: [string, string, string][] = [
      ["Divider image", data.dividerImage, data.dividerImageAlt],
      ["Vision icon", data.visionIcon, data.visionIconAlt],
      ["Vision lotus image", data.visionImage, data.visionImageAlt],
      ["Leaf image", data.chairman.leafImage, data.chairman.leafImageAlt],
    ];
    for (const [label, image, alt] of needsAlt) if (image && !alt.trim()) return `${label}: enter the alt text.`;
    if (!data.visionHeading.trim()) return "Enter the vision heading.";
    if (!data.missionHeading.trim()) return "Enter the mission heading.";
    if (!data.missionBlocks.length) return "Add at least one mission block.";
    for (const [i, b] of data.missionBlocks.entries()) {
      if (!b.heading.trim()) return `Mission block ${i + 1}: enter the heading.`;
      if (b.image && !b.imageAlt.trim()) return `Mission block ${i + 1}: enter the image alt text.`;
    }
    const c = data.chairman;
    if (!c.heading.trim()) return "Enter the chairman heading.";
    if (!c.message.trim()) return "Enter the chairman message.";
    if (!c.name.trim()) return "Enter the chairman name.";
    if (!c.image.trim()) return "Upload the chairman photo.";
    if (!c.imageAlt.trim()) return "Enter the chairman photo alt text.";
    return null;
  };

  const save = async () => {
    const problem = validate();
    if (problem) return setError(problem);
    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await visionMissionApi.save({
        ...input,
        missionBlocks: input.missionBlocks.map(({ _id, ...b }) => b),
      });
      setData({ ...EMPTY, ...saved, chairman: { ...EMPTY_CHAIRMAN, ...saved.chairman } });
      setIsSaved(true);
      showSuccess("Vision, Mission & Chairman saved. The website updates within 30 seconds.");
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
        Loading Vision, Mission & Chairman...
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

      <Panel title="Lotus Divider" note="Small lotus shown under all three card headings, between two lines.">
        <ImageWithAlt label="Divider Image" value={data.dividerImage} alt={data.dividerImageAlt}
          onImage={(v) => set("dividerImage", v)} onAlt={(v) => set("dividerImageAlt", v)}
          hint="Small icon, transparent background" previewClass="h-[60px] w-[60px]" />
      </Panel>

      {/* VISION */}
      <Panel title="Our Vision (dark green card)">
        <div className="grid grid-cols-[1fr_1.4fr] gap-[10px]">
          <div>
            <FieldLabel required>Vision Heading</FieldLabel>
            <TextInput value={data.visionHeading} onChange={(v) => set("visionHeading", v.toUpperCase())} maxLength={20} />
          </div>
          <div>
            <FieldLabel>Vision Text</FieldLabel>
            <Textarea value={data.visionText} onChange={(v) => set("visionText", v)} rows={5} maxLength={170} />
            <p className="mt-[2px] text-[10px] text-[#64748b]">Press Enter for a new line on the website.</p>
          </div>
        </div>
        <ImageWithAlt label="Vision Icon" value={data.visionIcon} alt={data.visionIconAlt}
          onImage={(v) => set("visionIcon", v)} onAlt={(v) => set("visionIconAlt", v)}
          hint="Icon next to the heading" previewClass="h-[60px] w-[60px]" />
        <ImageWithAlt label="Vision Lotus Image" value={data.visionImage} alt={data.visionImageAlt}
          onImage={(v) => set("visionImage", v)} onAlt={(v) => set("visionImageAlt", v)}
          hint="Large gold lotus beside the text" previewClass="h-[60px] w-[60px]" />
      </Panel>

      {/* MISSION */}
      <Panel title="Our Mission (middle card)">
        <div className="grid grid-cols-[1fr_auto] items-end gap-[10px]">
          <div>
            <FieldLabel required>Mission Heading</FieldLabel>
            <TextInput value={data.missionHeading} onChange={(v) => set("missionHeading", v.toUpperCase())} maxLength={20} />
          </div>
          <button
            type="button"
            onClick={() => set("missionBlocks", [...data.missionBlocks, newBlock()])}
            disabled={data.missionBlocks.length >= MAX_BLOCKS}
            className="inline-flex h-[35px] items-center gap-[5px] border border-dashed border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] transition hover:bg-[#ccfbf1] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3 w-3" /> Add Mission Block
          </button>
        </div>

        {data.missionBlocks.map((block, i) => (
          <div key={block._id ?? `block-${i}`} className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-[#fbfbfa] p-[10px]">
            <div className="flex items-center gap-[10px]">
              <div className="grid h-[34px] w-[34px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#032e1c]">
                {block.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={block.image} alt="" className="h-full w-full object-contain" />
                )}
              </div>
              <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-[#4B1426]">{block.heading || `Mission Block ${i + 1}`}</span>
              <span className={`text-[10px] font-bold ${block.isActive ? "text-[#16a34a]" : "text-[#dc2626]"}`}>{block.isActive ? "Shown" : "Hidden"}</span>
              <Toggle checked={block.isActive} onChange={(v) => updateBlock(i, "isActive", v)} />
              <button type="button" title="Move up" disabled={i === 0} onClick={() => moveBlock(i, -1)}
                className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                <ArrowUp className="h-3 w-3" />
              </button>
              <button type="button" title="Move down" disabled={i === data.missionBlocks.length - 1} onClick={() => moveBlock(i, 1)}
                className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
                <ArrowDown className="h-3 w-3" />
              </button>
              <button type="button" title="Remove" onClick={() => set("missionBlocks", data.missionBlocks.filter((_, idx) => idx !== i))}
                className="grid h-[26px] w-[26px] place-items-center border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            <div className="grid grid-cols-[1fr_1.4fr] gap-[10px]">
              <div>
                <FieldLabel required>Heading</FieldLabel>
                <TextInput value={block.heading} onChange={(v) => updateBlock(i, "heading", v.toUpperCase())} placeholder="CONNECT" maxLength={20} />
              </div>
              <div>
                <FieldLabel>Body</FieldLabel>
                <Textarea value={block.body} onChange={(v) => updateBlock(i, "body", v)} rows={3} maxLength={130} />
              </div>
            </div>
            <ImageWithAlt label="Icon" value={block.image} alt={block.imageAlt}
              onImage={(v) => updateBlock(i, "image", v)} onAlt={(v) => updateBlock(i, "imageAlt", v)}
              hint="Round icon" previewClass="h-[60px] w-[60px]" />
          </div>
        ))}
      </Panel>

      {/* CHAIRMAN */}
      <Panel title="Chairman's Message (right card)" note="Same record as Chairman Message in the old admin — changes show in both.">
        <div className="grid grid-cols-3 gap-[10px]">
          <div>
            <FieldLabel required>Heading</FieldLabel>
            <TextInput value={data.chairman.heading} onChange={(v) => setChairman("heading", v.toUpperCase())} maxLength={30} />
          </div>
          <div>
            <FieldLabel required>Name</FieldLabel>
            <TextInput value={data.chairman.name} onChange={(v) => setChairman("name", v)} maxLength={40} />
          </div>
          <div>
            <FieldLabel>Designation</FieldLabel>
            <TextInput value={data.chairman.designation} onChange={(v) => setChairman("designation", v)} maxLength={40} />
          </div>
        </div>
        <div>
          <FieldLabel required>Message</FieldLabel>
          <Textarea value={data.chairman.message} onChange={(v) => setChairman("message", v)} rows={5} maxLength={700} />
          <p className="mt-[2px] text-[10px] text-[#64748b]">Each line becomes its own paragraph on the website.</p>
        </div>
        <ImageWithAlt label="Chairman Photo" required value={data.chairman.image} alt={data.chairman.imageAlt}
          onImage={(v) => setChairman("image", v)} onAlt={(v) => setChairman("imageAlt", v)}
          hint="Portrait or event photo" previewClass="h-[80px] w-[110px]" />
        <ImageWithAlt label="Leaf Image" value={data.chairman.leafImage} alt={data.chairman.leafImageAlt}
          onImage={(v) => setChairman("leafImage", v)} onAlt={(v) => setChairman("leafImageAlt", v)}
          hint="Decoration in the top-right corner" previewClass="h-[70px] w-[70px]" />
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
          Save Vision, Mission & Chairman
        </button>
      </div>
    </div>
  );
}
