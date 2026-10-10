"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ExternalLink,
  Hash,
  Image as ImageIcon,
  Instagram,
  LayoutGrid,
  Loader2,
  Mic,
  Pencil,
  PlayCircle,
  Plus,
  Save,
  Settings,
  Tag,
  Trash2,
  UploadCloud,
  Users,
  Youtube,
} from "lucide-react";
import typography from "../pages/PagesTypography.module.css";
import Modal from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { CloudImageField } from "@/components/cms/editor/CloudImageField";
import { showError, showSuccess, lazySwal } from "@/lib/toast";
import { ApiRequestError } from "@/lib/api";
import { videoThumbnail, type VideoSource } from "@/lib/videoTestimonialsApi";
import {
  globalVoicesApi,
  GvCategory,
  GvCarouselSpeaker,
  GvCarouselSpeakerInput,
  GvCounter,
  GvCounterInput,
  GvSettings,
  GvSpeaker,
  GvSpeakerInput,
} from "@/lib/globalVoicesApi";

/* =========================================================
   GLOBAL VOICES — "Global Voices of Healthcare Innovation" on the
   website home page: headings, speaker categories, video speakers,
   the round-photo carousel and counters. Saved to backend-arogya
   (the same records admin-arogya edits). Colours follow Roles & Permissions.
========================================================= */

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3000";
const errorText = (err: unknown, fallback: string) => (err instanceof ApiRequestError ? err.message : fallback);

type TabId = "settings" | "categories" | "speakers" | "carousel" | "counters";
const TABS: { id: TabId; label: string; Icon: typeof Settings }[] = [
  { id: "settings", label: "Settings", Icon: Settings },
  { id: "categories", label: "Speaker Category", Icon: Tag },
  { id: "speakers", label: "Speakers", Icon: Mic },
  { id: "carousel", label: "Carousel Speakers", Icon: Users },
  { id: "counters", label: "Counters", Icon: Hash },
];

