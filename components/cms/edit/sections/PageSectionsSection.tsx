"use client";

/* =========================================================
   PAGE SECTIONS
   Extracted from pages/[id]/edit/page.tsx
   Renders one collapsible card per section; each card shows its
   scalar fields plus an editor per repeatable list it owns
   (items, slides, tracks, days, attendees, features, focusAreas).
========================================================= */

import {
  ChevronRight,
} from "lucide-react";
import {
  SectionTitle,
  Toggle,
} from "@/components/cms/editor/FormPrimitives";
import { SectionFieldsEditor } from "@/components/cms/editor/SectionFieldsEditor";
import { SectionItemsEditor } from "@/components/cms/editor/SectionItemsEditor";
import { useCmsEdit } from "../CmsEditContext";

/* Sections that own more than one repeatable list. */
const SECTION_LIST_KEYS: Record<string, string[]> = {
  hero: ["slides"],
  "why-arogya-tracks": ["items", "tracks"],
  "event-highlights": ["items", "days", "attendees"],
  "global-voices": ["items", "features"],
  "about-initiatives": ["items", "focusAreas"],
  "paper-important-dates": ["items", "reasons"],
  "paper-guidelines": ["items", "steps"],
};

function getListKeys(section: Record<string, any>): string[] {
  const explicit = SECTION_LIST_KEYS[section.key];
  if (explicit) return explicit;
  return ["items", "slides"].filter((key) => Array.isArray(section[key]));
}

export function PageSectionsSection() {
  const { addSectionItem, openSectionIndices, removeSectionItem, resetToWebsiteDefaults, sectionsDraft, setOpenSectionIndices, toggleSectionAccordion, updateSectionField, updateSectionItem } = useCmsEdit();

  return (
    <section
      className="
        flex
        shrink-0
        flex-col
        shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
        bg-white
        px-[16px]
        py-[9px]
      "
    >
      <div
        className="
          flex
          shrink-0
          items-start
          justify-between
        "
      >
        <SectionTitle
          number={2}
          title="Page Sections"
        />

        <span className="text-[9.5px] font-semibold text-[#4B1426]">
          {sectionsDraft.length} sections
        </span>
      </div>

      {/* EXPAND / COLLAPSE GLOBAL ACTIONS */}
      <div className="mt-[10px] flex items-center justify-between border-b border-[#f1f5f9] pb-[8px] mb-[12px]">
        <span className="text-[10.5px] font-bold text-[#1e293b]">
          Page Landing Sections ({sectionsDraft.length})
        </span>
        <div className="flex items-center gap-[6px]">
          <button
            type="button"
            onClick={() => setOpenSectionIndices(new Set(sectionsDraft.map((_, i) => i)))}
            className="text-[9.5px] font-semibold text-[#4B1426] hover:underline"
          >
            Expand All
          </button>
          <span className="text-[#cbd5e1]">|</span>
          <button
            type="button"
            onClick={() => setOpenSectionIndices(new Set())}
            className="text-[9.5px] font-semibold text-[#64748b] hover:underline"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* INDIVIDUAL COLLAPSIBLE SECTION CARDS */}
      {sectionsDraft.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-center my-3">
          <p className="text-[12px] font-semibold text-amber-800 mb-2">No sections currently loaded for this page.</p>
          <button
            type="button"
            onClick={resetToWebsiteDefaults}
            className="px-4 py-1.5 bg-[#4B1426] text-white text-[11px] font-bold rounded hover:bg-[#380e1c] transition-colors shadow-sm"
          >
            Load Live Website Defaults
          </button>
        </div>
      )}
      <div className="flex flex-col gap-[10px]">
        {sectionsDraft.map((section, sectionIndex) => {
          const isOpen = openSectionIndices.has(sectionIndex);

          return (
            <div
              key={section._id ?? section.key ?? sectionIndex}
              className={`rounded-[6px] border transition ${isOpen ? "border-[#4B1426] bg-[#fbfbfa]" : "border-[#cbd5e1] bg-white hover:border-[#94a3b8]"
                }`}
            >
              {/* SECTION CARD HEADER */}
              <div
                onClick={() => toggleSectionAccordion(sectionIndex)}
                className={`flex cursor-pointer items-center justify-between px-[14px] py-[10px] transition ${isOpen ? "bg-[#fdf2f4] border-b border-[#f5d0d6]" : "bg-[#f8fafc]"
                  }`}
              >
                <div className="flex items-center gap-[8px]">
                  <ChevronRight
                    className={`h-4 w-4 text-[#4B1426] transition-transform ${isOpen ? "rotate-90 text-[#3b0f1e]" : ""
                      }`}
                  />
                  <span className="font-mono text-[10px] font-bold text-[#64748b]">
                    {sectionIndex + 1}.
                  </span>
                  <span className="text-[12px] font-bold text-[#4B1426]">
                    {section.name ?? section.key}
                  </span>
                  {section.enabled === false && (
                    <span className="rounded-[4px] bg-rose-50 border border-rose-200 px-[6px] py-[1px] text-[8px] font-bold text-rose-600">
                      Disabled
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-[10px]" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-[6px]">
                    <span
                      className={`text-[9.5px] font-bold ${section.enabled !== false ? "text-[#16a34a]" : "text-[#dc2626]"
                        }`}
                    >
                      {section.enabled !== false ? "Enabled" : "Disabled"}
                    </span>
                    <Toggle
                      checked={section.enabled !== false}
                      onChange={(value) => updateSectionField(sectionIndex, "enabled", value)}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION BODY (ONLY RENDERED WHEN OPEN) */}
              {isOpen && (
                <div className="flex flex-col gap-[12px] p-[14px] bg-[#fbfbfa]">
                  <SectionFieldsEditor
                    section={section}
                    onFieldChange={(key, value) => updateSectionField(sectionIndex, key, value)}
                  />

                  {getListKeys(section).map((listKey) =>
                    Array.isArray(section[listKey]) ? (
                      <SectionItemsEditor
                        key={listKey}
                        items={section[listKey]}
                        listKey={listKey}
                        sectionId={section.key}
                        onChangeItem={(itemIndex, key, value) =>
                          updateSectionItem(sectionIndex, itemIndex, key, value, listKey)
                        }
                        onAddItem={() => addSectionItem(sectionIndex, listKey)}
                        onRemoveItem={(itemIndex) => removeSectionItem(sectionIndex, itemIndex, listKey)}
                      />
                    ) : null,
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
