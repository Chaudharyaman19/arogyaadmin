"use client";

import { useEffect, useState } from "react";
import {
  Apple,
  ArrowDown,
  ArrowUp,
  Award,
  BookOpen,
  Brain,
  FileText,
  FlaskConical,
  Globe,
  GraduationCap,
  Handshake,
  Heart,
  HeartHandshake,
  Leaf,
  Loader2,
  Plus,
  Save,
  ShieldCheck,
  Sprout,
  Stethoscope,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { FieldLabel, Textarea, TextInput, Toggle } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import { aboutInitiativesApi, AboutInitiatives, FocusArea, FocusAreaIcon, InitiativeCard } from "@/lib/aboutInitiativesApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   OUR INITIATIVES — the initiative cards and the dark green
   "Our Key Focus Areas" band on the website About Us page.
   Loads from and saves straight to backend-arogya (images go
   to Cloudinary), so it has its own Save button — page sections
   are only stored locally.
========================================================= */

const ICONS: { name: FocusAreaIcon; label: string; Icon: LucideIcon }[] = [
  { name: "HeartHandshake", label: "Care", Icon: HeartHandshake },
  { name: "Stethoscope", label: "Doctor", Icon: Stethoscope },
  { name: "Leaf", label: "Leaf", Icon: Leaf },
  { name: "Users", label: "People", Icon: Users },
  { name: "FileText", label: "Document", Icon: FileText },
  { name: "Heart", label: "Heart", Icon: Heart },
  { name: "BookOpen", label: "Book", Icon: BookOpen },
  { name: "GraduationCap", label: "Education", Icon: GraduationCap },
  { name: "FlaskConical", label: "Research", Icon: FlaskConical },
  { name: "Apple", label: "Nutrition", Icon: Apple },
  { name: "ShieldCheck", label: "Safety", Icon: ShieldCheck },
  { name: "Handshake", label: "Partnership", Icon: Handshake },
  { name: "Globe", label: "Globe", Icon: Globe },
  { name: "Sprout", label: "Growth", Icon: Sprout },
  { name: "Brain", label: "Mind", Icon: Brain },
  { name: "Award", label: "Award", Icon: Award },
];
const ICON_BY_NAME = Object.fromEntries(ICONS.map((i) => [i.name, i.Icon])) as Record<string, LucideIcon>;
const MAX_CARDS = 15;
const MAX_FOCUS = 8;

const EMPTY: AboutInitiatives = {
  heading: "OUR INITIATIVES – BUILDING A BETTER TOMORROW",
  dividerImage: "",
  dividerImageAlt: "Gold lotus divider",
  decorImage: "",
  decorImageAlt: "Decorative gold leaves",
  cards: [],
  focusTitle: "OUR KEY\nFOCUS\nAREAS",
  focusAreas: [],
};
const newCard = (): InitiativeCard => ({ title: "", description: "", icon: "", iconAlt: "", image: "", imageAlt: "", isActive: true });
const newFocus = (): FocusArea => ({ icon: "Heart", text: "", isActive: true });
const oneLine = (text: string) => text.replace(/\n/g, " ");

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

function RowButtons({ index, total, onMove, onRemove, active, onActive, title }: {
  index: number; total: number; onMove: (d: -1 | 1) => void; onRemove: () => void; active: boolean; onActive: (v: boolean) => void; title: string;
}) {
  return (
    <div className="ml-auto flex items-center gap-[6px]">
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

export function AboutInitiativesEditor() {
  const [data, setData] = useState<AboutInitiatives>(EMPTY);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    aboutInitiativesApi
      .get()
      .then((res) => {
        if (res) setData({ ...EMPTY, ...res });
        else setIsSaved(false);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load Our Initiatives."))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof AboutInitiatives>(key: K, value: AboutInitiatives[K]) => setData((prev) => ({ ...prev, [key]: value }));
  const setCard = (index: number, patch: Partial<InitiativeCard>) =>
    set("cards", data.cards.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  const setFocus = (index: number, patch: Partial<FocusArea>) =>
    set("focusAreas", data.focusAreas.map((f, i) => (i === index ? { ...f, ...patch } : f)));

  const save = async () => {
    if (!data.heading.trim()) return setError("Enter the heading.");
    if (data.dividerImage && !data.dividerImageAlt.trim()) return setError("Enter the alt text of the divider image.");
    if (data.decorImage && !data.decorImageAlt.trim()) return setError("Enter the alt text of the decoration image.");
    for (const [i, c] of data.cards.entries()) {
      const name = oneLine(c.title) || `Initiative ${i + 1}`;
      if (!c.title.trim()) return setError(`Initiative ${i + 1}: enter the title.`);
      if (c.icon && !c.iconAlt.trim()) return setError(`${name}: enter the icon alt text.`);
      if (c.image && !c.imageAlt.trim()) return setError(`${name}: enter the image alt text.`);
    }
    for (const [i, f] of data.focusAreas.entries()) {
      if (!f.text.trim()) return setError(`Focus area ${i + 1}: enter the text.`);
    }

    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const saved = await aboutInitiativesApi.save(input);
      setData({ ...EMPTY, ...saved });
      setIsSaved(true);
      showSuccess("Our Initiatives saved. The website updates within 30 seconds.");
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save Our Initiatives.";
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
        Loading Our Initiatives...
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

      <Panel title="Heading & Decorations" note={'Write " – " (space, dash, space) in the heading to keep the light dash between the two parts.'}>
        <div>
          <FieldLabel required>Heading</FieldLabel>
          <TextInput value={data.heading} onChange={(v) => set("heading", v.toUpperCase())} maxLength={70} />
        </div>
        <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
          <CloudImageField
            upload={aboutInitiativesApi.upload}
            label="Divider (under the heading)"
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
        <div className="grid grid-cols-[auto_1fr] items-end gap-[10px]">
          <CloudImageField
            upload={aboutInitiativesApi.upload}
            label="Top Right Decoration"
            value={data.decorImage}
            onChange={(v) => set("decorImage", v)}
            hint="Transparent image"
            previewClass="h-[48px] w-[48px]"
          />
          <div>
            <FieldLabel required={Boolean(data.decorImage)}>Decoration Alt Text</FieldLabel>
            <TextInput value={data.decorImageAlt} onChange={(v) => set("decorImageAlt", v)} maxLength={150} />
          </div>
        </div>
      </Panel>

      <Panel
        title={`Initiative Cards (${data.cards.length} total, ${data.cards.filter((c) => c.isActive).length} shown)`}
        note="Press Enter in a title or description to start a new line on the website."
        action={<AddButton label="Add Initiative" onClick={() => set("cards", [...data.cards, newCard()])} disabled={data.cards.length >= MAX_CARDS} />}
      >
        {data.cards.map((card, index) => (
          <div key={index} className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] bg-[#fbfbfa] p-[10px]">
            <div className="flex items-center gap-[8px]">
              {card.icon && <img src={card.icon} alt="" className="h-[22px] w-[22px] object-contain" />}
              <span className="text-[11px] font-bold text-[#4B1426]">{oneLine(card.title) || `Initiative ${index + 1}`}</span>
              <RowButtons
                index={index}
                total={data.cards.length}
                active={card.isActive}
                onActive={(v) => setCard(index, { isActive: v })}
                onMove={(d) => set("cards", swap(data.cards, index, d))}
                onRemove={() => set("cards", data.cards.filter((_, i) => i !== index))}
                title="Remove initiative"
              />
            </div>
            <div className="grid grid-cols-2 gap-[10px]">
              <div>
                <FieldLabel required>Title</FieldLabel>
                <Textarea value={card.title} onChange={(v) => setCard(index, { title: v })} rows={2} maxLength={45} />
              </div>
              <div>
                <FieldLabel>Description</FieldLabel>
                <Textarea value={card.description} onChange={(v) => setCard(index, { description: v })} rows={3} maxLength={200} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-[10px]">
              <div className="flex flex-col gap-[6px]">
                <CloudImageField
                  upload={aboutInitiativesApi.upload}
                  label="Icon"
                  value={card.icon}
                  onChange={(v) => setCard(index, { icon: v })}
                  hint="Round icon, transparent"
                  previewClass="h-[48px] w-[48px]"
                />
                <div>
                  <FieldLabel required={Boolean(card.icon)}>Icon Alt Text</FieldLabel>
                  <TextInput value={card.iconAlt} onChange={(v) => setCard(index, { iconAlt: v })} placeholder="Integrated Healthcare icon" maxLength={150} />
                </div>
              </div>
              <div className="flex flex-col gap-[6px]">
                <CloudImageField
                  upload={aboutInitiativesApi.upload}
                  label="Card Image (bottom)"
                  value={card.image}
                  onChange={(v) => setCard(index, { image: v })}
                  hint="Landscape, about 600 × 300 px"
                  previewClass="h-[48px] w-[90px]"
                />
                <div>
                  <FieldLabel required={Boolean(card.image)}>Image Alt Text</FieldLabel>
                  <TextInput value={card.imageAlt} onChange={(v) => setCard(index, { imageAlt: v })} placeholder="Describe what the photo shows" maxLength={150} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </Panel>

      <Panel
        title={`Our Key Focus Areas Band (${data.focusAreas.length} total, ${data.focusAreas.filter((f) => f.isActive).length} shown)`}
        note="Dark green band under the cards. Press Enter for a new line (wide screens)."
        action={<AddButton label="Add Focus Area" onClick={() => set("focusAreas", [...data.focusAreas, newFocus()])} disabled={data.focusAreas.length >= MAX_FOCUS} />}
      >
        <div>
          <FieldLabel>Band Title</FieldLabel>
          <Textarea value={data.focusTitle} onChange={(v) => set("focusTitle", v.toUpperCase())} rows={3} maxLength={40} />
        </div>
        {data.focusAreas.map((focus, index) => {
          const Preview = ICON_BY_NAME[focus.icon] ?? Heart;
          return (
            <div key={index} className="flex flex-col gap-[8px] rounded-[6px] border border-[#e2e8f0] bg-[#fbfbfa] p-[10px]">
              <div className="flex items-center gap-[8px]">
                <Preview className="h-[18px] w-[18px] text-[#b8860b]" strokeWidth={1.5} />
                <span className="text-[11px] font-bold text-[#4B1426]">{oneLine(focus.text) || `Focus area ${index + 1}`}</span>
                <RowButtons
                  index={index}
                  total={data.focusAreas.length}
                  active={focus.isActive}
                  onActive={(v) => setFocus(index, { isActive: v })}
                  onMove={(d) => set("focusAreas", swap(data.focusAreas, index, d))}
                  onRemove={() => set("focusAreas", data.focusAreas.filter((_, i) => i !== index))}
                  title="Remove focus area"
                />
              </div>
              <div>
                <FieldLabel required>Text</FieldLabel>
                <Textarea value={focus.text} onChange={(v) => setFocus(index, { text: v })} rows={2} maxLength={40} />
              </div>
              <div className="flex flex-wrap gap-[6px]">
                {ICONS.map(({ name, label, Icon }) => {
                  const selected = focus.icon === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      title={label}
                      onClick={() => setFocus(index, { icon: name })}
                      className={`flex h-[28px] items-center gap-[5px] rounded-[5px] border px-[8px] text-[10px] font-semibold transition ${
                        selected
                          ? "border-[#0f766e] bg-[#f0fdfa] text-[#0f766e] shadow-[0_0_0_1px_#0f766e]"
                          : "border-[#e2e8f0] bg-white text-[#475569] hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="h-[13px] w-[13px]" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
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
          Save Our Initiatives
        </button>
      </div>
    </div>
  );
}
