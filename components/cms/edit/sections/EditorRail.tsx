"use client";

/* =========================================================
   RIGHT RAIL (PUBLISH / SEO / QUICK ACTIONS)
   Extracted from pages/[id]/edit/page.tsx
========================================================= */

import Link from "next/link";
import { lazySwal } from "@/lib/toast";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Copy,
  Edit,
  ExternalLink,
  Link2,
  Trash2,
  UserRound,
} from "lucide-react";
import { PUBLIC_SITE_URL, getCmsPageRouteKey } from "@/lib/cmsPages";
import type { Status, Visibility } from "../types";
import { SeoRow, SeoScoreCircle } from "@/components/cms/editor/SeoFields";
import { useCmsEdit } from "../CmsEditContext";

export function EditorRail() {
  const { form, page, pages, router, updateField } = useCmsEdit();

  return (
    <>
    {/* =================================================
        RIGHT COLUMN
    ================================================= */}

    <div
      className="
        flex
        flex-col
        gap-[8px]
      "
    >
      {/* =================================================
          PUBLISH
      ================================================= */}

      <section
        className="
          shrink-0
          rounded-none
          border
          border-[#e7e7e3]
          bg-white
          overflow-hidden
        "
      >
        <div className="flex items-center justify-between bg-slate-50 border-b border-[#e7e7e3] px-[16px] py-[9px]">
          <h2 className="text-[14px] font-bold text-[#263148]">
            Publish
          </h2>

          <ChevronDown className="h-[13px] w-[13px] rotate-180 text-[#596579]" />
        </div>

        <div className="px-[16px] pt-[11px] pb-[16px] space-y-[6px]">
          <div className="grid grid-cols-[105px_1fr] items-center gap-[10px]">
            <p className="text-[10.5px] font-semibold text-[#5d6677]">
              Status
            </p>

            <select
              value={form.status}
              onChange={(e) => {
                const value = e.target.value as Status;
                updateField("status", value);
                lazySwal.fire({
                  title: "Status Updated",
                  text: `Page status changed to ${value}`,
                  icon: "success",
                  confirmButtonColor: "#218DAE",
                  timer: 1500,
                  showConfirmButton: false,
                });
              }}
              className={`h-[26px] cursor-pointer appearance-none rounded-[4px] px-[8px] pr-[22px] text-[10px] font-bold outline-none bg-no-repeat bg-[right_6px_center] ${form.status === "Published"
                ? "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]"
                : "bg-[#ffebee] text-[#c62828] border border-[#ef9a9a]"
                }`}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
            >
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div className="grid grid-cols-[105px_1fr] items-center gap-[10px]">
            <p className="text-[10.5px] font-semibold text-[#5d6677]">
              Visibility
            </p>

            <select
              value={form.visibility}
              onChange={(e) => {
                const value = e.target.value as Visibility;
                updateField("visibility", value);
                lazySwal.fire({
                  title: "Visibility Updated",
                  text: `Page visibility changed to ${value}`,
                  icon: "success",
                  confirmButtonColor: "#218DAE",
                  timer: 1500,
                  showConfirmButton: false,
                });
              }}
              className={`h-[26px] cursor-pointer appearance-none rounded-[4px] px-[8px] pr-[22px] text-[10px] font-bold outline-none bg-no-repeat bg-[right_6px_center] ${form.visibility === "Public"
                ? "bg-[#e3f2fd] text-[#1565c0] border border-[#90caf9]"
                : "bg-[#f3e5f5] text-[#7b1fa2] border border-[#ce93d8]"
                }`}
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
            >
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>

          <div className="grid min-h-[24px] grid-cols-[105px_1fr] items-center gap-[10px]">
            <p className="text-[10.5px] font-semibold text-[#5d6677]">
              Published On
            </p>

            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-[7px] whitespace-nowrap text-[10px] font-medium text-[#293681]">
                <CalendarDays className="h-[12px] w-[12px]" />

                20 May 2026,
                10:30 AM
              </span>

              <button
                type="button"
                className="text-[9.5px] font-semibold text-[#278650]"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="grid min-h-[24px] grid-cols-[105px_1fr] items-center gap-[10px]">
            <p className="text-[10.5px] font-semibold text-[#5d6677]">
              Last Updated
            </p>

            <span className="flex items-center gap-[7px] whitespace-nowrap text-[10px] font-medium text-[#4b1426]">
              <Clock3 className="h-[12px] w-[12px]" />

              20 May 2026,
              10:45 AM
            </span>
          </div>

          <div className="grid min-h-[24px] grid-cols-[105px_1fr] items-center gap-[10px]">
            <p className="text-[10.5px] font-semibold text-[#5d6677]">
              Updated By
            </p>

            <span className="flex items-center gap-[7px] text-[10px] font-medium text-orange-500">
              <UserRound className="h-[12px] w-[12px]" />

              Admin User
            </span>
          </div>
        </div>

        <div
          className="
            mx-[16px]
            mb-[11px]
            mt-[7px]
            flex
            h-[35px]
            items-center
            gap-[8px]
            rounded-[5px]
            bg-[#edf6ef]
            px-[12px]
            text-[9.5px]
            font-semibold
            text-[#32784e]
          "
        >
          <span className="grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full border border-[#65a17b]">
            <Check className="h-[9px] w-[9px]" />
          </span>

          This page is currently
          published.
        </div>
      </section>

      {/* =================================================
          SEO
      ================================================= */}

      <section
        className="
          shrink-0
          rounded-none
          border
          border-[#e7e7e3]
          bg-white
          overflow-hidden
        "
      >
        <div className="flex items-center justify-between bg-slate-50 border-b border-[#e7e7e3] px-[16px] py-[9px]">
          <h2 className="text-[14px] font-bold text-[#263148]">
            SEO Score
          </h2>

          <button
            type="button"
            className="flex items-center gap-[4px] text-[10px] font-bold text-[#293681] hover:underline"
          >
            View Full SEO Analysis
            <ChevronRight className="h-[10px] w-[10px]" />
          </button>
        </div>

        <div className="px-[16px] py-[11px]">
          <div
            className="
              grid
              grid-cols-[132px_1fr]
              items-center
              gap-[11px]
            "
          >
            <div className="flex justify-center">
              <SeoScoreCircle />
            </div>

            <div className="space-y-[1px] border-l border-[#eeeeea] pl-[14px]">
              <SeoRow label="Meta Title" />
              <SeoRow label="Meta Description" />
              <SeoRow label="Headings" />
              <SeoRow label="Content Quality" />
              <SeoRow label="Internal Linking" />
              <SeoRow label="Images (ALT Text)" />
              <SeoRow label="Schema Markup" />
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <section
        className="
          shrink-0
          rounded-none
          border
          border-[#e7e7e3]
          bg-white
          px-[16px]
          py-[10px]
        "
      >
        <h2 className="text-[14px] font-bold text-[#263148]">
          Quick Actions
        </h2>

        <div
          className="
            mt-[8px]
            grid
            grid-cols-2
            gap-[7px]
          "
        >
          <button
            type="button"
            className="
              flex
              h-[36px]
              items-center
              justify-center
              gap-[7px]
              rounded-[5px]
              border
              border-[#dedfdb]
              bg-white
              text-[10px]
              font-semibold
              text-[#475367]
            "
          >
            <Copy className="h-[13px] w-[13px]" />

            Duplicate Page
          </button>

          <button
            type="button"
            onClick={() =>
              navigator
                .clipboard
                ?.writeText(
                  `${PUBLIC_SITE_URL}/${form.slug}`,
                )
            }
            className="
              flex
              h-[36px]
              items-center
              justify-center
              gap-[7px]
              rounded-[5px]
              border
              border-[#dedfdb]
              bg-white
              text-[10px]
              font-semibold
              text-[#475367]
            "
          >
            <Link2 className="h-[13px] w-[13px]" />

            Copy URL
          </button>

          <button
            type="button"
            className="
              flex
              h-[36px]
              items-center
              justify-center
              gap-[7px]
              rounded-[5px]
              border
              border-[#efcfca]
              bg-white
              text-[10px]
              font-semibold
              text-[#d44f48]
            "
          >
            <Trash2 className="h-[13px] w-[13px]" />

            Move to Trash
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/pages/${getCmsPageRouteKey(page)}`,
              )
            }
            className="
              flex
              h-[36px]
              items-center
              justify-center
              gap-[7px]
              rounded-[5px]
              border
              border-[#dedfdb]
              bg-white
              text-[10px]
              font-semibold
              text-[#475367]
            "
          >
            <ExternalLink className="h-[13px] w-[13px]" />

            View Page
          </button>
        </div>
      </section>
    </div>
    </>
  );
}
