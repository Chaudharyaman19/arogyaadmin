"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  FlaskConical,
  Globe,
  GraduationCap,
  Handshake,
  HeartPulse,
  Landmark,
  Laptop,
  Leaf,
  Lightbulb,
  Loader2,
  Mic,
  Microscope,
  Network,
  Pill,
  Plus,
  Presentation,
  Save,
  Star,
  Stethoscope,
  Trash2,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { FieldLabel, Textarea, TextInput, Toggle } from "./FormPrimitives";
import { CloudImageField } from "./CloudImageField";
import {
  eventHighlightsApi,
  EhAgendaDay,
  EhAttendee,
  EhButton,
  EhHighlight,
  EventHighlights,
} from "@/lib/eventHighlightsApi";
import { ApiRequestError } from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";

/* =========================================================
   EVENT HIGHLIGHTS & CTA — highlight cards, 3-day agenda, who
   should attend, event details with map and the registration
   band on the website home page. Loads from and saves straight
   to backend-arogya (images go to Cloudinary), so it has its own
   Save button — page sections are only stored locally. Icon names
   must match backend models/home/EventHighlights.js.
========================================================= */

const ICONS: { name: string; label: string; Icon: LucideIcon }[] = [
  { name: "mic", label: "Mic", Icon: Mic },
  { name: "users", label: "People", Icon: Users },
  { name: "lightbulb", label: "Idea", Icon: Lightbulb },
  { name: "handshake", label: "Handshake", Icon: Handshake },
  { name: "leaf", label: "Leaf", Icon: Leaf },
  { name: "network", label: "Network", Icon: Network },
  { name: "stethoscope", label: "Doctor", Icon: Stethoscope },
  { name: "book-open", label: "Book", Icon: BookOpen },
  { name: "flask", label: "Lab", Icon: FlaskConical },
  { name: "laptop", label: "Laptop", Icon: Laptop },
  { name: "landmark", label: "Government", Icon: Landmark },
  { name: "trending-up", label: "Growth", Icon: TrendingUp },
  { name: "graduation-cap", label: "Student", Icon: GraduationCap },
  { name: "heart-pulse", label: "Health", Icon: HeartPulse },
  { name: "globe", label: "Globe", Icon: Globe },
  { name: "award", label: "Award", Icon: Award },
  { name: "briefcase", label: "Business", Icon: Briefcase },
  { name: "building", label: "Building", Icon: Building2 },
  { name: "presentation", label: "Talk", Icon: Presentation },
  { name: "star", label: "Star", Icon: Star },
  { name: "pill", label: "Pharma", Icon: Pill },
  { name: "microscope", label: "Research", Icon: Microscope },
];
const ICON_BY_NAME = Object.fromEntries(ICONS.map((i) => [i.name, i.Icon]));

const CARD_COLORS = ["#FBF3E2", "#EEF6EF", "#EAF3FB", "#FCEEE5", "#F0F5E6", "#F1EEFA"];
const CTA_STYLES = [
  { name: "Gold button", bg: "linear-gradient(135deg,#f5c842,#ffa500)", color: "#0b2912" },
  { name: "Navy button", bg: "linear-gradient(135deg,#0a0f2b,#1a2566)", color: "#fff" },
  { name: "Emerald button", bg: "linear-gradient(135deg,#06554b,#0c9e8c)", color: "#fff" },
];
const LINK_PATTERN = /^(\/|https?:\/\/)/;
const HEX = /^#[0-9a-fA-F]{6}$/;
const MAP_PREFIX = "https://www.google.com/maps/embed";

const EMPTY_BUTTON: EhButton = { label: "", href: "", newTab: true };
const EMPTY: EventHighlights = {
  heading: "EVENT HIGHLIGHTS",
  highlights: [],
  glanceHeading: "",
  agendaDays: [],
  whoHeading: "",
  attendees: [],
  viewAgenda: EMPTY_BUTTON,
  detailsHeading: "",
  datesValue: "",
  venueValue: "",
  formatValue: "",
  organizerValue: "",
  mapEmbedUrl: "",
  ctaIcon: "",
  ctaIconAlt: "",
  ctaHeading: "",
  ctaParagraph: "",
  ctaButtons: [EMPTY_BUTTON, EMPTY_BUTTON, EMPTY_BUTTON],
};

