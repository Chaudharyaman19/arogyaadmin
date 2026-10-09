"use client";

import { useRef, useState } from "react";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import {
  FieldLabel,
  SelectField,
  TextInput,
  Textarea,
  Toggle,
} from "./FormPrimitives";
import { ImageUploadField, VideoUploadField } from "./UploadFields";
import {
  IMAGE_KEY_PATTERN,
  LONG_TEXT_KEY_PATTERN,
  VIDEO_KEY_PATTERN,
  humanizeKey,
} from "./sectionMeta";
import {
  getItemFieldLimit,
  isMultilineItemField,
} from "@/lib/sectionLimits";

/* =========================================================
   GENERIC SECTION ITEMS EDITOR
   Handles the repeatable list every section can have (slides,
   cards, stats, FAQs, links, ...) — add / remove / edit each
   item's own scalar fields generically. `listKey` selects which
   array of the section is being edited (items, slides, tracks,
   days, attendees, features, focusAreas...).
========================================================= */

type ListMeta = { heading: string; add: string; fallback: string };

const LIST_META: Record<string, ListMeta> = {
  "hero:slides": { heading: "Hero Carousel Slides", add: "Add Hero Slide", fallback: "Hero Slide" },
  "trusted-by:items": { heading: "Trusted Groups", add: "Add Trusted Group", fallback: "Group" },
  "why-arogya-tracks:items": { heading: "Why Arogya Benefits", add: "Add Benefit", fallback: "Benefit" },
  "why-arogya-tracks:tracks": { heading: "Conference Tracks", add: "Add Track", fallback: "Track" },
  "about-conference:items": { heading: "Info Badges", add: "Add Badge", fallback: "Badge" },
  "stats-band:items": { heading: "Counter Stats", add: "Add Stat", fallback: "Stat" },
  "vision-mission:items": { heading: "Mission Blocks", add: "Add Mission Block", fallback: "Mission Block" },
  "upcoming-event:items": { heading: "Why Attend Checklist", add: "Add Checklist Item", fallback: "Checklist Item" },
  "event-highlights:items": { heading: "Highlight Cards", add: "Add Highlight", fallback: "Highlight" },
  "event-highlights:days": { heading: "3-Day Agenda", add: "Add Day", fallback: "Day" },
  "event-highlights:attendees": { heading: "Who Should Attend", add: "Add Attendee Type", fallback: "Attendee" },
  "testimonials:items": { heading: "Bottom Band Counters", add: "Add Counter", fallback: "Counter" },
  "global-voices:items": { heading: "Speaker Counters", add: "Add Counter", fallback: "Counter" },
  "global-voices:features": { heading: "Bottom Banner Features", add: "Add Feature", fallback: "Feature" },
  "featured-speakers:items": { heading: "Featured Speaker Cards", add: "Add Speaker", fallback: "Speaker" },
  navbar: { heading: "Header Navigation Links", add: "Add Header Navigation Link", fallback: "Link" },
  footer: { heading: "Footer Quick Links", add: "Add Footer Link / Information", fallback: "Link" },
  "about-hero:items": { heading: "Hero Stats", add: "Add Stat", fallback: "Stat" },
  "about-namo-gange:items": { heading: "Key Highlights", add: "Add Highlight", fallback: "Highlight" },
  "about-initiatives:items": { heading: "Initiative Cards", add: "Add Initiative", fallback: "Initiative" },
  "about-initiatives:focusAreas": { heading: "Key Focus Areas", add: "Add Focus Area", fallback: "Focus Area" },
  "about-faq:items": { heading: "FAQ Entries", add: "Add FAQ", fallback: "FAQ" },
  "our-impact:items": { heading: "Impact Stats", add: "Add Impact Stat", fallback: "Impact Stat" },
};

