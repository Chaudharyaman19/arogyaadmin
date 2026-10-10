"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Facebook,
  FileText,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  Phone,
  Plus,
  Save,
  Trash2,
  Twitter,
  Upload,
  Youtube,
} from "lucide-react";
import { FieldLabel, Textarea, TextInput } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import {
  siteSettingsApi,
  FooterContent,
  FooterExtras,
  FooterHighlight,
  FooterLink,
  FooterSocial,
  FooterStat,
} from "@/lib/siteSettingsApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   FOOTER — the website footer on every page. Loads from and saves
   straight to backend-arogya (Settings + Social Media, the same records
   admin-arogya edits; images go to Cloudinary), so it has its own Save
   button — page sections are only stored locally.
========================================================= */

const upload = siteSettingsApi.uploadFooterImage;
const LINK = /^(\/|https?:\/\/)/;
const PHONE = /^\+?[0-9][0-9\s()-]{6,19}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Panel({ title, note, action, children }: { title: string; note?: string; action?: ReactNode; children: ReactNode }) {
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

function Field({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
    </div>
  );
}

const WEBSITE_URL = (process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Brochure PDF — upload to Cloudinary or type a link; the website always links to /brochure */
function BrochurePdfField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState("");

  const pick = async (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf") return showError("Choose a PDF file.");
    if (file.size > 10 * 1024 * 1024) return showError("PDF must be 10 MB or smaller.");
    setUploading(true);
    try {
      const res = await siteSettingsApi.uploadFooterBrochure(file);
      onChange(res.url);
      setUploaded(`${res.fileName} (${res.fileSize})`);
      showSuccess("PDF uploaded. Click Save Footer to put it on the website.");
    } catch (err) {
      showError(err instanceof ApiRequestError ? err.message : "Could not upload the PDF.");
    } finally {
      setUploading(false);
    }
  };

  const isUpload = /^https:\/\/res\.cloudinary\.com\//.test(value);

  return (
    <div className="flex flex-col gap-[6px] rounded-[6px] border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-[10px]">
      <FieldLabel>Brochure PDF</FieldLabel>
      <div className="flex flex-wrap items-center gap-[8px]">
        <label className={`inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-[4px] bg-[#1b5e20] px-[12px] text-[11px] font-semibold text-white transition hover:opacity-90 ${uploading ? "pointer-events-none opacity-60" : ""}`}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? "Uploading..." : value ? "Replace PDF" : "Upload PDF"}
          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
        <span className="inline-flex items-center gap-1 text-[10px] text-[#475569]">
          <FileText className="h-3.5 w-3.5 text-[#b91c1c]" />
          {uploaded || (isUpload ? "Uploaded PDF" : value || "Built-in /pdf.pdf")}
        </span>
        <a href={`${WEBSITE_URL}/brochure`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1e40af] hover:underline">
          <ExternalLink className="h-3 w-3" /> View on website
        </a>
      </div>
      <div>
        <FieldLabel>Or paste a link</FieldLabel>
        <TextInput value={value} onChange={onChange} placeholder="/pdf.pdf or https://..." maxLength={300} hideLimit />
      </div>
      <p className="text-[10px] text-[#64748b]">PDF only, up to 10 MB. The footer and navbar &quot;Download PDF&quot; buttons open it. &quot;View on website&quot; shows the saved PDF.</p>
    </div>
  );
}

/** Image + its alt text side by side */
function ImageAlt({ label, image, alt, onImage, onAlt, hint, previewClass = "h-[56px] w-[56px]" }: {
  label: string; image: string; alt: string; onImage: (v: string) => void; onAlt: (v: string) => void; hint: string; previewClass?: string;
}) {
  return (
    <div className="grid grid-cols-[1.4fr_1fr] gap-[10px]">
      <CloudImageField upload={upload} label={label} value={image} onChange={onImage} hint={hint} previewClass={previewClass} />
      <Field label={`${label} Alt Text`} required={Boolean(image)}>
        <TextInput value={alt} onChange={onAlt} maxLength={150} placeholder="Describe the image" />
      </Field>
    </div>
  );
}

function AddButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="inline-flex h-[28px] w-fit shrink-0 items-center gap-[5px] border border-dashed border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] hover:bg-[#ccfbf1] disabled:cursor-not-allowed disabled:opacity-40">
      <Plus className="h-3 w-3" /> {label}
    </button>
  );
}