/* ---------- small building blocks ---------- */
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

function AddButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="inline-flex h-[28px] shrink-0 items-center gap-[5px] border border-dashed border-[#0f766e] bg-[#f0fdfa] px-[10px] text-[11px] font-semibold text-[#0f766e] transition hover:bg-[#ccfbf1] disabled:cursor-not-allowed disabled:opacity-40">
      <Plus className="h-3 w-3" /> {label}
    </button>
  );
}

function RowControls({ isActive, onActive, onUp, onDown, onRemove }: {
  isActive: boolean; onActive: (v: boolean) => void; onUp?: () => void; onDown?: () => void; onRemove: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-[6px]">
      <span className={`text-[10px] font-bold ${isActive ? "text-[#16a34a]" : "text-[#dc2626]"}`}>{isActive ? "Shown" : "Hidden"}</span>
      <Toggle checked={isActive} onChange={onActive} />
      <button type="button" title="Move up" disabled={!onUp} onClick={onUp}
        className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
        <ArrowUp className="h-3 w-3" />
      </button>
      <button type="button" title="Move down" disabled={!onDown} onClick={onDown}
        className="grid h-[26px] w-[26px] place-items-center border border-[#e2e8f0] text-[#475569] hover:bg-slate-50 disabled:opacity-30">
        <ArrowDown className="h-3 w-3" />
      </button>
      <button type="button" title="Remove" onClick={onRemove}
        className="grid h-[26px] w-[26px] place-items-center border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

function IconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  return (
    <div className="flex flex-wrap gap-[5px]">
      {ICONS.map(({ name, label, Icon }) => {
        const selected = value === name;
        return (
          <button key={name} type="button" title={label} onClick={() => onChange(name)}
            className={`flex h-[30px] items-center gap-[4px] rounded-[5px] border px-[7px] text-[10px] font-semibold transition ${
              selected ? "border-[#0f766e] bg-[#f0fdfa] text-[#0f766e] shadow-[0_0_0_1px_#0f766e]" : "border-[#e2e8f0] bg-white text-[#475569] hover:bg-slate-50"
            }`}>
            <Icon className={`h-[13px] w-[13px] ${selected ? "text-[#cba344]" : ""}`} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function ButtonFields({ title, value, onChange, swatch }: {
  title: string; value: EhButton; onChange: (next: EhButton) => void; swatch?: { bg: string; color: string };
}) {
  return (
    <div className="flex flex-col gap-[8px] border border-[#e2e8f0] bg-[#fafafa] p-[10px]">
      <div className="flex items-center gap-[8px]">
        {swatch && (
          <span className="rounded-full px-[10px] py-[3px] text-[9px] font-black uppercase tracking-wider" style={{ background: swatch.bg, color: swatch.color }}>
            {value.label || "Button"}
          </span>
        )}
        <span className="text-[11px] font-bold text-[#334155]">{title}</span>
      </div>
      <div className="grid grid-cols-2 gap-[8px]">
        <div>
          <FieldLabel>Label</FieldLabel>
          <TextInput value={value.label} onChange={(v) => onChange({ ...value, label: v })} maxLength={30} />
        </div>
        <div>
          <FieldLabel>Link</FieldLabel>
          <TextInput value={value.href} onChange={(v) => onChange({ ...value, href: v })} placeholder="/register-now or https://..." maxLength={300} />
        </div>
      </div>
      <div className="flex items-center gap-[8px]">
        <Toggle checked={value.newTab} onChange={(v) => onChange({ ...value, newTab: v })} />
        <span className="text-[11px] text-[#475569]">Open in a new tab</span>
        <span className="ml-auto text-[10px] text-[#94a3b8]">Empty label hides it · empty link = button without a link</span>
      </div>
    </div>
  );
}

const move = <T,>(list: T[], index: number, direction: -1 | 1): T[] => {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};
const stripId = <T extends { _id?: string }>({ _id, ...rest }: T) => rest as T;

export function EventHighlightsEditor() {
  const [data, setData] = useState<EventHighlights>(EMPTY);
  const [isSaved, setIsSaved] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const normalise = (res: EventHighlights): EventHighlights => ({
    ...EMPTY,
    ...res,
    viewAgenda: { ...EMPTY_BUTTON, ...res.viewAgenda },
    ctaButtons: [0, 1, 2].map((i) => ({ ...EMPTY_BUTTON, ...(res.ctaButtons?.[i] ?? {}) })),
  });

  useEffect(() => {
    eventHighlightsApi
      .get()
      .then((res) => {
        if (res) setData(normalise(res));
        else setIsSaved(false);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Could not load this section."))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof EventHighlights>(key: K, value: EventHighlights[K]) => setData((prev) => ({ ...prev, [key]: value }));
  const patchList = <K extends "highlights" | "agendaDays" | "attendees">(key: K, index: number, patch: Partial<EventHighlights[K][number]>) =>
    setData((prev) => ({ ...prev, [key]: (prev[key] as EventHighlights[K][number][]).map((it, i) => (i === index ? { ...it, ...patch } : it)) }));

  const validate = (): string | null => {
    if (!data.heading.trim()) return "Enter the section heading.";
    if (!data.highlights.length) return "Add at least one highlight card.";
    for (const [i, h] of data.highlights.entries()) {
      if (!h.title.trim()) return `Highlight ${i + 1}: enter the title.`;
      if (h.image && !h.imageAlt.trim()) return `Highlight ${i + 1}: enter the image alt text.`;
      if (!HEX.test(h.bgColor)) return `Highlight ${i + 1}: card colour must look like #FBF3E2.`;
    }
    for (const [i, d] of data.agendaDays.entries()) {
      if (!d.badge.trim()) return `Agenda day ${i + 1}: enter the badge (e.g. DAY 1).`;
      if (d.image && !d.imageAlt.trim()) return `Agenda day ${i + 1}: enter the image alt text.`;
    }
    for (const [i, a] of data.attendees.entries()) if (!a.text.trim()) return `Attendee type ${i + 1}: enter the text.`;
    for (const b of [data.viewAgenda, ...data.ctaButtons]) {
      if (b.href.trim() && !LINK_PATTERN.test(b.href.trim())) return `Button link "${b.href}" must start with / or http(s)://`;
    }
    if (data.mapEmbedUrl.trim() && !data.mapEmbedUrl.trim().startsWith(MAP_PREFIX)) {
      return 'Map: paste the Google Maps "Embed a map" link (starts with https://www.google.com/maps/embed).';
    }
    if (data.ctaIcon && !data.ctaIconAlt.trim()) return "CTA band: enter the icon alt text.";
    return null;
  };

  const save = async () => {
    const problem = validate();
    if (problem) return setError(problem);
    setSaving(true);
    setError("");
    try {
      const { updatedAt, updatedBy, ...input } = data;
      const trimButton = (b: EhButton) => ({ ...b, label: b.label.trim(), href: b.href.trim() });
      const saved = await eventHighlightsApi.save({
        ...input,
        mapEmbedUrl: input.mapEmbedUrl.trim(),
        highlights: input.highlights.map(stripId),
        agendaDays: input.agendaDays.map(stripId),
        attendees: input.attendees.map(stripId),
        viewAgenda: trimButton(input.viewAgenda),
        ctaButtons: input.ctaButtons.map(trimButton),
      });
      setData(normalise(saved));
      setIsSaved(true);
      showSuccess("Event Highlights saved. The website updates within 30 seconds.");
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
        Loading Event Highlights...
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

      {/* HIGHLIGHT CARDS */}
      <Panel
        title="Highlight Cards"
        note="The row of photo cards. Press Enter in the text for a new line."
        action={<AddButton label="Add Highlight" disabled={data.highlights.length >= 12}
          onClick={() => set("highlights", [...data.highlights, { title: "", desc: "", image: "", imageAlt: "", icon: "mic", bgColor: CARD_COLORS[data.highlights.length % CARD_COLORS.length], isActive: true }])} />}
      >
        <div className="w-1/2">
          <FieldLabel required>Section Heading</FieldLabel>
          <TextInput value={data.heading} onChange={(v) => set("heading", v.toUpperCase())} maxLength={30} />
        </div>
        {data.highlights.map((h: EhHighlight, i) => {
          const Icon = ICON_BY_NAME[h.icon] ?? Mic;
          return (
            <div key={h._id ?? `h-${i}`} className="flex flex-col gap-[10px] rounded-[6px] border border-[#e2e8f0] p-[10px]" style={{ background: HEX.test(h.bgColor) ? h.bgColor : "#fff" }}>
              <div className="flex items-center gap-[10px]">
                <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full border-2 border-white bg-[#001810] text-[#cba344]">
                  <Icon className="h-[14px] w-[14px]" />
                </span>
                <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-[#00261c]">{h.title || `Highlight ${i + 1}`}</span>
                <RowControls isActive={h.isActive} onActive={(v) => patchList("highlights", i, { isActive: v })}
                  onUp={i > 0 ? () => set("highlights", move(data.highlights, i, -1)) : undefined}
                  onDown={i < data.highlights.length - 1 ? () => set("highlights", move(data.highlights, i, 1)) : undefined}
                  onRemove={() => set("highlights", data.highlights.filter((_, idx) => idx !== i))} />
              </div>
              <div className="grid grid-cols-[1fr_1.4fr_140px] gap-[10px]">
                <div>
                  <FieldLabel required>Title</FieldLabel>
                  <TextInput value={h.title} onChange={(v) => patchList("highlights", i, { title: v.toUpperCase() })} maxLength={45} />
                </div>
                <div>
                  <FieldLabel>Text</FieldLabel>
                  <Textarea value={h.desc} onChange={(v) => patchList("highlights", i, { desc: v })} rows={2} maxLength={120} />
                </div>
                <div>
                  <FieldLabel>Card Colour</FieldLabel>
                  <div className="flex items-center gap-[6px]">
                    <input type="color" value={HEX.test(h.bgColor) ? h.bgColor : "#ffffff"} onChange={(e) => patchList("highlights", i, { bgColor: e.target.value })}
                      className="h-[35px] w-[36px] cursor-pointer border border-[#cbd5e1] bg-white p-[2px]" />
                    <TextInput value={h.bgColor} onChange={(v) => patchList("highlights", i, { bgColor: v })} maxLength={7} hideLimit />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-[1.4fr_1fr] gap-[10px]">
                <CloudImageField upload={eventHighlightsApi.upload} label="Card Photo" value={h.image}
                  onChange={(v) => patchList("highlights", i, { image: v })} hint="Landscape photo" previewClass="h-[60px] w-[100px]" />
                <div>
                  <FieldLabel required={Boolean(h.image)}>Photo Alt Text</FieldLabel>
                  <TextInput value={h.imageAlt} onChange={(v) => patchList("highlights", i, { imageAlt: v })} placeholder="Describe the photo" maxLength={150} />
                </div>
              </div>
              <div>
                <FieldLabel>Icon</FieldLabel>
                <IconPicker value={h.icon} onChange={(name) => patchList("highlights", i, { icon: name })} />
              </div>
            </div>
          );
        })}
      </Panel>

      {/* AGENDA */}
      <Panel
        title="At A Glance — Agenda Days"
        action={<AddButton label="Add Day" disabled={data.agendaDays.length >= 7}
          onClick={() => set("agendaDays", [...data.agendaDays, { badge: `DAY ${data.agendaDays.length + 1}`, date: "", text: "", image: "", imageAlt: "", isActive: true }])} />}
      >
        <div className="w-1/2">
          <FieldLabel>Heading</FieldLabel>
          <TextInput value={data.glanceHeading} onChange={(v) => set("glanceHeading", v)} maxLength={45} />
        </div>
        {data.agendaDays.map((d: EhAgendaDay, i) => (
          <div key={d._id ?? `d-${i}`} className="flex flex-col gap-[10px] rounded-[6px] border border-[#e8dfc8] bg-[#FAF7F0] p-[10px]">
            <div className="flex items-center gap-[10px]">
              <span className="w-[62px] shrink-0 rounded bg-[#cd861b] px-1 py-[3px] text-center text-white">
                <span className="block text-[10px] font-bold">{d.badge || "DAY"}</span>
                <span className="block text-[8px]">{d.date || "date"}</span>
              </span>
              <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-[#001810]">{d.text || "Agenda text"}</span>
              <RowControls isActive={d.isActive} onActive={(v) => patchList("agendaDays", i, { isActive: v })}
                onUp={i > 0 ? () => set("agendaDays", move(data.agendaDays, i, -1)) : undefined}
                onDown={i < data.agendaDays.length - 1 ? () => set("agendaDays", move(data.agendaDays, i, 1)) : undefined}
                onRemove={() => set("agendaDays", data.agendaDays.filter((_, idx) => idx !== i))} />
            </div>
            <div className="grid grid-cols-[100px_130px_1fr] gap-[10px]">
              <div>
                <FieldLabel required>Badge</FieldLabel>
                <TextInput value={d.badge} onChange={(v) => patchList("agendaDays", i, { badge: v.toUpperCase() })} maxLength={10} />
              </div>
              <div>
                <FieldLabel>Date</FieldLabel>
                <TextInput value={d.date} onChange={(v) => patchList("agendaDays", i, { date: v.toUpperCase() })} placeholder="21 AUG 2026" maxLength={15} />
              </div>
              <div>
                <FieldLabel>Text</FieldLabel>
                <TextInput value={d.text} onChange={(v) => patchList("agendaDays", i, { text: v })} maxLength={90} />
              </div>
            </div>
            <div className="grid grid-cols-[1.4fr_1fr] gap-[10px]">
              <CloudImageField upload={eventHighlightsApi.upload} label="Thumbnail" value={d.image}
                onChange={(v) => patchList("agendaDays", i, { image: v })} hint="Small landscape photo" previewClass="h-[50px] w-[90px]" />
              <div>
                <FieldLabel required={Boolean(d.image)}>Thumbnail Alt Text</FieldLabel>
                <TextInput value={d.imageAlt} onChange={(v) => patchList("agendaDays", i, { imageAlt: v })} placeholder="Describe the photo" maxLength={150} />
              </div>
            </div>
          </div>
        ))}
      </Panel>

      {/* WHO SHOULD ATTEND */}
      <Panel
        title="Who Should Attend?"
        note="Press Enter to split an attendee type over two lines."
        action={<AddButton label="Add Attendee Type" disabled={data.attendees.length >= 12}
          onClick={() => set("attendees", [...data.attendees, { text: "", icon: "users", isActive: true }])} />}
      >
        <div className="w-1/2">
          <FieldLabel>Heading</FieldLabel>
          <TextInput value={data.whoHeading} onChange={(v) => set("whoHeading", v)} maxLength={30} />
        </div>
        {data.attendees.map((a: EhAttendee, i) => {
          const Icon = ICON_BY_NAME[a.icon] ?? Users;
          return (
            <div key={a._id ?? `a-${i}`} className="flex flex-col gap-[8px] rounded-[6px] border border-[#e2e8f0] bg-[#fbfbfa] p-[10px]">
              <div className="flex items-center gap-[10px]">
                <span className="flex items-center gap-[6px] rounded-[4px] bg-[#012b1d] px-[8px] py-[5px]">
                  <Icon className="h-[14px] w-[14px] text-white" />
                  <span className="text-[9px] leading-tight text-gray-300">
                    {(a.text || "Attendee").split("\n").map((line, idx) => <span key={idx} className="block">{line}</span>)}
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <Textarea value={a.text} onChange={(v) => patchList("attendees", i, { text: v })} rows={2} maxLength={45} />
                </div>
                <RowControls isActive={a.isActive} onActive={(v) => patchList("attendees", i, { isActive: v })}
                  onUp={i > 0 ? () => set("attendees", move(data.attendees, i, -1)) : undefined}
                  onDown={i < data.attendees.length - 1 ? () => set("attendees", move(data.attendees, i, 1)) : undefined}
                  onRemove={() => set("attendees", data.attendees.filter((_, idx) => idx !== i))} />
              </div>
              <IconPicker value={a.icon} onChange={(name) => patchList("attendees", i, { icon: name })} />
            </div>
          );
        })}
        <ButtonFields title="View Agenda Button (teal)" value={data.viewAgenda} onChange={(next) => set("viewAgenda", next)}
          swatch={{ bg: "linear-gradient(135deg,#005959,#009999)", color: "#fff" }} />
      </Panel>

      {/* EVENT DETAILS */}
      <Panel title="Event Details" note="Leave a value empty to hide it.">
        <div className="w-1/2">
          <FieldLabel>Heading</FieldLabel>
          <TextInput value={data.detailsHeading} onChange={(v) => set("detailsHeading", v)} maxLength={30} />
        </div>
        <div className="grid grid-cols-2 gap-[10px]">
          {([
            ["datesValue", "Dates", 45],
            ["venueValue", "Venue", 65],
            ["formatValue", "Format", 70],
            ["organizerValue", "Organized By", 65],
          ] as const).map(([key, label, max]) => (
            <div key={key}>
              <FieldLabel>{label}</FieldLabel>
              <TextInput value={data[key]} onChange={(v) => set(key, v.toUpperCase())} maxLength={max} />
            </div>
          ))}
        </div>
        <div>
          <FieldLabel>Google Map Embed Link</FieldLabel>
          <Textarea value={data.mapEmbedUrl} onChange={(v) => set("mapEmbedUrl", v.trim())} rows={3} maxLength={1500} noLimit />
          <p className="mt-[2px] text-[10px] text-[#64748b]">
            Google Maps → Share → Embed a map → copy only the link inside src=&quot;...&quot;. Leave empty to hide the map.
          </p>
        </div>
      </Panel>

      {/* CTA BAND */}
      <Panel title="Registration Band (bottom)">
        <div className="grid grid-cols-[1fr_1.4fr] gap-[10px]">
          <div>
            <FieldLabel>Heading</FieldLabel>
            <Textarea value={data.ctaHeading} onChange={(v) => set("ctaHeading", v.toUpperCase())} rows={2} maxLength={70} />
          </div>
          <div>
            <FieldLabel>Paragraph</FieldLabel>
            <Textarea value={data.ctaParagraph} onChange={(v) => set("ctaParagraph", v)} rows={2} maxLength={140} />
          </div>
        </div>
        <div className="grid grid-cols-[1.4fr_1fr] gap-[10px]">
          <CloudImageField upload={eventHighlightsApi.upload} label="Ticket Icon" value={data.ctaIcon}
            onChange={(v) => set("ctaIcon", v)} hint="Small icon on the left" previewClass="h-[60px] w-[60px]" />
          <div>
            <FieldLabel required={Boolean(data.ctaIcon)}>Icon Alt Text</FieldLabel>
            <TextInput value={data.ctaIconAlt} onChange={(v) => set("ctaIconAlt", v)} placeholder="Registration ticket icon" maxLength={150} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-[8px] xl:grid-cols-3">
          {data.ctaButtons.map((button, i) => (
            <ButtonFields key={i} title={`Button ${i + 1}`} value={button} swatch={CTA_STYLES[i]}
              onChange={(next) => set("ctaButtons", data.ctaButtons.map((b, idx) => (idx === i ? next : b)))} />
          ))}
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
          Save Event Highlights
        </button>
      </div>
    </div>
  );
}
