"use client";

import {
  FieldLabel,
  TextInput,
  Textarea,
  Toggle,
} from "./FormPrimitives";
import { ImageUploadField, PdfUploadField, VideoUploadField } from "./UploadFields";
import {
  IMAGE_KEY_PATTERN,
  LONG_TEXT_KEY_PATTERN,
  SECTION_SKIP_KEYS,
  VIDEO_KEY_PATTERN,
  humanizeKey,
} from "./sectionMeta";
import {
  getFieldLimit,
  isMultilineField,
} from "@/lib/sectionLimits";

/* =========================================================
   GENERIC SECTION FIELDS EDITOR
   Renders an input for every scalar field a section has, so any
   section shape becomes editable without a bespoke form per
   section. Character limits come from lib/sectionLimits.ts and
   match what the Arogya website UI can display.
========================================================= */

const DATE_FIELD_KEYS = new Set(["eventDate", "targetDate"]);
const NON_VIDEO_KEYS = new Set(["mapEmbedUrl"]);

export function SectionFieldsEditor({
  section,
  onFieldChange,
}: {
  section: Record<string, any>;
  onFieldChange: (key: string, value: unknown) => void;
}) {
  if (section.key === "footer" || section.name === "Footer & Social Links") {
    return <FooterFieldsEditor section={section} onFieldChange={onFieldChange} />;
  }

  const entries = Object.entries(section).filter(
    ([key, value]) => {
      if (SECTION_SKIP_KEYS.has(key)) return false;
      return typeof value === "string" || typeof value === "boolean";
    },
  );

  if (!entries.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-x-[16px] gap-y-[10px]">
      {entries.map(([key, value]) => {
        const isMultiline = isMultilineField(section.key, key);
        const isLong = isMultiline || LONG_TEXT_KEY_PATTERN.test(key);
        const isImage = IMAGE_KEY_PATTERN.test(key) && !/alt/i.test(key);
        const isVideo = VIDEO_KEY_PATTERN.test(key) && !NON_VIDEO_KEYS.has(key);
        const isPdf =
          /brochure|pdf/i.test(key) ||
          (typeof value === "string" && /\.pdf$/i.test(value));
        const isDate = DATE_FIELD_KEYS.has(key) && typeof value === "string";
        const fieldLimit = getFieldLimit(section.key, key, isLong);

        return (
          <div
            key={key}
            className={isLong || isImage || isVideo || isPdf || typeof value === "boolean" || /^keyPoint/i.test(key) || /alt/i.test(key) ? "col-span-2" : ""}
          >
            <FieldLabel>{humanizeKey(key)}</FieldLabel>

            {typeof value === "boolean" ? (
              <Toggle checked={value} onChange={(next: boolean) => onFieldChange(key, next)} />
            ) : isVideo ? (
              <VideoUploadField
                value={String(value)}
                onChange={(next: string) => onFieldChange(key, next)}
              />
            ) : isImage ? (
              <ImageUploadField
                value={String(value)}
                onChange={(next: string) => onFieldChange(key, next)}
              />
            ) : isPdf ? (
              <PdfUploadField
                value={String(value)}
                onChange={(next: string) => onFieldChange(key, next)}
              />
            ) : isDate ? (
              <div className="flex items-center gap-2">
                <input
                  type="datetime-local"
                  value={
                    String(value).includes("T")
                      ? String(value).slice(0, 16)
                      : String(value)
                  }
                  onChange={(e) => onFieldChange(key, e.target.value)}
                  className="h-[34px] rounded border border-[#cbd5e1] px-2.5 text-[12px] bg-white text-[#1e293b] focus:border-[#0f766e] focus:outline-none"
                />
                <span className="text-[10px] text-[#64748b]">Select date and time for live countdown timer</span>
              </div>
            ) : isLong ? (
              <Textarea
                value={String(value)}
                onChange={(next: string) => onFieldChange(key, next)}
                rows={3}
                maxLength={fieldLimit}
              />
            ) : (
              <TextInput
                value={String(value)}
                onChange={(next: string) => onFieldChange(key, next)}
                maxLength={fieldLimit}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   FOOTER — bespoke form (images, contact info, socials)
========================================================= */
function FooterFieldsEditor({
  section,
  onFieldChange,
}: {
  section: Record<string, any>;
  onFieldChange: (key: string, value: unknown) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Description (About text in Footer Left Column) */}
      <div className="flex flex-col gap-1.5 bg-white p-3 border border-[#e2e8f0] rounded-[6px]">
        <FieldLabel required>Footer Description</FieldLabel>
        <Textarea
          value={String(section.description || "")}
          onChange={(next) => onFieldChange("description", next)}
          rows={4}
          maxLength={450}
          placeholder="Arogya Expo - A global platform uniting traditional wellness, Ayurveda, Yoga..."
        />
      </div>

      {/* 5 Image Uploads with Previews & Reset */}
      <div className="bg-white p-3 border border-[#e2e8f0] rounded-[6px] flex flex-col gap-3">
        <div className="text-[11px] font-bold text-[#1e40af] border-b border-gray-100 pb-1.5 flex items-center gap-2">
          <span>Footer Images & Decorations</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <FieldLabel>Main Logo Image</FieldLabel>
            <ImageUploadField
              value={String(section.logoImage || "")}
              onChange={(next) => onFieldChange("logoImage", next)}
            />
          </div>
          <div>
            <FieldLabel>Left Leaf Decoration Image</FieldLabel>
            <ImageUploadField
              value={String(section.leafImage || "")}
              onChange={(next) => onFieldChange("leafImage", next)}
            />
          </div>
          <div>
            <FieldLabel>Down / Mandala Pattern Image</FieldLabel>
            <ImageUploadField
              value={String(section.downImage || "")}
              onChange={(next) => onFieldChange("downImage", next)}
            />
          </div>
          <div>
            <FieldLabel>Organised By Logo Image</FieldLabel>
            <ImageUploadField
              value={String(section.organisedByLogo || "")}
              onChange={(next) => onFieldChange("organisedByLogo", next)}
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Bottom Nature / Event Banner Image</FieldLabel>
            <ImageUploadField
              value={String(section.bottomBannerImage || "")}
              onChange={(next) => onFieldChange("bottomBannerImage", next)}
            />
          </div>
        </div>
      </div>

      {/* Contact Information (GET IN TOUCH) */}
      <div className="bg-white p-3 border border-[#e2e8f0] rounded-[6px] flex flex-col gap-3">
        <div className="text-[11px] font-bold text-[#1e40af] border-b border-gray-100 pb-1.5 flex items-center gap-2">
          <span>Get In Touch (Contact Information)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <FieldLabel required>Phone Number</FieldLabel>
            <TextInput
              value={String(section.phoneNumber || "")}
              onChange={(next) => onFieldChange("phoneNumber", next)}
              placeholder="+91 96549 00525"
              hideLimit={true}
            />
          </div>
          <div>
            <FieldLabel required>Contact Email</FieldLabel>
            <TextInput
              value={String(section.contactEmail || "")}
              onChange={(next) => onFieldChange("contactEmail", next)}
              placeholder="info@namogangewellness.com"
              hideLimit={true}
            />
          </div>
          <div>
            <FieldLabel required>Website URL</FieldLabel>
            <TextInput
              value={String(section.websiteUrl || "")}
              onChange={(next) => onFieldChange("websiteUrl", next)}
              placeholder="www.arogyabharat.org"
              hideLimit={true}
            />
          </div>
          <div>
            <FieldLabel>Conference Helpline (Phone)</FieldLabel>
            <TextInput
              value={String(section.conferenceHelpline || section.altPhoneNumber || "")}
              onChange={(next) => {
                onFieldChange("conferenceHelpline", next);
                onFieldChange("altPhoneNumber", next);
              }}
              placeholder="+91 98183 53841"
              hideLimit={true}
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel required>Contact Address</FieldLabel>
            <TextInput
              value={String(section.contactAddress || "")}
              onChange={(next) => onFieldChange("contactAddress", next)}
              placeholder="Hall 12, Pragati Maidan, New Delhi, India 110001"
              hideLimit={true}
            />
          </div>
        </div>
      </div>

      {/* CONNECT WITH US (Social Media Links) */}
      <div className="bg-white p-3 border border-[#e2e8f0] rounded-[6px] flex flex-col gap-3">
        <div className="text-[11px] font-bold text-[#1e40af] border-b border-gray-100 pb-1.5 flex items-center gap-2">
          <span>Connect With Us (Social Media Links)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <FieldLabel>Facebook URL</FieldLabel>
            <TextInput
              value={String(section.facebookUrl || "")}
              onChange={(next) => onFieldChange("facebookUrl", next)}
              placeholder="https://facebook.com/arogyabharat"
              hideLimit={true}
            />
          </div>
          <div>
            <FieldLabel>Instagram URL</FieldLabel>
            <TextInput
              value={String(section.instagramUrl || "")}
              onChange={(next) => onFieldChange("instagramUrl", next)}
              placeholder="https://instagram.com/arogyabharat"
              hideLimit={true}
            />
          </div>
          <div>
            <FieldLabel>Twitter / X URL</FieldLabel>
            <TextInput
              value={String(section.twitterUrl || "")}
              onChange={(next) => onFieldChange("twitterUrl", next)}
              placeholder="https://twitter.com/bharatorganic"
              hideLimit={true}
            />
          </div>
          <div>
            <FieldLabel>YouTube URL</FieldLabel>
            <TextInput
              value={String(section.youtubeUrl || "")}
              onChange={(next) => onFieldChange("youtubeUrl", next)}
              placeholder="https://youtube.com/@arogyabharat"
              hideLimit={true}
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>LinkedIn URL</FieldLabel>
            <TextInput
              value={String(section.linkedinUrl || "")}
              onChange={(next) => onFieldChange("linkedinUrl", next)}
              placeholder="https://linkedin.com/company/arogyabharat"
              hideLimit={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