function RowButtons({ onUp, onDown, onRemove }: { onUp?: () => void; onDown?: () => void; onRemove: () => void }) {
  const base = "grid h-[30px] w-[30px] shrink-0 place-items-center border";
  return (
    <>
      <button type="button" title="Move up" disabled={!onUp} onClick={onUp} className={`${base} border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30`}><ArrowUp className="h-3 w-3" /></button>
      <button type="button" title="Move down" disabled={!onDown} onClick={onDown} className={`${base} border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30`}><ArrowDown className="h-3 w-3" /></button>
      <button type="button" title="Remove" onClick={onRemove} className={`${base} border-red-200 bg-red-50 text-red-600 hover:bg-red-100`}><Trash2 className="h-3 w-3" /></button>
    </>
  );
}

const move = <T,>(list: T[], i: number, d: -1 | 1): T[] => {
  const t = i + d;
  if (t < 0 || t >= list.length) return list;
  const next = [...list];
  [next[i], next[t]] = [next[t], next[i]];
  return next;
};
const replaceAt = <T,>(list: T[], i: number, patch: Partial<T>) => list.map((x, idx) => (idx === i ? { ...x, ...patch } : x));

/** List of plain strings (phones / emails) */
function StringList({ label, icon, values, onChange, placeholder, max }: {
  label: string; icon: ReactNode; values: string[]; onChange: (v: string[]) => void; placeholder: string; max: number;
}) {
  return (
    <div className="flex flex-col gap-[6px]">
      <FieldLabel>{label}</FieldLabel>
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-[6px]">
          <span className="text-[#64748b]">{icon}</span>
          <div className="flex-1"><TextInput value={v} onChange={(next) => onChange(values.map((x, idx) => (idx === i ? next : x)))} placeholder={placeholder} hideLimit /></div>
          <button type="button" title="Remove" onClick={() => onChange(values.filter((_, idx) => idx !== i))}
            className="grid h-[30px] w-[30px] place-items-center border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="h-3 w-3" /></button>
        </div>
      ))}
      <AddButton label={`Add ${label.replace(/s$/, "")}`} disabled={values.length >= max} onClick={() => onChange([...values, ""])} />
    </div>
  );
}

const SOCIAL: { key: keyof FooterSocial; label: string; Icon: typeof Facebook }[] = [
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "twitter", label: "Twitter / X", Icon: Twitter },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "youtube", label: "YouTube", Icon: Youtube },
];