const ICON_OPTIONS = [
  { label: "None", value: "" },
  { label: "Group of People (Users)", value: "Users" },
  { label: "Store / Exhibitor", value: "Store" },
  { label: "Presentation / Speaker", value: "Presentation" },
  { label: "Building / Company (Building2)", value: "Building2" },
  { label: "Globe / International", value: "Globe" },
  { label: "Leaf / Organic", value: "Leaf" },
  { label: "Graduation Cap / Academic", value: "GraduationCap" },
  { label: "Stethoscope / Healthcare", value: "Stethoscope" },
  { label: "Landmark / Government", value: "Landmark" },
  { label: "Shield Check / Verified", value: "ShieldCheck" },
  { label: "Handshake / Partnership", value: "Handshake" },
  { label: "Heart Hands / Community", value: "HeartHandshake" },
  { label: "Target / Vision", value: "Target" },
  { label: "Trending Up / Growth", value: "TrendingUp" },
  { label: "Award / Achievement", value: "Award" },
  { label: "Medal / Honour", value: "Medal" },
  { label: "Lightbulb / Innovation", value: "Lightbulb" },
  { label: "Mic / Speaker", value: "Mic" },
  { label: "Calendar", value: "Calendar" },
  { label: "Calendar Days", value: "CalendarDays" },
  { label: "Eye / View", value: "Eye" },
  { label: "Sprout / Plant", value: "Sprout" },
  { label: "Heart Pulse / Health", value: "HeartPulse" },
  { label: "Trophy / Winner", value: "Trophy" },
  { label: "Megaphone / Visibility", value: "Megaphone" },
  { label: "User Check / Verified User", value: "UserCheck" },
  { label: "Briefcase / Business", value: "Briefcase" },
  { label: "Sparkles / Magic", value: "Sparkles" },
  { label: "Zap / Fast", value: "Zap" },
  { label: "File Text / Print", value: "FileText" },
  { label: "Heart", value: "Heart" },
  { label: "Star", value: "Star" },
  { label: "Check Circle", value: "CheckCircle" },
  { label: "Info", value: "Info" },
];

const FIELD_ORDER_PRIORITY: Record<string, number> = {
  tagline: 1,
  titlePrimary: 2,
  titleSecondary: 3,
  subtitle: 4,
  title: 5,
  name: 6,
  label: 7,
  description: 8,
  text: 9,
  heading: 10,
  body: 11,
  question: 12,
  answer: 13,
  number: 14,
  value: 15,
  suffix: 16,
  designation: 17,
  badge: 18,
  dateText: 19,
  href: 20,
  image: 21,
  img: 22,
  alt: 23,
  buttonLabel: 24,
  buttonHref: 25,
  secondaryButtonLabel: 26,
  secondaryButtonHref: 27,
  icon: 28,
};

