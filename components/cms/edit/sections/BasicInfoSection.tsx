"use client";

/* =========================================================
   BASIC INFORMATION
   Extracted from pages/[id]/edit/page.tsx
========================================================= */

import {
  FieldLabel,
  SectionTitle,
  SelectField,
  TextInput,
} from "@/components/cms/editor/FormPrimitives";
import { getDefaultSectionsForTemplateName } from "@/components/cms/edit/sectionDefaults";
import { getCmsPageRouteKey, PUBLIC_SITE_URL } from "@/lib/cmsPages";
import type { Status, Visibility } from "../types";
import { useCmsEdit } from "../CmsEditContext";

/* "Select Template" lists every Pages & CMS page (value = its config key); this one only clears the sections */
const BLANK_TEMPLATE = "__blank";

export function BasicInfoSection() {
  const { form, page, pages, router, setSectionsDraft, updateField } = useCmsEdit();

  return (
    <>
    {/* =================================================
        BASIC INFORMATION
    ================================================= */}

    <section
      className="
        shrink-0
        border
        border-[#dedfdb]
        shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
        bg-white
        px-[16px]
        py-[11px]
      "
    >
      <SectionTitle
        number={1}
        title="Basic Information"
      />

      <div
        className="
          mt-[9px]
          grid
          grid-cols-[1.12fr_1fr_.63fr]
          gap-x-[20px]
          gap-y-[7px]
        "
      >
        <div>
          <FieldLabel required>
            Page Title
          </FieldLabel>

          <TextInput
            value={
              form.pageTitle
            }
            onChange={(
              value,
            ) =>
              updateField(
                "pageTitle",
                value,
              )
            }
          />

          <p className="mt-[2px] text-right text-[9px] font-medium text-[#218DAE]">
            {
              form
                .pageTitle
                .length
            }{" "}
            / 100
          </p>
        </div>

        <div>
          <FieldLabel required>
            URL Slug
          </FieldLabel>

          <div
            className="
              flex
              h-[35px]
              overflow-hidden
              rounded-none
              shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(27,31,35,0.15)]
              bg-white
            "
          >
            <div
              className="
                flex
                shrink-0
                items-center
                border-r
                border-[#e5e6e2]
                bg-[#fafaf8]
                px-[9px]
                text-[9.5px]
                font-medium
                text-[#5f6a7c]
              "
            >
              {PUBLIC_SITE_URL}/
            </div>

            <input
              value={
                form.slug
              }
              onChange={(
                event,
              ) =>
                updateField(
                  "slug",
                  event
                    .target
                    .value,
                )
              }
              placeholder="enter-page-slug"
              className="
                min-w-0
                flex-1
                cursor-default
                px-[9px]
                text-[10.5px]
                font-medium
                text-[#414b5e]
                outline-none
                placeholder:text-[#9aa0aa]
              "
            />
          </div>

          <p className="mt-[2px] text-right text-[9px] font-medium text-[#218DAE]">
            {
              form.slug
                .length
            }{" "}
            / 80
          </p>
        </div>

        <div>
          <FieldLabel>
            Select Template
          </FieldLabel>

          <SelectField
            value={page.configKey ?? ""}
            onChange={(value) => {
              if (value === BLANK_TEMPLATE) {
                updateField("template", "Blank Template");
                const sections = getDefaultSectionsForTemplateName("Blank Template");
                if (sections) setSectionsDraft(sections.map((s) => ({ ...s })));
                return;
              }
              // Every option is a website page — open it, so its own sections and SEO load (the URL changes too)
              const target = pages.find((p) => p.configKey === value);
              if (target && target.configKey !== page.configKey) {
                router.push(`/pages/${getCmsPageRouteKey(target)}/edit`);
              }
            }}
            options={[
              ...pages.map((p) => ({ label: `${p.title} (${p.slug})`, value: p.configKey ?? "" })),
              { label: "Blank Template (clear the sections)", value: BLANK_TEMPLATE },
            ]}
          />
          <p className="mt-[3px] text-[9px] font-medium text-[#64748b]">
            Pick a page to open it with its own sections and SEO Information.
          </p>
        </div>

        <div>
          <FieldLabel>
            Page Parent
          </FieldLabel>

          <SelectField
            value={
              form.parent
            }
            onChange={(value) => {
              updateField("parent", value);
              if (value && value !== "— No Parent (Top Level) —") {
                const sections = getDefaultSectionsForTemplateName(value);
                if (sections) setSectionsDraft(sections.map((s) => ({ ...s })));
              }
            }}
            options={[
              "— No Parent (Top Level) —",
              ...pages.map((p) => p.title),
            ]}
          />

          <p className="mt-[2px] text-[9px] font-medium leading-[11px] text-red-500">
            Choose parent page
            (if any)
          </p>
        </div>

      </div>
    </section>
    </>
  );
}
