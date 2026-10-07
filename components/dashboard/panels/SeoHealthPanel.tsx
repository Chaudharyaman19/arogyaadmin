"use client";

/* =========================================================
   SEOHEALTH PANEL
   Extracted from app/(dashboard)/page.tsx
========================================================= */

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import {
  AnimatedCounter,
  Panel,
  PanelTitle,
} from "@/components/dashboard/DashboardPanels";
import { useDashboardPanels } from "../DashboardPanelsContext";

export function SeoHealthPanel() {
  const { seoScore, pageSpeed } = useDashboardPanels();

  return (
    <>
    {/* =================================================
        SEO HEALTH
    ================================================= */}

    <Panel>
      <PanelTitle
        right={
          <button
            type="button"
            onClick={() => window.open("/seo", "_blank")}
            className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
          >
            View Data

            <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
          </button>
        }
      >
        SEO Health
        Overview
      </PanelTitle>

      <div className="grid min-h-0 grid-cols-[110px_1fr] items-center gap-2 px-3 pt-3">
        <div className="relative mx-auto h-[96px] w-[96px]">
          <svg
            className="pointer-events-none absolute inset-0 z-0 h-full w-full -rotate-90"
          >
            <defs>
              <mask id="seo-donut-mask">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="16"
                  className="animate-donut-fill"
                />
              </mask>
            </defs>
          </svg>

          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(#148151 0deg ${seoScore *
                3.6
                }deg, #edf0ea ${seoScore *
                3.6
                }deg 360deg)`,

              mask:
                "url(#seo-donut-mask)",

              WebkitMask:
                "url(#seo-donut-mask)",
            }}
          />

          <div className="absolute inset-[9px] z-10 grid place-items-center rounded-full bg-white text-center">
            <div>
              <div className="text-[22px] font-semibold leading-none text-emerald-600">
                <AnimatedCounter
                  value={
                    pageSpeed
                      ? seoScore
                      : "—"
                  }
                  duration={
                    2500
                  }
                />
              </div>

              <div className="mt-0.5 text-[9px] font-bold text-emerald-700">
                {pageSpeed
                  ? seoScore >=
                    90
                    ? "Excellent"
                    : seoScore >=
                      70
                      ? "Good"
                      : "Needs Work"
                  : "No Live Data"}
              </div>
            </div>
          </div>
        </div>

        <div
          className="space-y-[5px] text-[11.5px] font-semibold text-slate-900"
          style={{
            fontSize:
              "11.5px",

            fontWeight: 600,

            color:
              "#0f172a",
          }}
        >
          {(pageSpeed?.seoChecks ?? [
            { key: "meta-title", label: "Meta Title", status: "not_checked" as const },
            { key: "meta-description", label: "Meta Description", status: "not_checked" as const },
            { key: "headings", label: "Headings", status: "not_checked" as const },
            { key: "content-quality", label: "Content Quality", status: "not_checked" as const },
            { key: "internal-linking", label: "Internal Linking", status: "not_checked" as const },
            { key: "image-alt", label: "Images (ALT Text)", status: "not_checked" as const },
            { key: "schema-markup", label: "Schema Markup", status: "not_checked" as const },
            { key: "mobile-friendly", label: "Mobile Friendliness", status: "not_checked" as const },
            { key: "page-speed", label: "Page Speed", status: "not_checked" as const },
          ]).map(
            (check) => (
              <div
                key={check.key}
                className="grid grid-cols-[14px_1fr_auto] items-center gap-1"
              >
                {check.status === "good" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                ) : (
                  <AlertCircle className={`h-3.5 w-3.5 ${check.status === "needs_work" ? "text-amber-500" : "text-slate-400"}`} />
                )}

                <span
                  className="font-semibold text-slate-900"
                  style={{
                    color:
                      "#0f172a",

                    fontWeight: 600,
                  }}
                >
                  {check.label}
                </span>

                <span
                  className={
                    check.status === "good"
                      ? "text-emerald-700"
                      : check.status === "needs_work"
                        ? "text-amber-500"
                        : "text-slate-400"
                  }
                >
                  {check.status === "good"
                    ? "Good"
                    : check.status === "needs_work"
                      ? "Needs Work"
                      : "Not Checked"}
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </Panel>

    </>
  );
}
