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

/* =========================================================
   GENERIC SECTION ITEMS EDITOR
   Handles the repeatable "items" list every section can have (stat
   cards, FAQ entries, links, ...) — add / remove / edit each item's
   own scalar fields generically.
========================================================= */

export function SectionItemsEditor({
  items,
  onChangeItem,
  onAddItem,
  onRemoveItem,
  sectionId,
}: {
  items: Array<Record<string, any>>;
  onChangeItem: (index: number, key: string, value: unknown) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  sectionId?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  const FIELD_ORDER_PRIORITY: Record<string, number> = {
    tagline: 1,
    titlePrimary: 2,
    titleSecondary: 3,
    subtitle: 4,
    title: 5,
    name: 6,
    label: 7,
    description: 8,
    date: 9,
    location: 10,
    image: 11,
    img: 12,
    alt: 13,
    buttonLabel: 14,
    buttonHref: 15,
    secondaryButtonLabel: 16,
    secondaryButtonHref: 17,
    icon: 18,
  };

  const getSectionAddLabel = () => {
    if (sectionId === "hero") return "Add Hero Slide";
    if (sectionId === "audience-strip") return "Add Target Audience Group";
    if (sectionId === "introduction-section") return "Add Feature Highlight";
    if (sectionId === "global-platform") return "Add Platform Metric / Highlight";
    if (sectionId === "why-participate") return "Add Exhibitor Benefit";
    if (sectionId === "conference-section") return "Add Seminar / Workshop Session";
    if (sectionId === "expo-categories") return "Add Exhibition Category Sector";
    if (sectionId === "beyond-exhibition") return "Add Excellence Award Category";
    if (sectionId === "sponsorship-categories") return "Add Sponsorship Package Tier";
    if (sectionId === "buyer-seller-meet") return "Add B2B Matchmaking Feature";
    if (sectionId === "testimonials-carousel") return "Add Review / Testimonial";
    if (sectionId === "navbar") return "Add Header Navigation Link";
    if (sectionId === "footer") return "Add Footer Link / Information";
    return "Add New Section Block";
  };

  const getItemLabel = (item: Record<string, any>, index: number) => {
    const mainTitle = item.name || item.title || item.label || item.question || item.tagline || item.companyName1;
    if (mainTitle) return String(mainTitle);
    if (sectionId === "hero") return `Hero Slide ${index + 1}`;
    if (sectionId === "audience-strip") return `Audience Group ${index + 1}`;
    if (sectionId === "conference-section") return `Session ${index + 1}`;
    if (sectionId === "expo-categories") return `Sector ${index + 1}`;
    if (sectionId === "beyond-exhibition") return `Award Category ${index + 1}`;
    if (sectionId === "sponsorship-categories") return `Sponsorship Tier ${index + 1}`;
    if (sectionId === "testimonials-carousel") return `Review ${index + 1}`;
    if (sectionId === "navbar" || sectionId === "footer") return `Link ${index + 1}`;
    return `Block ${index + 1}`;
  };

  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-[8px]">
        <div className="flex items-center gap-[6px]">
          <span className="text-[11px] font-bold text-[#1e40af]">
            {sectionId === "hero" ? "Hero Carousel Slides" :
              sectionId === "audience-strip" ? "Target Audience List" :
                sectionId === "introduction-section" ? "Key Feature Cards" :
                  sectionId === "global-platform" ? "Platform Highlights & Deals" :
                    sectionId === "why-participate" ? "Exhibitor Benefits List" :
                      sectionId === "conference-section" ? "Seminar & Workshop Sessions" :
                        sectionId === "expo-categories" ? "Exhibition Category Cards" :
                          sectionId === "beyond-exhibition" ? "Event Highlights & Awards" :
                            sectionId === "sponsorship-categories" ? "Sponsorship Packages & Tiers" :
                              sectionId === "buyer-seller-meet" ? "Matchmaking Process Steps" :
                                sectionId === "testimonials-carousel" ? "Exhibitor & Visitor Reviews" :
                                  sectionId === "navbar" ? "Header Navigation Links" :
                                    sectionId === "footer" ? "Footer Quick Links" : "Section Content Blocks"}
          </span>
          <span className="rounded-full bg-blue-50 border border-blue-200 px-[7px] py-[1px] text-[8.5px] font-bold text-blue-700">
            {items.length} Total
          </span>
        </div>

        {sectionId !== "audience-strip" && sectionId !== "beyond-exhibition" && (
          <button
            type="button"
            onClick={onAddItem}
            className="flex h-[24px] items-center gap-[4px] rounded-[4px] border border-blue-200 bg-white px-[8px] text-[9px] font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
          >
            <Plus className="h-[10px] w-[10px]" />
            {getSectionAddLabel()}
          </button>
        )}
      </div>

      {items.length === 0 && (
        <p className="text-[10px] font-medium text-[#8b929c]">No items added yet.</p>
      )}

      <div className="space-y-3 pt-1">
        {items.map((item, index) => {
          let itemToEdit = { ...item };
          if (sectionId === "expo-categories") {
            delete itemToEdit.icon;
            delete itemToEdit.desc;
            delete itemToEdit.color;
            delete itemToEdit.imageAlt;
            if (itemToEdit.description === undefined) itemToEdit.description = item.desc || "";
            if (itemToEdit.image === undefined) itemToEdit.image = "";
            if (!itemToEdit.exploreText) itemToEdit.exploreText = "Explore";
            if (!itemToEdit.href) itemToEdit.href = item.link || "/exhibition-categories";
          } else if (sectionId === "beyond-exhibition") {
            delete itemToEdit.subtitle;
            delete itemToEdit.title2;
            delete itemToEdit.color;
            delete itemToEdit.image;
            delete itemToEdit.imageAlt;
            if (itemToEdit.description === undefined) itemToEdit.description = item.subtitle || "";
            if (!itemToEdit.icon) itemToEdit.icon = "Users";
          } else {
            let defaultIcon = "";
            if (!item.icon) {
              const text = (item.title || "") + " " + (item.label || "");
              const textUpper = text.toUpperCase();
              if (textUpper.includes("HELPLINE")) defaultIcon = "users";
              else if (textUpper.includes("REGION")) defaultIcon = "building";
              else if (textUpper.includes("VOLUNTEER")) defaultIcon = "heart-hands";
              else if (textUpper.includes("SUPPORT")) defaultIcon = "heart-hands";
              else if (text.toUpperCase().includes("GIVE")) defaultIcon = "give-icon";
              else if (text.toUpperCase().includes("SERVE")) defaultIcon = "serve-icon";
              else if (text.toUpperCase().includes("PARTNER")) defaultIcon = "partner-icon";
            }
            itemToEdit = ("label" in item || "title" in item) && (!("icon" in item) || item.icon === "")
              ? { ...item, icon: defaultIcon }
              : item;
          }

          const fieldEntries = Object.entries(itemToEdit)
            .filter(
              ([key, value]) =>
                key !== "_id" &&
                key !== "img" &&
                key !== "status" &&
                !(sectionId === "expo-categories" && key === "icon") &&
                (typeof value === "string" ||
                  typeof value === "number" ||
                  typeof value === "boolean" ||
                  (Array.isArray(value) && value.every((entry) => typeof entry === "string")))
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
                    const isLong = LONG_TEXT_KEY_PATTERN.test(key);

                    return (
                      <div key={key} className={isImageKey || isVideoKey || isLong ? "col-span-2" : ""}>
                        <FieldLabel>{humanizeKey(key)}</FieldLabel>

                        {key === "icon" && sectionId !== "journey-glimpse" ? (
                          <SelectField
                            value={String(value)}
                            options={[
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
                              { label: "Target / Vision", value: "Target" },
                              { label: "Trending Up / Growth", value: "TrendingUp" },
                              { label: "Award / Achievement", value: "Award" },
                              { label: "Medal / Honour", value: "Medal" },
                              { label: "Lightbulb / Innovation", value: "Lightbulb" },
                              { label: "Mic / Speaker", value: "Mic" },
                              { label: "Calendar / Dates", value: "CalendarDays" },
                              { label: "Eye / View", value: "Eye" },
                              { label: "Sprout / Plant", value: "Sprout" },
                              { label: "Heart Pulse / Health", value: "HeartPulse" },
                              { label: "Trophy / Winner", value: "Trophy" },
                              { label: "Megaphone / Visibility", value: "Megaphone" },
                              { label: "User Check / Verified User", value: "UserCheck" },
                              { label: "Briefcase / Business", value: "Briefcase" },
                              { label: "Sparkles / Magic", value: "Sparkles" },
                              { label: "Zap / Fast", value: "Zap" },
                              { label: "ID Card / Lanyard", value: "IdCard" },
                              { label: "Plug / Charging", value: "Plug" },
                              { label: "Contact / Badge", value: "Contact" },
                              { label: "Wi-Fi / Internet", value: "Wifi" },
                              { label: "Shopping Bag / Visitor Bag", value: "ShoppingBag" },
                              { label: "Coffee / Refreshment", value: "Coffee" },
                              { label: "Newspaper / Press", value: "Newspaper" },
                              { label: "File Text / Print", value: "FileText" },
                              { label: "Camera / Media", value: "Camera" },
                              { label: "Headphones / Support", value: "Headphones" },
                              { label: "Message Circle / Chat", value: "MessageCircle" },
                              { label: "Clock / Time", value: "Clock" },
                              { label: "Phone", value: "Phone" },
                              { label: "Mail", value: "Mail" },
                              { label: "Map Pin", value: "MapPin" },
                              { label: "Heart", value: "Heart" },
                              { label: "Star", value: "Star" },
                              { label: "Check Circle", value: "CheckCircle" },
                              { label: "Info", value: "Info" },
                            ]}
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
                          <Textarea value={String(value)} onChange={(next) => onChangeItem(index, key, next)} rows={3} />
                        ) : (
                          <TextInput value={String(value)} onChange={(next) => onChangeItem(index, key, next)} />
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