export function FooterEditor() {
  const [data, setData] = useState<FooterContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    siteSettingsApi.footer().then(setData).catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load the footer."));
  }, []);

  if (!data) {
    return error ? <p className="text-[11px] font-semibold text-red-500">{error}</p> : (
      <div className="flex items-center gap-2 py-4 text-[11px] text-[#64748b]"><Loader2 className="h-4 w-4 animate-spin text-[#0f766e]" /> Loading the website footer...</div>
    );
  }

  const set = <K extends keyof FooterContent>(key: K, value: FooterContent[K]) => setData({ ...data, [key]: value });
  const setEx = <K extends keyof FooterExtras>(key: K, value: FooterExtras[K]) => setData({ ...data, extras: { ...data.extras, [key]: value } });
  const ex = data.extras;

  const validate = (): string | null => {
    const needAlt: [string, string, string][] = [
      ["Logo", data.logo, data.logoAlt], ["Divider", ex.dividerImage, ex.dividerImageAlt],
      ["Organiser logo", ex.organizedByLogo, ex.organizedByLogoAlt], ["Newsletter icon", ex.newsletterIcon, ex.newsletterIconAlt],
      ["Brochure icon", ex.brochureIcon, ex.brochureIconAlt], ["Building image", ex.buildingImage, ex.buildingImageAlt],
      ["Leaf image", ex.leafImage, ex.leafImageAlt], ["Bottom image", ex.bottomImage, ex.bottomImageAlt],
    ];
    for (const [label, img, alt] of needAlt) if (img && !alt.trim()) return `${label}: enter the alt text.`;
    for (const [i, s] of data.stats.entries()) {
      if (!s.label.trim()) return `Stat ${i + 1}: enter the label.`;
      if (s.image && !s.imageAlt.trim()) return `Stat ${i + 1}: enter the icon alt text.`;
    }
    for (const [i, l] of data.quickLinks.entries()) {
      if (!l.name.trim()) return `Quick link ${i + 1}: enter the label.`;
      if (l.path.trim() !== "#" && !LINK.test(l.path.trim())) return `Quick link "${l.name}": link must be #, start with / or http(s)://`;
    }
    for (const [i, h] of data.highlights.entries()) {
      if (!h.title.trim()) return `Highlight ${i + 1}: enter the title.`;
      if (h.image && !h.imageAlt.trim()) return `Highlight ${i + 1}: enter the icon alt text.`;
    }
    for (const p of data.phones) if (!PHONE.test(p.trim())) return `"${p}" is not a valid phone number.`;
    for (const e of data.emails) if (!EMAIL.test(e.trim())) return `"${e}" is not a valid email address.`;
    for (const s of SOCIAL) {
      const url = data.social[s.key].trim();
      if (url && !url.startsWith("https://")) return `${s.label} link must start with https://`;
    }
    for (const [label, url] of [["Google Play", ex.googlePlayUrl], ["App Store", ex.appStoreUrl], ["Organiser", ex.organizedByLink], ["Brochure", ex.brochureUrl]] as const) {
      if (url.trim() && !LINK.test(url.trim())) return `${label} link must start with / or http(s)://`;
    }
    for (const [i, p] of ex.policyLinks.entries()) {
      if (!p.label.trim() || !LINK.test(p.href.trim())) return `Policy link ${i + 1}: enter a label and a link starting with / or http(s)://`;
    }
    return null;
  };

  const save = async () => {
    const problem = validate();
    if (problem) return setError(problem);
    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await siteSettingsApi.saveFooter({
        ...input,
        phones: input.phones.map((p) => p.trim()).filter(Boolean),
        emails: input.emails.map((e) => e.trim().toLowerCase()).filter(Boolean),
        stats: input.stats.map((s) => ({ ...s, number: Number(s.number) || 0 })),
        social: Object.fromEntries(Object.entries(input.social).map(([k, v]) => [k, v.trim()])) as unknown as FooterSocial,
      });
      setData(saved);
      showSuccess("Footer saved. Refresh the website to see it.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save the footer.";
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* LOGO & ABOUT */}
      <Panel title="Logo & About" note="First column of the footer.">
        <ImageAlt label="Footer Logo" image={data.logo} alt={data.logoAlt} onImage={(v) => set("logo", v)} onAlt={(v) => set("logoAlt", v)} hint="Shown in gold on the dark footer" previewClass="h-[56px] w-[120px]" />
        <div className="grid grid-cols-[1.6fr_1fr] gap-[10px]">
          <Field label="About Text"><Textarea value={data.aboutText} onChange={(v) => set("aboutText", v)} rows={3} maxLength={450} /></Field>
          <Field label="Words shown in gold"><TextInput value={data.aboutHighlighted} onChange={(v) => set("aboutHighlighted", v)} maxLength={80} placeholder="healthier tomorrow." /></Field>
        </div>
        <ImageAlt label="Lotus Divider" image={ex.dividerImage} alt={ex.dividerImageAlt} onImage={(v) => setEx("dividerImage", v)} onAlt={(v) => setEx("dividerImageAlt", v)} hint="Under the about text and in the bottom bar" />
      </Panel>

      {/* STATS */}
      <Panel title="Stats (4)" note="The number counts up on the website and gets a +.">
        <div className="grid grid-cols-1 gap-[10px] xl:grid-cols-2">
          {data.stats.map((s: FooterStat, i) => (
            <div key={i} className="flex flex-col gap-[8px] rounded-[6px] border border-[#e2e8f0] bg-[#fbfbfa] p-[10px]">
              <div className="grid grid-cols-[100px_1fr] gap-[8px]">
                <Field label="Number"><TextInput value={String(s.number)} onChange={(v) => set("stats", replaceAt(data.stats, i, { number: Number(v.replace(/\D/g, "")) || 0 }))} maxLength={8} hideLimit /></Field>
                <Field label="Label" required><TextInput value={s.label} onChange={(v) => set("stats", replaceAt(data.stats, i, { label: v }))} maxLength={30} /></Field>
              </div>
              <ImageAlt label="Icon" image={s.image} alt={s.imageAlt} onImage={(v) => set("stats", replaceAt(data.stats, i, { image: v }))} onAlt={(v) => set("stats", replaceAt(data.stats, i, { imageAlt: v }))} hint="Gold icon" previewClass="h-[44px] w-[44px]" />
            </div>
          ))}
        </div>
      </Panel>

      {/* QUICK LINKS */}
      <Panel title="Quick Links" note='Use "#" for a page that does not exist yet — the link then does nothing.'
        action={<AddButton label="Add Link" disabled={data.quickLinks.length >= 20} onClick={() => set("quickLinks", [...data.quickLinks, { name: "", path: "/" }])} />}>
        <Field label="Column Title"><TextInput value={data.quickLinksTitle} onChange={(v) => set("quickLinksTitle", v)} maxLength={40} /></Field>
        {data.quickLinks.map((l: FooterLink, i) => (
          <div key={i} className="flex items-center gap-[6px]">
            <div className="grid flex-1 grid-cols-2 gap-[6px]">
              <TextInput value={l.name} onChange={(v) => set("quickLinks", replaceAt(data.quickLinks, i, { name: v }))} placeholder="Label" maxLength={60} />
              <TextInput value={l.path} onChange={(v) => set("quickLinks", replaceAt(data.quickLinks, i, { path: v }))} placeholder="/about" maxLength={300} hideLimit />
            </div>
            <RowButtons onUp={i > 0 ? () => set("quickLinks", move(data.quickLinks, i, -1)) : undefined}
              onDown={i < data.quickLinks.length - 1 ? () => set("quickLinks", move(data.quickLinks, i, 1)) : undefined}
              onRemove={() => set("quickLinks", data.quickLinks.filter((_, idx) => idx !== i))} />
          </div>
        ))}
      </Panel>

      {/* HIGHLIGHTS */}
      <Panel title="Conference Highlights"
        action={<AddButton label="Add Highlight" disabled={data.highlights.length >= 10} onClick={() => set("highlights", [...data.highlights, { iconType: "", title: "", desc: "", image: "", imageAlt: "" }])} />}>
        <Field label="Column Title"><TextInput value={data.highlightsTitle} onChange={(v) => set("highlightsTitle", v)} maxLength={40} /></Field>
        {data.highlights.map((h: FooterHighlight, i) => (
          <div key={i} className="flex flex-col gap-[8px] rounded-[6px] border border-[#e2e8f0] bg-[#fbfbfa] p-[10px]">
            <div className="flex items-center gap-[6px]">
              <div className="grid flex-1 grid-cols-[1fr_1.4fr] gap-[6px]">
                <TextInput value={h.title} onChange={(v) => set("highlights", replaceAt(data.highlights, i, { title: v }))} placeholder="Keynote Sessions" maxLength={60} />
                <TextInput value={h.desc} onChange={(v) => set("highlights", replaceAt(data.highlights, i, { desc: v }))} placeholder="Short line under the title" maxLength={140} />
              </div>
              <RowButtons onUp={i > 0 ? () => set("highlights", move(data.highlights, i, -1)) : undefined}
                onDown={i < data.highlights.length - 1 ? () => set("highlights", move(data.highlights, i, 1)) : undefined}
                onRemove={() => set("highlights", data.highlights.filter((_, idx) => idx !== i))} />
            </div>
            <ImageAlt label="Icon" image={h.image} alt={h.imageAlt} onImage={(v) => set("highlights", replaceAt(data.highlights, i, { image: v }))} onAlt={(v) => set("highlights", replaceAt(data.highlights, i, { imageAlt: v }))} hint="Gold round icon" previewClass="h-[44px] w-[44px]" />
          </div>
        ))}
      </Panel>

      {/* GET IN TOUCH */}
      <Panel title="Get In Touch">
        <Field label="Column Title"><TextInput value={data.getInTouchTitle} onChange={(v) => set("getInTouchTitle", v)} maxLength={40} /></Field>
        <div className="grid grid-cols-1 gap-[12px] lg:grid-cols-2">
          <StringList label="Phone Numbers" icon={<Phone className="h-3.5 w-3.5" />} values={data.phones} onChange={(v) => set("phones", v)} placeholder="+91 96549 00525" max={5} />
          <StringList label="Emails" icon={<Mail className="h-3.5 w-3.5" />} values={data.emails} onChange={(v) => set("emails", v)} placeholder="info@arogyasangoshthi.com" max={5} />
        </div>
        <p className="-mt-[4px] text-[10px] text-[#64748b]">Leave both lists empty to show the website&apos;s built-in phone and email.</p>
        <div className="grid grid-cols-[1fr_1.6fr] gap-[10px]">
          <Field label="Website"><TextInput value={data.website} onChange={(v) => set("website", v)} maxLength={120} placeholder="www.arogyasangoshthi.com" /></Field>
          <Field label="Address"><Textarea value={data.address} onChange={(v) => set("address", v)} rows={3} maxLength={300} /></Field>
        </div>
        <div className="grid grid-cols-3 gap-[10px]">
          <Field label="Helpline Title"><TextInput value={data.helplineTitle} onChange={(v) => set("helplineTitle", v)} maxLength={40} /></Field>
          <Field label="Helpline Phone"><TextInput value={data.helplinePhone} onChange={(v) => set("helplinePhone", v)} maxLength={24} /></Field>
          <Field label="Helpline Timing"><TextInput value={data.helplineTiming} onChange={(v) => set("helplineTiming", v)} maxLength={80} /></Field>
        </div>
      </Panel>

      {/* CONNECT + APP + ORGANISER */}
      <Panel title="Connect With Us, App & Organiser">
        <Field label="Social Title"><TextInput value={ex.connectTitle} onChange={(v) => setEx("connectTitle", v)} maxLength={40} /></Field>
        <div className="grid grid-cols-1 gap-[8px] lg:grid-cols-2">
          {SOCIAL.map(({ key, label, Icon }) => (
            <div key={key} className="flex items-center gap-[8px]">
              <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full border border-[#F3B71B] text-[#b78103]"><Icon className="h-3.5 w-3.5" /></span>
              <div className="flex-1"><TextInput value={data.social[key]} onChange={(v) => set("social", { ...data.social, [key]: v })} placeholder={`https://... (${label})`} maxLength={300} hideLimit /></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-[10px]">
          <Field label="App Title"><TextInput value={ex.appTitle} onChange={(v) => setEx("appTitle", v)} maxLength={40} /></Field>
          <Field label="App Text"><Textarea value={ex.appText} onChange={(v) => setEx("appText", v)} rows={2} maxLength={160} /></Field>
          <Field label="Google Play Link"><TextInput value={ex.googlePlayUrl} onChange={(v) => setEx("googlePlayUrl", v)} placeholder="https://play.google.com/..." maxLength={300} hideLimit /></Field>
          <Field label="App Store Link"><TextInput value={ex.appStoreUrl} onChange={(v) => setEx("appStoreUrl", v)} placeholder="https://apps.apple.com/..." maxLength={300} hideLimit /></Field>
        </div>
        <div className="grid grid-cols-2 gap-[10px]">
          <Field label="Organiser Title"><TextInput value={ex.organizedByTitle} onChange={(v) => setEx("organizedByTitle", v)} maxLength={40} /></Field>
          <Field label="Organiser Website"><TextInput value={ex.organizedByLink} onChange={(v) => setEx("organizedByLink", v)} placeholder="https://..." maxLength={300} hideLimit /></Field>
        </div>
        <ImageAlt label="Organiser Logo" image={ex.organizedByLogo} alt={ex.organizedByLogoAlt} onImage={(v) => setEx("organizedByLogo", v)} onAlt={(v) => setEx("organizedByLogoAlt", v)} hint="Namo Gange logo" previewClass="h-[56px] w-[120px]" />
      </Panel>

      {/* NEWSLETTER & BROCHURE */}
      <Panel title="Newsletter & Brochure Band">
        <div className="grid grid-cols-2 gap-[10px]">
          <Field label="Newsletter Title"><TextInput value={ex.newsletterTitle} onChange={(v) => setEx("newsletterTitle", v)} maxLength={60} /></Field>
          <Field label="Newsletter Text"><Textarea value={ex.newsletterText} onChange={(v) => setEx("newsletterText", v)} rows={2} maxLength={200} /></Field>
        </div>
        <ImageAlt label="Newsletter Icon" image={ex.newsletterIcon} alt={ex.newsletterIconAlt} onImage={(v) => setEx("newsletterIcon", v)} onAlt={(v) => setEx("newsletterIconAlt", v)} hint="Small icon" />
        <div className="grid grid-cols-2 gap-[10px]">
          <Field label="Brochure Title"><TextInput value={ex.brochureTitle} onChange={(v) => setEx("brochureTitle", v)} maxLength={40} /></Field>
          <Field label="Button Label"><TextInput value={ex.brochureButtonLabel} onChange={(v) => setEx("brochureButtonLabel", v)} maxLength={30} /></Field>
        </div>
        <BrochurePdfField value={ex.brochureUrl} onChange={(v) => setEx("brochureUrl", v)} />
        <ImageAlt label="Brochure Icon" image={ex.brochureIcon} alt={ex.brochureIconAlt} onImage={(v) => setEx("brochureIcon", v)} onAlt={(v) => setEx("brochureIconAlt", v)} hint="Small PDF icon" />
      </Panel>

      {/* DECORATIONS */}
      <Panel title="Decorations">
        <ImageAlt label="Building (right of the band)" image={ex.buildingImage} alt={ex.buildingImageAlt} onImage={(v) => setEx("buildingImage", v)} onAlt={(v) => setEx("buildingImageAlt", v)} hint="Parliament illustration" previewClass="h-[56px] w-[90px]" />
        <ImageAlt label="Top Right Leaf" image={ex.leafImage} alt={ex.leafImageAlt} onImage={(v) => setEx("leafImage", v)} onAlt={(v) => setEx("leafImageAlt", v)} hint="Gold leaf corner" />
        <ImageAlt label="Bottom Left Pattern" image={ex.bottomImage} alt={ex.bottomImageAlt} onImage={(v) => setEx("bottomImage", v)} onAlt={(v) => setEx("bottomImageAlt", v)} hint="Faint corner pattern" previewClass="h-[56px] w-[90px]" />
      </Panel>

      {/* BOTTOM BAR */}
      <Panel title="Bottom Bar"
        action={<AddButton label="Add Policy Link" disabled={ex.policyLinks.length >= 6} onClick={() => setEx("policyLinks", [...ex.policyLinks, { label: "", href: "/" }])} />}>
        <div className="grid grid-cols-2 gap-[10px]">
          <Field label="Brand Name"><TextInput value={ex.brandName} onChange={(v) => setEx("brandName", v)} maxLength={40} /></Field>
          <Field label="Edition"><TextInput value={ex.editionText} onChange={(v) => setEx("editionText", v)} maxLength={40} /></Field>
          <Field label="Copyright"><TextInput value={ex.copyrightText} onChange={(v) => setEx("copyrightText", v)} maxLength={120} /></Field>
          <Field label='After "Designed with ♥"'><TextInput value={ex.designedByText} onChange={(v) => setEx("designedByText", v)} maxLength={80} /></Field>
        </div>
        {ex.policyLinks.map((p, i) => (
          <div key={i} className="flex items-center gap-[6px]">
            <div className="grid flex-1 grid-cols-2 gap-[6px]">
              <TextInput value={p.label} onChange={(v) => setEx("policyLinks", replaceAt(ex.policyLinks, i, { label: v }))} placeholder="Privacy Policy" maxLength={40} />
              <TextInput value={p.href} onChange={(v) => setEx("policyLinks", replaceAt(ex.policyLinks, i, { href: v }))} placeholder="/privacy" maxLength={300} hideLimit />
            </div>
            <RowButtons onUp={i > 0 ? () => setEx("policyLinks", move(ex.policyLinks, i, -1)) : undefined}
              onDown={i < ex.policyLinks.length - 1 ? () => setEx("policyLinks", move(ex.policyLinks, i, 1)) : undefined}
              onRemove={() => setEx("policyLinks", ex.policyLinks.filter((_, idx) => idx !== i))} />
          </div>
        ))}
      </Panel>

      {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}

      <div className="flex items-center justify-end gap-[10px]">
        {data.updatedBy && data.updatedBy !== "seed" && data.updatedAt && (
          <span className="text-[10px] text-[#64748b]">Last saved {new Date(data.updatedAt).toLocaleString("en-IN")} by {data.updatedBy}</span>
        )}
        <button type="button" onClick={save} disabled={saving}
          className="inline-flex h-[32px] items-center gap-1.5 rounded-[4px] bg-[#16a34a] px-[14px] text-[12px] font-semibold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save Footer
        </button>
      </div>
    </div>
  );
}