export function SectionItemsEditor({
  items,
  onChangeItem,
  onAddItem,
  onRemoveItem,
  sectionId,
  listKey = "items",
}: {
  items: Array<Record<string, any>>;
  onChangeItem: (index: number, key: string, value: unknown) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  sectionId?: string;
  listKey?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const meta: ListMeta =
    LIST_META[`${sectionId}:${listKey}`] ??
    (sectionId ? LIST_META[sectionId] : undefined) ?? {
      heading: "Section Content Blocks",
      add: "Add New Section Block",
      fallback: "Block",
    };

  const handleToggle = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
      setTimeout(() => {
        itemRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  };

  const getItemLabel = (item: Record<string, any>, index: number) => {
    const mainTitle =
      item.name || item.title || item.label || item.question || item.text || item.tagline;
    if (mainTitle) return String(mainTitle);
    return `${meta.fallback} ${index + 1}`;
  };

  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-[8px]">
        <div className="flex items-center gap-[6px]">
          <span className="text-[11px] font-bold text-[#1e40af]">{meta.heading}</span>
          <span className="rounded-full bg-blue-50 border border-blue-200 px-[7px] py-[1px] text-[8.5px] font-bold text-blue-700">
            {items.length} Total
          </span>
        </div>

        <button
          type="button"
          onClick={onAddItem}
          className="flex h-[24px] items-center gap-[4px] rounded-[4px] border border-blue-200 bg-white px-[8px] text-[9px] font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
        >
          <Plus className="h-[10px] w-[10px]" />
          {meta.add}
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-[10px] font-medium text-[#8b929c]">No items added yet.</p>
      )}

      <div className="space-y-3 pt-1">
        {items.map((item, index) => {
          const fieldEntries = Object.entries(item)
            .filter(
              ([key, value]) =>
                key !== "_id" &&
                key !== "status" &&
                (typeof value === "string" ||
                  typeof value === "number" ||
                  typeof value === "boolean" ||
                  (Array.isArray(value) && value.every((entry) => typeof entry === "string"))),
            )
            .sort(([a], [b]) => (FIELD_ORDER_PRIORITY[a] || 99) - (FIELD_ORDER_PRIORITY[b] || 99));

          const isOpen = openIndex === index;

          return (
            <div
              key={item._id ?? index}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="bg-white border border-[#e2e8f0] rounded-[6px] overflow-hidden shadow-2xs transition"
            >
              <div
                onClick={() => handleToggle(index)}
                className="flex cursor-pointer items-center justify-between bg-[#f8fafc] px-[12px] py-[8px] border-b border-[#f1f5f9] hover:bg-[#f1f5f9] transition"
              >
                <div className="flex items-center gap-[6px]">
                  <ChevronRight className={`h-3.5 w-3.5 text-[#64748b] transition-transform ${isOpen ? "rotate-90 text-[#1e40af]" : ""}`} />
                  <span className="text-[11px] font-bold text-[#1e40af]">
                    {getItemLabel(item, index)}
                    {item.value ? <span className="ml-[6px] font-semibold text-[#1e293b]">({item.value})</span> : ""}
                  </span>
                </div>

                <div className="flex items-center gap-[8px]" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(index)}
                    className="flex items-center gap-[3px] text-[9.5px] font-semibold text-[#dc2626] hover:underline"
                  >
                    <Trash2 className="h-[11px] w-[11px]" />
                    Remove
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="p-[12px] grid grid-cols-2 gap-[10px] bg-white">
                  {fieldEntries.map(([key, value]) => {
                    const isImageKey = IMAGE_KEY_PATTERN.test(key);
                    const isVideoKey = VIDEO_KEY_PATTERN.test(key);
                    const isMultiline = isMultilineItemField(sectionId, key);
                    const isLong = isMultiline || LONG_TEXT_KEY_PATTERN.test(key);
                    const fieldLimit = getItemFieldLimit(sectionId, key, isLong);

                    return (
                      <div key={key} className={isImageKey || isVideoKey || isLong ? "col-span-2" : ""}>
                        <FieldLabel>{humanizeKey(key)}</FieldLabel>

                        {key === "icon" ? (
                          <SelectField
                            value={String(value)}
                            options={ICON_OPTIONS}
                            onChange={(next) => onChangeItem(index, key, next)}
                          />
                        ) : isVideoKey ? (
                          <VideoUploadField
                            value={String(value)}
                            onChange={(next) => onChangeItem(index, key, next)}
                          />
                        ) : isImageKey ? (
                          <ImageUploadField
                            value={String(value)}
                            onChange={(next) => onChangeItem(index, key, next)}
                          />
                        ) : Array.isArray(value) ? (
                          <TextInput
                            value={value.join(", ")}
                            onChange={(next) =>
                              onChangeItem(
                                index,
                                key,
                                next.split(",").map((entry) => entry.trim()).filter(Boolean),
                              )
                            }
                            placeholder="comma, separated, values"
                          />
                        ) : key === "color" ? (
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <TextInput
                                value={String(value)}
                                onChange={(next) => onChangeItem(index, key, next)}
                                placeholder="e.g. #facc15 or text-orange-500"
                              />
                            </div>
                            <input
                              type="color"
                              value={
                                String(value).startsWith("#") && String(value).length === 7
                                  ? String(value)
                                  : "#facc15"
                              }
                              onChange={(e) => onChangeItem(index, key, e.target.value)}
                              className="h-[34px] w-[38px] cursor-pointer rounded border border-[#cbd5e1] p-0.5 bg-white shrink-0"
                              title="Pick a color"
                            />
                          </div>
                        ) : typeof value === "boolean" ? (
                          <Toggle checked={value} onChange={(next) => onChangeItem(index, key, next)} />
                        ) : isLong ? (
                          <Textarea
                            value={String(value)}
                            onChange={(next) => onChangeItem(index, key, next)}
                            rows={3}
                            maxLength={fieldLimit}
                          />
                        ) : (
                          <TextInput
                            value={String(value)}
                            onChange={(next) => onChangeItem(index, key, next)}
                            maxLength={fieldLimit}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