const SOURCES: { value: VideoSource; label: string; Icon: typeof Youtube; idle: string; active: string }[] = [
  { value: "YOUTUBE", label: "YouTube", Icon: Youtube, idle: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100", active: "border-red-600 bg-red-600 text-white" },
  { value: "UPLOAD", label: "Upload", Icon: UploadCloud, idle: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100", active: "border-sky-600 bg-sky-600 text-white" },
  { value: "INSTAGRAM", label: "Instagram", Icon: Instagram, idle: "border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100", active: "border-pink-600 bg-gradient-to-r from-[#833ab4] via-[#e1306c] to-[#f77737] text-white" },
];
const LINK_RULES: Record<VideoSource, { test: RegExp; message: string }> = {
  YOUTUBE: { test: /^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//, message: "Paste a YouTube link (https://youtube.com/... or https://youtu.be/...)." },
  INSTAGRAM: { test: /^https:\/\/(www\.)?instagram\.com\//, message: "Paste an Instagram link (https://www.instagram.com/...)." },
  UPLOAD: { test: /^https:\/\//, message: "Upload the video file first." },
};

/* ---------- shared building blocks ---------- */
function PanelHeader({ title, count, onAdd, addLabel }: { title: string; count?: number; onAdd?: () => void; addLabel?: string }) {
  return (
    <div className="mb-[10px] flex items-center justify-between">
      <h2 className="text-[13px] font-bold uppercase tracking-wide text-[#4B1426]">
        {title} {typeof count === "number" && <span className="ml-1 rounded-full bg-[#f0f4f8] px-2 py-0.5 text-[9px] font-bold text-[#233D4D]">{count} Items</span>}
      </h2>
      {onAdd && (
        <button type="button" onClick={onAdd}
          className="flex h-[30px] items-center gap-[5px] rounded-[6px] bg-[#1b5e20] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(27,94,32,0.25)] transition hover:bg-[#14491a]">
          <Plus className="h-[12px] w-[12px]" strokeWidth={1.7} /> {addLabel}
        </button>
      )}
    </div>
  );
}

function DataTable({ headers, loading, empty, children }: { headers: string[]; loading: boolean; empty: boolean; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[7px] border border-[#e8e5df] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="h-[32px] border-b border-[#e8e5df] bg-[#111844]">
              {headers.map((h, i) => (
                <th key={h} className={`px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white ${i === 0 ? "w-[54px] rounded-tl-[6px]" : ""} ${i === headers.length - 1 ? "rounded-tr-[6px] text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0ec]">
            {loading ? (
              <tr><td colSpan={headers.length} className="py-10 text-center">
                <span className="inline-flex items-center gap-2 text-[11px] text-[#6c7587]"><Loader2 className="h-4 w-4 animate-spin text-[#293681]" /> Loading...</span>
              </td></tr>
            ) : empty ? (
              <tr><td colSpan={headers.length} className="py-10 text-center text-[10px] text-[#6c7587]">Nothing added yet.</td></tr>
            ) : children}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RowActions({ onEdit, onDelete, deleteTitle = "Delete" }: { onEdit: () => void; onDelete: () => void; deleteTitle?: string }) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <button type="button" title="Edit" onClick={onEdit}
        className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-blue-400/30 bg-blue-500/10 text-blue-600 transition hover:scale-105 hover:bg-blue-500/20">
        <Pencil className="h-[12px] w-[12px]" />
      </button>
      <button type="button" title={deleteTitle} onClick={onDelete}
        className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-red-400/30 bg-red-500/10 text-red-600 transition hover:scale-105 hover:bg-red-500/20">
        <Trash2 className="h-[12px] w-[12px]" />
      </button>
    </div>
  );
}

function ModalFooter({ onCancel, onSave, saving, label }: { onCancel: () => void; onSave: () => void; saving: boolean; label: string }) {
  return (
    <>
      <button type="button" onClick={onCancel}
        className="inline-flex h-[32px] items-center px-[14px] text-[12px] font-semibold text-red-600 hover:bg-red-100"
        style={{ background: "#fff1f2", borderRadius: "4px", boxShadow: "rgba(220,38,38,0.15) 0px 0px 0px 1px" }}>
        Cancel
      </button>
      <button type="button" onClick={onSave} disabled={saving}
        className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
        style={{ background: "#1b5e20", borderRadius: "4px" }}>
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} {label}
      </button>
    </>
  );
}

const confirmDelete = (title: string, text: string) =>
  lazySwal.fire({
    title, text, icon: "warning", showCancelButton: true,
    confirmButtonColor: "#dc2626", cancelButtonColor: "#64748b",
    confirmButtonText: "Yes, Delete", cancelButtonText: "Cancel",
    background: "#1e2433", color: "#e2e8f0",
  });

const Cell = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <td className={`px-[12px] py-[8px] text-[9px] text-[#334155] ${className}`}>{children}</td>
);

/* =========================================================
   SETTINGS
========================================================= */
function SettingsTab() {
  const [data, setData] = useState<GvSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    globalVoicesApi.getSettings().then(setData).catch((err) => setError(errorText(err, "Could not load the settings.")));
  }, []);

  if (!data) {
    return error ? <p className="text-[11px] font-semibold text-red-500">{error}</p> : (
      <span className="inline-flex items-center gap-2 text-[11px] text-[#6c7587]"><Loader2 className="h-4 w-4 animate-spin" /> Loading settings...</span>
    );
  }
  const set = (key: keyof GvSettings, value: string) => setData({ ...data, [key]: value });

  const save = async () => {
    if (!data.heading.trim() || !data.subheading.trim()) return setError("Heading and sub heading are required.");
    if (data.leftImage && !data.leftImageAlt.trim()) return setError("Enter the left image alt text.");
    if (data.rightImage && !data.rightImageAlt.trim()) return setError("Enter the right image alt text.");
    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      setData(await globalVoicesApi.saveSettings(input));
      showSuccess("Global Voices settings saved. Refresh the website to see them.");
    } catch (err) {
      const msg = errorText(err, "Could not save the settings.");
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[900px] space-y-3">
      <PanelHeader title="Section Settings" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Heading" required maxLength={40} value={data.heading} onChange={(e) => set("heading", e.target.value.toUpperCase())} hint="Small gold label, e.g. GLOBAL VOICES OF" />
        <Input label="Sub Heading" required maxLength={60} value={data.subheading} onChange={(e) => set("subheading", e.target.value)} hint="Big title, e.g. Healthcare Innovation" />
      </div>
      <Textarea label="Description" rows={2} maxLength={200} value={data.description} onChange={(e) => set("description", e.target.value)} />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {(["left", "right"] as const).map((side) => (
          <div key={side} className="space-y-2 rounded-[6px] border border-[#e2e8f0] bg-slate-50/50 p-3">
            <CloudImageField upload={globalVoicesApi.uploadImage} label={side === "left" ? "Top Left Decoration" : "Top Right Decoration"}
              value={data[`${side}Image`]} onChange={(v) => set(`${side}Image`, v)} hint="Transparent PNG / WEBP" previewClass="h-[64px] w-[90px]" />
            <Input label="Alt Text" required={Boolean(data[`${side}Image`])} maxLength={150}
              value={data[`${side}ImageAlt`]} onChange={(e) => set(`${side}ImageAlt`, e.target.value)} />
          </div>
        ))}
      </div>
      {error && <p className="text-[11px] font-semibold text-red-500">{error}</p>}
      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={saving}
          className="inline-flex h-[32px] items-center gap-1.5 rounded-[4px] bg-[#1b5e20] px-[14px] text-[12px] font-semibold text-white hover:opacity-90 disabled:opacity-60">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save Settings
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   CATEGORIES
========================================================= */
function CategoriesTab({ categories, loading, reload }: { categories: GvCategory[]; loading: boolean; reload: () => void }) {
  const [modal, setModal] = useState<{ id: string | null; name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!modal) return;
    const name = modal.name.trim().toUpperCase();
    if (!name) return setError("Category name is required.");
    setSaving(true);
    setError("");
    try {
      if (modal.id) await globalVoicesApi.categories.update(modal.id, { category: name });
      else await globalVoicesApi.categories.create({ category: name });
      showSuccess(modal.id ? "Category renamed." : "Category added.");
      setModal(null);
      reload();
    } catch (err) {
      setError(errorText(err, "Could not save the category."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: GvCategory) => {
    if (c.speakerCount) return showError(`"${c.category}" is used by ${c.speakerCount} speaker(s). Move them to another category first.`);
    if (!(await confirmDelete(`Delete "${c.category}"?`, "The filter tab disappears from the website.")).isConfirmed) return;
    try {
      await globalVoicesApi.categories.remove(c._id);
      showSuccess("Category deleted.");
      reload();
    } catch (err) {
      showError(errorText(err, "Could not delete the category."));
    }
  };

  return (
    <>
      <PanelHeader title="Speaker Categories" count={categories.length} addLabel="Add Category" onAdd={() => { setError(""); setModal({ id: null, name: "" }); }} />
      <p className="mb-2 text-[9px] text-[#64748b]">These are the filter tabs above the speaker cards on the website. Renaming one moves its speakers too.</p>
      <DataTable headers={["S.No", "Category", "Speakers", "Actions"]} loading={loading} empty={!categories.length}>
        {categories.map((c, i) => (
          <tr key={c._id} className="hover:bg-slate-50/80">
            <Cell className="font-semibold text-[#293681]">{i + 1}</Cell>
            <Cell><span className="rounded-[4px] bg-[#f0f4f8] px-[8px] py-[3px] text-[8.5px] font-bold tracking-wide text-[#4B1426]">{c.category}</span></Cell>
            <Cell>{c.speakerCount ? <span className="font-bold text-[#0A7C6E]">{c.speakerCount} speaker(s)</span> : <span className="text-[#94a3b8]">—</span>}</Cell>
            <Cell><RowActions onEdit={() => { setError(""); setModal({ id: c._id, name: c.category }); }} onDelete={() => remove(c)} /></Cell>
          </tr>
        ))}
      </DataTable>

      <Modal isOpen={Boolean(modal)} onClose={() => setModal(null)} title={modal?.id ? "Rename Category" : "Add Category"} size="sm"
        footer={<ModalFooter onCancel={() => setModal(null)} onSave={save} saving={saving} label={modal?.id ? "Save" : "Add Category"} />}>
        <div className="space-y-2">
          <Input label="Category Name" required maxLength={40} placeholder="e.g. PUBLIC HEALTH" value={modal?.name ?? ""}
            onChange={(e) => modal && setModal({ ...modal, name: e.target.value.toUpperCase() })} />
          {error && <p className="text-[10px] font-semibold text-red-500">{error}</p>}
        </div>
      </Modal>
    </>
  );
}

/* =========================================================
   COUNTERS
========================================================= */
const EMPTY_COUNTER: GvCounterInput = { number: "", label: "", order: 0 };

function CountersTab() {
  const [items, setItems] = useState<GvCounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ id: string | null; form: GvCounterInput } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    globalVoicesApi.counters.list().then(setItems).catch((err) => showError(errorText(err, "Could not load the counters."))).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async () => {
    if (!modal) return;
    const form = { ...modal.form, number: modal.form.number.trim(), label: modal.form.label.trim(), order: Number(modal.form.order) || 0 };
    if (!form.number || !form.label) return setError("Number and label are required.");
    setSaving(true);
    setError("");
    try {
      if (modal.id) await globalVoicesApi.counters.update(modal.id, form);
      else await globalVoicesApi.counters.create(form);
      showSuccess(modal.id ? "Counter updated." : "Counter added.");
      setModal(null);
      load();
    } catch (err) {
      setError(errorText(err, "Could not save the counter."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: GvCounter) => {
    if (!(await confirmDelete(`Delete "${c.number} ${c.label}"?`, "It disappears from the website.")).isConfirmed) return;
    try {
      await globalVoicesApi.counters.remove(c._id);
      showSuccess("Counter deleted.");
      load();
    } catch (err) {
      showError(errorText(err, "Could not delete the counter."));
    }
  };

  return (
    <>
      <PanelHeader title="Counters List" count={items.length} addLabel="Add Counter"
        onAdd={() => { setError(""); setModal({ id: null, form: { ...EMPTY_COUNTER, order: items.length + 1 } }); }} />
      <DataTable headers={["S.No", "Number", "Label", "Order", "Actions"]} loading={loading} empty={!items.length}>
        {items.map((c, i) => (
          <tr key={c._id} className="hover:bg-slate-50/80">
            <Cell className="font-semibold text-[#293681]">{i + 1}</Cell>
            <Cell><span className="text-[13px] font-bold text-[#1b5e20]">{c.number}</span></Cell>
            <Cell className="font-semibold">{c.label}</Cell>
            <Cell>{c.order}</Cell>
            <Cell><RowActions onEdit={() => { setError(""); setModal({ id: c._id, form: { number: c.number, label: c.label, order: c.order } }); }} onDelete={() => remove(c)} /></Cell>
          </tr>
        ))}
      </DataTable>

      <Modal isOpen={Boolean(modal)} onClose={() => setModal(null)} title={modal?.id ? "Edit Counter" : "Add Counter"} size="sm"
        footer={<ModalFooter onCancel={() => setModal(null)} onSave={save} saving={saving} label={modal?.id ? "Save" : "Add Counter"} />}>
        {modal && (
          <div className="space-y-3">
            <Input label="Number" required maxLength={12} placeholder="e.g. 42+" value={modal.form.number}
              onChange={(e) => setModal({ ...modal, form: { ...modal.form, number: e.target.value } })} />
            <Input label="Label" required maxLength={40} placeholder="e.g. Expert Speakers" value={modal.form.label}
              onChange={(e) => setModal({ ...modal, form: { ...modal.form, label: e.target.value } })} />
            <Input label="Order" type="number" min={0} value={String(modal.form.order)}
              onChange={(e) => setModal({ ...modal, form: { ...modal.form, order: Number(e.target.value) } })} hint="Lower numbers show first" />
            {error && <p className="text-[10px] font-semibold text-red-500">{error}</p>}
          </div>
        )}
      </Modal>
    </>
  );
}

/* =========================================================
   SPEAKERS (video cards)
========================================================= */
const EMPTY_SPEAKER: GvSpeakerInput = {
  name: "", designation: "", organization: "", country: "India", description: "", category: "",
  image: "", imageAlt: "", sourceType: "YOUTUBE", videoUrl: "", videoThumbnail: "", showOverlay: true, order: 0,
};

/** Video upload button used when the source is "Upload" */
function VideoUpload({ value, onUploaded }: { value: string; onUploaded: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      const res = await globalVoicesApi.uploadVideo(file);
      onUploaded(res.url);
      showSuccess(`Video uploaded to Cloudinary (${res.fileSize}).`);
    } catch (err) {
      showError(errorText(err, "Video upload failed."));
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };
  return (
    <div>
      <input ref={ref} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      <button type="button" disabled={busy} onClick={() => ref.current?.click()}
        className="inline-flex h-[34px] items-center gap-[6px] border border-[#0f766e] bg-[#f0fdfa] px-[12px] text-[11px] font-semibold text-[#0f766e] hover:bg-[#ccfbf1] disabled:opacity-60">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
        {busy ? "Uploading video..." : value ? "Replace Video" : "Upload Video"}
      </button>
      <span className="ml-3 text-[10px] text-[#64748b]">MP4, WEBM or MOV · up to 50 MB</span>
      {value && <video src={value} controls className="mt-2 max-h-[140px] w-full rounded-[6px] bg-black" />}
    </div>
  );
}

function SpeakersTab({ categories }: { categories: GvCategory[] }) {
  const [items, setItems] = useState<GvSpeaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ id: string | null; form: GvSpeakerInput } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    globalVoicesApi.speakers.list().then(setItems).catch((err) => showError(errorText(err, "Could not load the speakers."))).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const setForm = (patch: Partial<GvSpeakerInput>) => modal && setModal({ ...modal, form: { ...modal.form, ...patch } });

  const save = async () => {
    if (!modal) return;
    const f = { ...modal.form, name: modal.form.name.trim(), videoUrl: modal.form.videoUrl.trim(), order: Number(modal.form.order) || 0 };
    if (!f.name) return setError("Speaker name is required.");
    if (!f.category) return setError("Pick a category.");
    if (f.videoUrl && !LINK_RULES[f.sourceType].test.test(f.videoUrl)) return setError(LINK_RULES[f.sourceType].message);
    setSaving(true);
    setError("");
    try {
      if (modal.id) await globalVoicesApi.speakers.update(modal.id, f);
      else await globalVoicesApi.speakers.create(f);
      showSuccess(modal.id ? "Speaker updated." : "Speaker added.");
      setModal(null);
      load();
    } catch (err) {
      setError(errorText(err, "Could not save the speaker."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: GvSpeaker) => {
    if (!(await confirmDelete(`Delete "${s.name}"?`, "The speaker card disappears from the website.")).isConfirmed) return;
    try {
      await globalVoicesApi.speakers.remove(s._id);
      showSuccess("Speaker deleted.");
      load();
    } catch (err) {
      showError(errorText(err, "Could not delete the speaker."));
    }
  };

  const picture = (s: GvSpeakerInput) => s.image || videoThumbnail({ thumbnail: s.videoThumbnail, sourceType: s.sourceType, videoUrl: s.videoUrl });

  return (
    <>
      <PanelHeader title="Speakers" count={items.length} addLabel="Add Speaker"
        onAdd={() => { setError(""); setModal({ id: null, form: { ...EMPTY_SPEAKER, category: categories[0]?.category ?? "", order: items.length + 1 } }); }} />
      <p className="mb-2 text-[9px] text-[#64748b]">The big video cards. Each one shows under its category tab (and under ALL SPEAKERS).</p>
      <DataTable headers={["S.No", "Speaker", "Category", "Organisation | Country", "Video", "Actions"]} loading={loading} empty={!items.length}>
        {items.map((s, i) => (
          <tr key={s._id} className="hover:bg-slate-50/80">
            <Cell className="font-semibold text-[#293681]">{i + 1}</Cell>
            <Cell>
              <div className="flex min-w-[220px] items-center gap-[10px]">
                <div className="relative h-[40px] w-[56px] shrink-0 overflow-hidden rounded-[5px] bg-[#0b1f17]">
                  {picture(s) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={picture(s)} alt={s.name} className="h-full w-full object-cover" />
                  ) : <div className="grid h-full w-full place-items-center text-white/50"><ImageIcon className="h-4 w-4" /></div>}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[10.5px] font-bold text-[#4B1426]">{s.name}</p>
                  <p className="truncate text-[8.5px] font-semibold text-[#0A7C6E]">{s.designation || "—"}</p>
                </div>
              </div>
            </Cell>
            <Cell><span className="rounded-[4px] bg-amber-50 px-[6px] py-[2px] text-[8px] font-bold text-amber-800 border border-amber-200">{s.category}</span></Cell>
            <Cell>{[s.organization, s.country].filter(Boolean).join(" | ") || "—"}</Cell>
            <Cell>
              {s.videoUrl ? (
                <a href={s.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline">
                  <PlayCircle className="h-3.5 w-3.5" /> {SOURCES.find((x) => x.value === s.sourceType)?.label ?? s.sourceType}
                </a>
              ) : <span className="text-[#94a3b8]">No video</span>}
            </Cell>
            <Cell>
              <RowActions onEdit={() => {
                setError("");
                const { _id, ...rest } = s;
                setModal({ id: _id, form: { ...EMPTY_SPEAKER, ...rest, imageAlt: rest.imageAlt || "", showOverlay: rest.showOverlay !== false } });
              }} onDelete={() => remove(s)} />
            </Cell>
          </tr>
        ))}
      </DataTable>

      <Modal isOpen={Boolean(modal)} onClose={() => setModal(null)} title={modal?.id ? "Edit Speaker" : "Add Speaker"} size="lg"
        footer={<ModalFooter onCancel={() => setModal(null)} onSave={save} saving={saving} label={modal?.id ? "Save Changes" : "Add Speaker"} />}>
        {modal && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Speaker Name" required maxLength={80} placeholder="e.g. Dr. Randeep Guleria" value={modal.form.name} onChange={(e) => setForm({ name: e.target.value })} />
              <Select label="Category" required value={modal.form.category} onChange={(e) => setForm({ category: e.target.value })}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c._id} value={c.category}>{c.category}</option>)}
              </Select>
            </div>
            <Textarea label="Designation" rows={2} maxLength={160} placeholder="e.g. Pulmonologist & Director AIIMS, India" value={modal.form.designation}
              onChange={(e) => setForm({ designation: e.target.value })} hint="Press Enter for a new line on the card" />
            <div className="grid grid-cols-3 gap-3">
              <Input label="Organisation" maxLength={80} value={modal.form.organization} onChange={(e) => setForm({ organization: e.target.value })} />
              <Input label="Country" maxLength={40} value={modal.form.country} onChange={(e) => setForm({ country: e.target.value })} />
              <Input label="Order" type="number" min={0} value={String(modal.form.order)} onChange={(e) => setForm({ order: Number(e.target.value) })} />
            </div>

            <div className="rounded-[6px] border border-[#e2e8f0] bg-slate-50/50 p-3">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#18233b]">Video (optional)</span>
              <div className="mb-2 grid grid-cols-3 gap-2">
                {SOURCES.map(({ value, label, Icon, idle, active }) => (
                  <button key={value} type="button" onClick={() => setForm({ sourceType: value, videoUrl: "" })}
                    className={`flex h-[34px] items-center justify-center gap-2 rounded-[6px] border text-[11px] font-semibold transition ${modal.form.sourceType === value ? active : idle}`}>
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>
              {modal.form.sourceType === "UPLOAD" ? (
                <VideoUpload value={modal.form.videoUrl} onUploaded={(url) => setForm({ videoUrl: url })} />
              ) : (
                <Input label="Video URL" maxLength={1000} placeholder={modal.form.sourceType === "YOUTUBE" ? "https://youtu.be/... or https://youtube.com/shorts/..." : "https://www.instagram.com/reel/..."}
                  value={modal.form.videoUrl} onChange={(e) => setForm({ videoUrl: e.target.value })} hint="Leave empty for a card without a play button" />
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="space-y-2 rounded-[6px] border border-[#e2e8f0] p-3">
                <CloudImageField upload={globalVoicesApi.uploadImage} label="Card Photo" value={modal.form.image}
                  onChange={(v) => setForm({ image: v })} hint="Landscape photo" previewClass="h-[56px] w-[80px]" />
                <Input label="Photo Alt Text" maxLength={150} disabled={!modal.form.image} value={modal.form.imageAlt} onChange={(e) => setForm({ imageAlt: e.target.value })} />
              </div>
              <div className="space-y-2 rounded-[6px] border border-[#e2e8f0] p-3">
                <CloudImageField upload={globalVoicesApi.uploadImage} label="Video Thumbnail" value={modal.form.videoThumbnail}
                  onChange={(v) => setForm({ videoThumbnail: v })} hint="Used when there is no card photo" previewClass="h-[56px] w-[80px]" />
                <p className="text-[10px] text-[#64748b]">Without a photo or thumbnail, YouTube&apos;s own thumbnail is used.</p>
              </div>
            </div>

            <Textarea label="Description" rows={2} maxLength={300} value={modal.form.description} onChange={(e) => setForm({ description: e.target.value })} />
            <label className="flex items-center gap-2 text-[11px] font-semibold text-[#334155]">
              <input type="checkbox" checked={modal.form.showOverlay} onChange={(e) => setForm({ showOverlay: e.target.checked })} className="h-4 w-4 accent-[#1b5e20]" />
              Dark overlay on the photo (keeps the name readable)
            </label>
            {error && <p className="text-[10px] font-semibold text-red-500">{error}</p>}
          </div>
        )}
      </Modal>
    </>
  );
}

/* =========================================================
   CAROUSEL SPEAKERS (round photos)
========================================================= */
const EMPTY_CAROUSEL: GvCarouselSpeakerInput = { name: "", designation: "", categoryTag: "", image: "", imageAltText: "", order: 0 };

function CarouselTab({ categories }: { categories: GvCategory[] }) {
  const [items, setItems] = useState<GvCarouselSpeaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ id: string | null; form: GvCarouselSpeakerInput } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    globalVoicesApi.carouselSpeakers.list().then(setItems).catch((err) => showError(errorText(err, "Could not load the carousel speakers."))).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const setForm = (patch: Partial<GvCarouselSpeakerInput>) => modal && setModal({ ...modal, form: { ...modal.form, ...patch } });

  const save = async () => {
    if (!modal) return;
    const f = { ...modal.form, name: modal.form.name.trim(), imageAltText: modal.form.imageAltText.trim(), order: Number(modal.form.order) || 0 };
    if (!f.name) return setError("Speaker name is required.");
    if (f.image && !f.imageAltText) return setError("Enter the photo alt text.");
    setSaving(true);
    setError("");
    try {
      if (modal.id) await globalVoicesApi.carouselSpeakers.update(modal.id, f);
      else await globalVoicesApi.carouselSpeakers.create(f);
      showSuccess(modal.id ? "Carousel speaker updated." : "Carousel speaker added.");
      setModal(null);
      load();
    } catch (err) {
      setError(errorText(err, "Could not save the carousel speaker."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: GvCarouselSpeaker) => {
    if (!(await confirmDelete(`Delete "${s.name}"?`, "The speaker disappears from the website carousel.")).isConfirmed) return;
    try {
      await globalVoicesApi.carouselSpeakers.remove(s._id);
      showSuccess("Carousel speaker deleted.");
      load();
    } catch (err) {
      showError(errorText(err, "Could not delete the carousel speaker."));
    }
  };

  return (
    <>
      <PanelHeader title="Carousel Speakers" count={items.length} addLabel="Add Carousel Speaker"
        onAdd={() => { setError(""); setModal({ id: null, form: { ...EMPTY_CAROUSEL, order: items.length + 1 } }); }} />
      <p className="mb-2 text-[9px] text-[#64748b]">The scrolling row of round photos under the speaker cards.</p>
      <DataTable headers={["S.No", "Speaker", "Category Tag", "Order", "Actions"]} loading={loading} empty={!items.length}>
        {items.map((s, i) => (
          <tr key={s._id} className="hover:bg-slate-50/80">
            <Cell className="font-semibold text-[#293681]">{i + 1}</Cell>
            <Cell>
              <div className="flex min-w-[240px] items-center gap-[10px]">
                {s.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image} alt={s.imageAltText || s.name} className="h-[38px] w-[38px] shrink-0 rounded-full border-2 border-[#cba344] bg-white object-contain" />
                ) : <div className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full border-2 border-[#cba344] bg-white text-[#cba344]"><ImageIcon className="h-4 w-4" /></div>}
                <div className="min-w-0">
                  <p className="truncate text-[10.5px] font-bold text-[#4B1426]">{s.name}</p>
                  <p className="line-clamp-1 text-[8.5px] font-semibold text-[#0A7C6E]">{s.designation || "—"}</p>
                </div>
              </div>
            </Cell>
            <Cell>{s.categoryTag ? <span className="rounded-full bg-[#032e1c] px-[8px] py-[2px] text-[8px] font-bold tracking-wider text-[#f3ce71]">{s.categoryTag}</span> : <span className="text-[#94a3b8]">—</span>}</Cell>
            <Cell>{s.order}</Cell>
            <Cell>
              <RowActions onEdit={() => { setError(""); const { _id, ...rest } = s; setModal({ id: _id, form: { ...EMPTY_CAROUSEL, ...rest } }); }} onDelete={() => remove(s)} />
            </Cell>
          </tr>
        ))}
      </DataTable>

      <Modal isOpen={Boolean(modal)} onClose={() => setModal(null)} title={modal?.id ? "Edit Carousel Speaker" : "Add Carousel Speaker"} size="lg"
        footer={<ModalFooter onCancel={() => setModal(null)} onSave={save} saving={saving} label={modal?.id ? "Save Changes" : "Add Speaker"} />}>
        {modal && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Speaker Name" required maxLength={80} value={modal.form.name} onChange={(e) => setForm({ name: e.target.value })} />
              <Input label="Order" type="number" min={0} value={String(modal.form.order)} onChange={(e) => setForm({ order: Number(e.target.value) })} />
            </div>
            <Input label="Designation" maxLength={120} placeholder="e.g. Director All India Institute of Ayurveda (AIIA)" value={modal.form.designation}
              onChange={(e) => setForm({ designation: e.target.value })} />
            <div>
              <Input label="Category Tag" maxLength={40} placeholder="e.g. HEALTH TECH" value={modal.form.categoryTag}
                onChange={(e) => setForm({ categoryTag: e.target.value.toUpperCase() })} list="gv-category-tags" hint="Pick a category or type your own tag" />
              <datalist id="gv-category-tags">
                {categories.map((c) => <option key={c._id} value={c.category} />)}
              </datalist>
            </div>
            <div className="grid grid-cols-[1.4fr_1fr] gap-3">
              <CloudImageField upload={globalVoicesApi.uploadImage} label="Round Photo" value={modal.form.image}
                onChange={(v) => setForm({ image: v })} hint="Square photo" previewClass="h-[56px] w-[56px]" />
              <Input label="Photo Alt Text" required={Boolean(modal.form.image)} maxLength={150} value={modal.form.imageAltText}
                onChange={(e) => setForm({ imageAltText: e.target.value })} />
            </div>
            {error && <p className="text-[10px] font-semibold text-red-500">{error}</p>}
          </div>
        )}
      </Modal>
    </>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function GlobalVoicesPage() {
  const [tab, setTab] = useState<TabId>("settings");
  const [categories, setCategories] = useState<GvCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const loadCategories = () => {
    setCategoriesLoading(true);
    globalVoicesApi.categories.list()
      .then(setCategories)
      .catch((err) => showError(errorText(err, "Could not load the categories.")))
      .finally(() => setCategoriesLoading(false));
  };
  useEffect(loadCategories, []);

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* TOP HEADING */}
        <div className="mb-[14px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#4B1426]" style={{ color: "#4B1426" }}>
              Global Voices Management
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">Manage the Global Voices of Healthcare Innovation section of the website home page.</p>
          </div>
          <a href={WEBSITE_URL} target="_blank" rel="noreferrer"
            className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] border border-[#fed7aa] bg-[#fff7ed] px-[14px] text-[8.5px] font-semibold text-[#ea580c] shadow-sm transition hover:bg-[#ffedd5]">
            <ExternalLink className="h-[12px] w-[12px]" strokeWidth={1.7} /> View on Website
          </a>
        </div>

        {/* TABS */}
        <div className="mb-[14px] flex flex-wrap gap-[6px] rounded-[8px] border border-[#e8e5df] bg-[#fafafa] p-[4px]">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} type="button" onClick={() => setTab(id)}
              className={`flex h-[32px] items-center gap-[6px] rounded-[6px] px-[14px] text-[10px] font-bold transition ${
                tab === id ? "bg-[#111844] text-white shadow-sm" : "text-[#475569] hover:bg-white"
              }`}>
              <Icon className="h-[13px] w-[13px]" /> {label}
            </button>
          ))}
          <span className="ml-auto flex items-center gap-1 pr-2 text-[9px] text-[#94a3b8]"><LayoutGrid className="h-3 w-3" /> Changes show on the website after a refresh</span>
        </div>

        {tab === "settings" && <SettingsTab />}
        {tab === "categories" && <CategoriesTab categories={categories} loading={categoriesLoading} reload={loadCategories} />}
        {tab === "speakers" && <SpeakersTab categories={categories} />}
        {tab === "carousel" && <CarouselTab categories={categories} />}
        {tab === "counters" && <CountersTab />}
      </div>
    </div>
  );
}
