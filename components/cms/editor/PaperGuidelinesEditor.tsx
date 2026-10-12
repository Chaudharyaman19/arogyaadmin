"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, FileText, Loader2, Plus, Save, Trash2, Upload } from "lucide-react";
import { FieldLabel, TextInput, Toggle } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { paperGuidelinesApi, PaperGuidelines } from "@/lib/paperPresentationApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   GUIDELINES & SUBMISSION — the "Guidelines for Authors" and
   "Submission Process" cards on the website Paper Presentation
   page. Loads from and saves straight to backend-arogya (images
   and the guidelines PDF go to Cloudinary), so it has its own
   Save button — page sections are only stored locally.
========================================================= */

const MAX_GUIDELINES = 12;
const MAX_STEPS = 8;
const LINK = /^(\/|https?:\/\/)/;
const WEBSITE_URL = (process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const EMPTY: PaperGuidelines = {
  guidelinesHeading: "GUIDELINES FOR AUTHORS",
  guidelinesIcon: "",
  guidelinesIconAlt: "Guidelines document icon",
  guidelines: [],
  guidelinesImage: "",
  guidelinesImageAlt: "",
  downloadLabel: "DOWNLOAD GUIDELINES",
  downloadHref: "",
  submissionHeading: "SUBMISSION PROCESS",
  submissionIcon: "",
  submissionIconAlt: "Submission process clipboard icon",
  steps: [],
  submissionImage: "",
  submissionImageAlt: "",
  submitLabel: "SUBMIT ABSTRACT NOW",
  submitHref: "",
  leafImage: "",
  leafImageAlt: "Green leaf vine decoration",
};

const swap = <T,>(list: T[], index: number, direction: -1 | 1): T[] => {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

function Panel({ title, note, action, children }: { title: string; note?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-white p-[12px]">
      <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-1.5">
        <div>
          <div className="text-[11px] font-bold text-[#1e40af]">{title}</div>
          {note && <p className="mt-[2px] text-[10px] text-[#64748b]">{note}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function AddButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-[28px] shrink-0 items-center gap-[5px] border border-dashed border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] transition hover:bg-[#ccfbf1] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Plus className="h-3 w-3" /> {label}
    </button>
  );
}

function RowButtons({ index, total, active, onActive, onMove, onRemove, title }: {
  index: number; total: number; active: boolean; onActive: (v: boolean) => void; onMove: (d: -1 | 1) => void; onRemove: () => void; title: string;
}) {
  return (
    <div className="ml-auto flex shrink-0 items-center gap-[6px]">
      <span className={`text-[10px] font-bold ${active ? "text-[#16a34a]" : "text-[#dc2626]"}`}>{active ? "Shown" : "Hidden"}</span>
      <Toggle checked={active} onChange={onActive} />
      <button type="button" title="Move up" disabled={index === 0} onClick={() => onMove(-1)}
        className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
        <ArrowUp className="h-3 w-3" />
      </button>
      <button type="button" title="Move down" disabled={index === total - 1} onClick={() => onMove(1)}
        className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
        <ArrowDown className="h-3 w-3" />
      </button>
      <button type="button" title={title} onClick={onRemove}
        className="grid h-[26px] w-[26px] place-items-center border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

function ImageWithAlt({ label, image, alt, onImage, onAlt, hint, previewClass = "h-[48px] w-[48px]" }: {
  label: string; image: string; alt: string; onImage: (v: string) => void; onAlt: (v: string) => void; hint: string; previewClass?: string;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
      <CloudImageField upload={paperGuidelinesApi.upload} label={label} value={image} onChange={onImage} hint={hint} previewClass={previewClass} />
      <div>
        <FieldLabel required={Boolean(image)}>{label} Alt Text</FieldLabel>
        <TextInput value={alt} onChange={onAlt} placeholder="Describe the image (for SEO & screen readers)" maxLength={150} />
      </div>
    </div>
  );
}

/** Guidelines PDF — upload to Cloudinary or paste a link */
function GuidelinesPdfField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState("");

  const pick = async (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf") return showError("Choose a PDF file.");
    if (file.size > 10 * 1024 * 1024) return showError("PDF must be 10 MB or smaller.");
    setUploading(true);
    try {
      const res = await paperGuidelinesApi.uploadPdf(file);
      onChange(res.url);
      setUploaded(`${res.fileName} (${res.fileSize})`);
      showSuccess("PDF uploaded. Click Save to put it on the website.");
    } catch (err) {
      showError(err instanceof ApiRequestError ? err.message : "Could not upload the PDF.");
    } finally {
      setUploading(false);
    }
  };

  const isUpload = /^https:\/\/res\.cloudinary\.com\//.test(value);

  return (
    <div className="flex flex-col gap-[6px] rounded-[6px] border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-[10px]">
      <FieldLabel>Guidelines PDF (Download button)</FieldLabel>
      <div className="flex flex-wrap items-center gap-[8px]">
        <label className={`inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-[4px] bg-[#1b5e20] px-[12px] text-[11px] font-semibold text-white transition hover:opacity-90 ${uploading ? "pointer-events-none opacity-60" : ""}`}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? "Uploading..." : value ? "Replace PDF" : "Upload PDF"}
          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
        <span className="inline-flex items-center gap-1 text-[10px] text-[#475569]">
          <FileText className="h-3.5 w-3.5 text-[#b91c1c]" />
          {uploaded || (isUpload ? "Uploaded PDF" : value || "No PDF yet — the button has no link")}
        </span>
        {value && (
          <a href={`${WEBSITE_URL}/paper-guidelines`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1e40af] hover:underline">
            <ExternalLink className="h-3 w-3" /> View on website
          </a>
        )}
      </div>
      <div>
        <FieldLabel>Or paste a link</FieldLabel>
        <TextInput value={value} onChange={onChange} placeholder="/file.pdf or https://..." maxLength={300} hideLimit />
      </div>
      <p className="text-[10px] text-[#64748b]">PDF only, up to 10 MB. &quot;View on website&quot; shows the saved PDF.</p>
    </div>
  );
}

export function PaperGuidelinesEditor() {
  const [data, setData] = useState<PaperGuidelines>(EMPTY);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    paperGuidelinesApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
        else setIsSaved(false);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load Guidelines & Submission."))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof PaperGuidelines>(key: K, value: PaperGuidelines[K]) => setData((prev) => ({ ...prev, [key]: value }));
  const setGuideline = (index: number, patch: Partial<PaperGuidelines["guidelines"][number]>) =>
    set("guidelines", data.guidelines.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  const setStep = (index: number, patch: Partial<PaperGuidelines["steps"][number]>) =>
    set("steps", data.steps.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const save = async () => {
    if (!data.guidelinesHeading.trim()) return setError("Enter the guidelines heading.");
    if (!data.submissionHeading.trim()) return setError("Enter the submission heading.");
    for (const [label, image, alt] of [
      ["guidelines icon", data.guidelinesIcon, data.guidelinesIconAlt],
      ["guidelines illustration", data.guidelinesImage, data.guidelinesImageAlt],
      ["submission icon", data.submissionIcon, data.submissionIconAlt],
      ["submission illustration", data.submissionImage, data.submissionImageAlt],
      ["leaf decoration", data.leafImage, data.leafImageAlt],
    ] as const) {
      if (image && !alt.trim()) return setError(`Enter the alt text of the ${label}.`);
    }
    if (data.downloadHref.trim() && !LINK.test(data.downloadHref.trim())) return setError("The guidelines link must start with / or http(s)://");
    if (data.submitHref.trim() && !LINK.test(data.submitHref.trim())) return setError("The submit link must start with / or http(s)://");
    for (const [i, g] of data.guidelines.entries()) if (!g.text.trim()) return setError(`Guideline ${i + 1}: enter the text.`);
    for (const [i, s] of data.steps.entries()) {
      if (!s.num.trim() || !s.title.trim() || !s.description.trim()) return setError(`Step ${i + 1}: fill in the number, title and description.`);
    }

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await paperGuidelinesApi.save(input);
      setData({ ...EMPTY, ...saved });
      setIsSaved(true);
      showSuccess("Guidelines & Submission saved. The website updates within 30 seconds.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save Guidelines & Submission.";
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
        Loading Guidelines & Submission...
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

      {/* GUIDELINES CARD */}
      <Panel
        title={`Guidelines for Authors (${data.guidelines.length} total, ${data.guidelines.filter((g) => g.isActive).length} shown)`}
        note="Left card."
        action={<AddButton label="Add Guideline" onClick={() => set("guidelines", [...data.guidelines, { text: "", isActive: true }])} disabled={data.guidelines.length >= MAX_GUIDELINES} />}
      >
        <div>
          <FieldLabel required>Guidelines Heading</FieldLabel>
          <TextInput value={data.guidelinesHeading} onChange={(v) => set("guidelinesHeading", v.toUpperCase())} maxLength={35} />
        </div>
        {data.guidelines.map((g, index) => (
          <div key={index} className="flex items-center gap-[8px]">
            <div className="flex-1">
              <TextInput value={g.text} onChange={(v) => setGuideline(index, { text: v })} placeholder="Original, unpublished work is invited." maxLength={95} />
            </div>
            <RowButtons
              index={index}
              total={data.guidelines.length}
              active={g.isActive}
              onActive={(v) => setGuideline(index, { isActive: v })}
              onMove={(d) => set("guidelines", swap(data.guidelines, index, d))}
              onRemove={() => set("guidelines", data.guidelines.filter((_, i) => i !== index))}
              title="Remove guideline"
            />
          </div>
        ))}
        <div>
          <FieldLabel>Download Button Label</FieldLabel>
          <TextInput value={data.downloadLabel} onChange={(v) => set("downloadLabel", v.toUpperCase())} maxLength={30} />
        </div>
        <GuidelinesPdfField value={data.downloadHref} onChange={(v) => set("downloadHref", v)} />
        <ImageWithAlt label="Heading Icon" image={data.guidelinesIcon} alt={data.guidelinesIconAlt}
          onImage={(v) => set("guidelinesIcon", v)} onAlt={(v) => set("guidelinesIconAlt", v)} hint="Round icon" />
        <ImageWithAlt label="Illustration" image={data.guidelinesImage} alt={data.guidelinesImageAlt}
          onImage={(v) => set("guidelinesImage", v)} onAlt={(v) => set("guidelinesImageAlt", v)} hint="Transparent PNG, bottom right" previewClass="h-[56px] w-[56px]" />
      </Panel>

      {/* SUBMISSION CARD */}
      <Panel
        title={`Submission Process (${data.steps.length} total, ${data.steps.filter((s) => s.isActive).length} shown)`}
        note="Right card."
        action={<AddButton label="Add Step" onClick={() => set("steps", [...data.steps, { num: String(data.steps.length + 1), title: `STEP ${data.steps.length + 1}`, description: "", isActive: true }])} disabled={data.steps.length >= MAX_STEPS} />}
      >
        <div>
          <FieldLabel required>Submission Heading</FieldLabel>
          <TextInput value={data.submissionHeading} onChange={(v) => set("submissionHeading", v.toUpperCase())} maxLength={30} />
        </div>
        {data.steps.map((step, index) => (
          <div key={index} className="flex flex-col gap-[8px] rounded-[6px] border border-[#e2e8f0] bg-[#fbfbfa] p-[10px]">
            <div className="flex items-center gap-[8px]">
              <span className="text-[11px] font-bold text-[#4B1426]">{step.title || `Step ${index + 1}`}</span>
              <RowButtons
                index={index}
                total={data.steps.length}
                active={step.isActive}
                onActive={(v) => setStep(index, { isActive: v })}
                onMove={(d) => set("steps", swap(data.steps, index, d))}
                onRemove={() => set("steps", data.steps.filter((_, i) => i !== index))}
                title="Remove step"
              />
            </div>
            <div className="grid grid-cols-[60px_110px_1fr] gap-[10px]">
              <div>
                <FieldLabel required>Num</FieldLabel>
                <TextInput value={step.num} onChange={(v) => setStep(index, { num: v })} maxLength={3} hideLimit />
              </div>
              <div>
                <FieldLabel required>Title</FieldLabel>
                <TextInput value={step.title} onChange={(v) => setStep(index, { title: v.toUpperCase() })} maxLength={12} hideLimit />
              </div>
              <div>
                <FieldLabel required>Description</FieldLabel>
                <TextInput value={step.description} onChange={(v) => setStep(index, { description: v })} maxLength={95} />
              </div>
            </div>
          </div>
        ))}
        <div className="grid grid-cols-2 gap-[10px]">
          <div>
            <FieldLabel>Submit Button Label</FieldLabel>
            <TextInput value={data.submitLabel} onChange={(v) => set("submitLabel", v.toUpperCase())} maxLength={30} />
          </div>
          <div>
            <FieldLabel>Submit Button Link</FieldLabel>
            <TextInput value={data.submitHref} onChange={(v) => set("submitHref", v)} placeholder="/... or https://... (empty = no link)" maxLength={300} hideLimit />
          </div>
        </div>
        <ImageWithAlt label="Heading Icon" image={data.submissionIcon} alt={data.submissionIconAlt}
          onImage={(v) => set("submissionIcon", v)} onAlt={(v) => set("submissionIconAlt", v)} hint="Round icon" />
        <ImageWithAlt label="Illustration" image={data.submissionImage} alt={data.submissionImageAlt}
          onImage={(v) => set("submissionImage", v)} onAlt={(v) => set("submissionImageAlt", v)} hint="Transparent PNG, bottom right" previewClass="h-[56px] w-[56px]" />
      </Panel>

      <Panel title="Decoration" note="Leaves on the left edge of the section. Leave empty to hide them.">
        <ImageWithAlt label="Leaves" image={data.leafImage} alt={data.leafImageAlt}
          onImage={(v) => set("leafImage", v)} onAlt={(v) => set("leafImageAlt", v)} hint="Transparent PNG" />
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
          Save Guidelines & Submission
        </button>
      </div>
    </div>
  );
}
