"use client";

/* =========================================================
   COREWEBVITALS PANEL
   Extracted from app/(dashboard)/page.tsx
========================================================= */

import {
  ArrowRight,
} from "lucide-react";
import {
  AnimatedCounter,
  Panel,
  PanelTitle,
} from "@/components/dashboard/DashboardPanels";
import { useDashboardPanels } from "../DashboardPanelsContext";

export function CoreWebVitalsPanel() {
  const { pageSpeed } = useDashboardPanels();

  return (
    <>
    {/* =================================================
        CORE WEB VITALS
    ================================================= */}

    <Panel>
      <PanelTitle
        right={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.open("/analytics", "_blank")}
              className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
            >
              View Performance

              <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
            </button>
          </div>
        }
      >
        Core Web Vitals
        (Field Data)
      </PanelTitle>

      <div className="grid grid-cols-3 gap-1.5 px-3 pt-3">
        {[
          {
            label:
              "Largest Contentful Paint (LCP)",

            value:
              pageSpeed?.lcp !=
                null
                ? `${(
                  pageSpeed.lcp /
                  1000
                ).toFixed(
                  1,
                )}s`
                : "—",

            status:
              pageSpeed?.lcp ==
                null
                ? "No Data"
                : pageSpeed.lcp <=
                  2500
                  ? "Good"
                  : pageSpeed.lcp <=
                    4000
                    ? "Needs Work"
                    : "Poor",

            score:
              pageSpeed?.lcp ==
                null
                ? "0%"
                : pageSpeed.lcp <=
                  2500
                  ? "100%"
                  : pageSpeed.lcp <=
                    4000
                    ? "60%"
                    : "25%",

            bg:
              "bg-[#eff6ff] border-[#dbeafe]",

            valColor:
              "text-blue-900",

            barColor:
              "bg-blue-600",

            scoreColor:
              "text-blue-700",
          },

          {
            label:
              "Interaction to Next Paint (INP)",

            value:
              pageSpeed?.inp !=
                null
                ? `${Math.round(
                  pageSpeed.inp,
                )}ms`
                : "—",

            status:
              pageSpeed?.inp ==
                null
                ? "No Data"
                : pageSpeed.inp <=
                  200
                  ? "Good"
                  : pageSpeed.inp <=
                    500
                    ? "Needs Work"
                    : "Poor",

            score:
              pageSpeed?.inp ==
                null
                ? "0%"
                : pageSpeed.inp <=
                  200
                  ? "100%"
                  : pageSpeed.inp <=
                    500
                    ? "60%"
                    : "25%",

            bg:
              "bg-[#f0fdf4] border-[#dcfce7]",

            valColor:
              "text-emerald-900",

            barColor:
              "bg-emerald-600",

            scoreColor:
              "text-emerald-700",
          },

          {
            label:
              "Cumulative Layout Shift (CLS)",

            value:
              pageSpeed?.cls !=
                null
                ? pageSpeed.cls.toFixed(
                  2,
                )
                : "—",

            status:
              pageSpeed?.cls ==
                null
                ? "No Data"
                : pageSpeed.cls <=
                  0.1
                  ? "Good"
                  : pageSpeed.cls <=
                    0.25
                    ? "Needs Work"
                    : "Poor",

            score:
              pageSpeed?.cls ==
                null
                ? "0%"
                : pageSpeed.cls <=
                  0.1
                  ? "100%"
                  : pageSpeed.cls <=
                    0.25
                    ? "60%"
                    : "25%",

            bg:
              "bg-[#faf5ff] border-[#f3e8ff]",

            valColor:
              "text-purple-900",

            barColor:
              "bg-purple-600",

            scoreColor:
              "text-purple-700",
          },
        ].map(
          (item) => (
            <div
              key={
                item.label
              }
              className={`
                rounded-[7px]
                border
                px-2
                py-2

                ${item.bg}
              `}
              style={{
                boxShadow:
                  "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.08) 0px 0px 0px 1px",
              }}
            >
              <p
                className="text-[9.5px] font-bold text-slate-900"
                style={{
                  color:
                    "#0f172a",

                  fontWeight: 700,
                }}
              >
                {
                  item.label
                }
              </p>

              <p
                className={`
                  mt-1
                  text-[16px]
                  font-semibold
                  ${item.valColor}
                `}
                style={{
                  fontWeight: 600,
                }}
              >
                <AnimatedCounter
                  value={
                    item.value
                  }
                />
              </p>

              <p
                className={`
                  mt-0.5
                  text-[9px]
                  font-bold

                  ${item.status ===
                    "Good"
                    ? "text-emerald-700"
                    : item.status ===
                      "No Data"
                      ? "text-slate-500"
                      : item.status ===
                        "Needs Work"
                        ? "text-amber-700"
                        : "text-red-700"
                  }
                `}
              >
                {
                  item.status
                }
              </p>

              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-200/60">
                <div
                  className={`
                    h-full
                    rounded-full
                    ${item.barColor}
                  `}
                  style={{
                    width:
                      item.score,
                  }}
                />
              </div>

              <p
                className={`
                  mt-0.5
                  text-right
                  text-[8px]
                  font-bold
                  ${item.scoreColor}
                `}
              >
                {item.status ===
                  "No Data"
                  ? "—"
                  : item.score}
              </p>
            </div>
          ),
        )}
      </div>

      <div className="px-3 pt-2.5 pb-2">
        <p
          className="mb-1 text-[10px] font-semibold text-slate-900"
          style={{
            color:
              "#0f172a",

            fontWeight: 800,
          }}
        >
          Other Performance
          Metrics
        </p>

        <div className="grid grid-cols-[1fr_64px_64px] text-[9px] font-bold">
          <div className="rounded-l-[4px] bg-[#eaeff5] px-2 py-1 text-black">
            Metric
          </div>

          <div className="bg-[#eaeff5] px-2 py-1 text-center text-black">
            Mobile
          </div>

          <div className="rounded-r-[4px] bg-[#eaeff5] px-2 py-1 text-center text-black">
            Desktop
          </div>

          {[
            [
              "First Contentful Paint (FCP)",

              pageSpeed?.fcp !=
                null
                ? `${(
                  pageSpeed.fcp /
                  1000
                ).toFixed(
                  1,
                )}s`
                : "—",

              "—",
            ],

            [
              "Time to First Byte (TTFB)",
              "—",
              "—",
              "#2563eb",
            ],

            [
              "Total Blocking Time (TBT)",

              pageSpeed?.tbt !=
                null
                ? `${Math.round(
                  pageSpeed.tbt,
                )}ms`
                : "—",

              "—",

              "#4B1426",
            ],
          ].map(
            (row) => (
              <div
                key={
                  row[0]
                }
                className="contents"
              >
                <div
                  className="px-2 py-1 font-semibold text-slate-900"
                  style={{
                    color:
                      "#0f172a",

                    fontWeight: 600,
                  }}
                >
                  {
                    row[0]
                  }
                </div>

                <div
                  className="px-2 py-1 text-center font-bold"
                  style={{
                    color:
                      row[3] ||
                      "#047857",
                  }}
                >
                  {
                    row[1]
                  }
                </div>

                <div
                  className="px-2 py-1 text-center font-bold"
                  style={{
                    color:
                      row[3] ||
                      "#047857",
                  }}
                >
                  {
                    row[2]
                  }
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </Panel>

    </>
  );
}
