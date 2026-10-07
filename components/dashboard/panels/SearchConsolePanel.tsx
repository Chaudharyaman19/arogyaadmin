"use client";

/* =========================================================
   SEARCHCONSOLE PANEL
   Extracted from app/(dashboard)/page.tsx
========================================================= */

import {
  ArrowRight,
  Search,
} from "lucide-react";
import {
  AnimatedCounter,
  Panel,
  PanelTitle,
} from "@/components/dashboard/DashboardPanels";
import { useDashboardPanels } from "../DashboardPanelsContext";

export function SearchConsolePanel() {
  const { searchConsole, number, growthText } = useDashboardPanels();

  return (
    <>
    {/* =================================================
        SEARCH CONSOLE
    ================================================= */}

    <Panel>
      <PanelTitle
        right={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.open("/seo", "_blank")}
              className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
            >
              View Console

              <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
            </button>
          </div>
        }
      >
        Google Search
        Console Summary
      </PanelTitle>

      <div className="grid grid-cols-4 gap-1.5 px-3 pt-3">
        {[
          {
            label:
              "Total Clicks",

            value:
              searchConsole
                ? number(
                  searchConsole.clicks,
                )
                : "—",

            change:
              searchConsole
                ? growthText(
                  searchConsole
                    .growth
                    .clicks,
                )
                : "No Live Data",

            bg:
              "bg-[#eff6ff] border-[#dbeafe]",

            valColor:
              "text-blue-900",
          },

          {
            label:
              "Total Impressions",

            value:
              searchConsole
                ? number(
                  searchConsole.impressions,
                )
                : "—",

            change:
              searchConsole
                ? growthText(
                  searchConsole
                    .growth
                    .impressions,
                )
                : "No Live Data",

            bg:
              "bg-[#f0fdf4] border-[#dcfce7]",

            valColor:
              "text-emerald-900",
          },

          {
            label:
              "Average CTR",

            value:
              searchConsole
                ? `${searchConsole.ctr.toFixed(
                  2,
                )}%`
                : "—",

            change:
              searchConsole
                ? growthText(
                  searchConsole
                    .growth
                    .ctr,
                )
                : "No Live Data",

            bg:
              "bg-[#faf5ff] border-[#f3e8ff]",

            valColor:
              "text-purple-900",
          },

          {
            label:
              "Average Position",

            value:
              searchConsole
                ? searchConsole.position.toFixed(
                  1,
                )
                : "—",

            change:
              searchConsole
                ? growthText(
                  searchConsole
                    .growth
                    .position,

                  true,
                )
                : "No Live Data",

            bg:
              "bg-[#fff7ed] border-[#ffedd5]",

            valColor:
              "text-amber-900",
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
                py-1.5
                ${item.bg}
              `}
              style={{
                boxShadow:
                  "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.08) 0px 0px 0px 1px",
              }}
            >
              <p className="text-[9px] font-bold text-[#334666]">
                {
                  item.label
                }
              </p>

              <p
                className={`
                  mt-1
                  text-[18px]
                  font-semibold
                  ${item.valColor}
                `}
              >
                <AnimatedCounter
                  value={
                    item.value
                  }
                />
              </p>

              {item.change && (
                <p className="mt-0.5 text-[9px] font-bold text-emerald-700">
                  {
                    item.change
                  }
                </p>
              )}
            </div>
          ),
        )}
      </div>

      <div className="w-full min-h-0 px-3 pt-2 pb-1">
        <svg
          viewBox="0 0 520 120"
          preserveAspectRatio="none"
          className="block h-[90px] w-full overflow-visible"
        >
          <defs>
            <linearGradient
              id="sc-green-gradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#10b981"
                stopOpacity="0.28"
              />

              <stop
                offset="100%"
                stopColor="#10b981"
                stopOpacity="0"
              />
            </linearGradient>

            <linearGradient
              id="sc-blue-gradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#3b82f6"
                stopOpacity="0.22"
              />

              <stop
                offset="100%"
                stopColor="#3b82f6"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          <g className="animate-grow-left">
            {[
              20,
              50,
              80,
            ].map(
              (y) => (
                <line
                  key={
                    y
                  }
                  x1="12"
                  x2="508"
                  y1={
                    y
                  }
                  y2={
                    y
                  }
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              ),
            )}

            <path
              d="M 12 40 C 40 22, 80 34, 136 18 C 180 36, 220 16, 260 28 C 300 14, 340 32, 384 18 C 424 30, 464 14, 508 10 L 508 90 L 12 90 Z"
              fill="url(#sc-green-gradient)"
            />

            <path
              d="M 12 76 C 40 64, 80 74, 136 58 C 180 72, 220 58, 260 68 C 300 58, 340 74, 384 60 C 424 72, 464 58, 508 52 L 508 90 L 12 90 Z"
              fill="url(#sc-blue-gradient)"
            />

            <path
              d="M 12 40 C 40 22, 80 34, 136 18 C 180 36, 220 16, 260 28 C 300 14, 340 32, 384 18 C 424 30, 464 14, 508 10"
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-chart-line"
            />

            <path
              d="M 12 76 C 40 64, 80 74, 136 58 C 180 72, 220 58, 260 68 C 300 58, 340 74, 384 60 C 424 72, 464 58, 508 52"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-chart-line"
            />
          </g>

          <text
            x="12"
            y="114"
            fontSize="11"
            fontWeight="600"
            fill="#2563eb"
            textAnchor="start"
          >
            03 May
          </text>

          <text
            x="136"
            y="114"
            fontSize="11"
            fontWeight="600"
            fill="#2563eb"
            textAnchor="middle"
          >
            10 May
          </text>

          <text
            x="260"
            y="114"
            fontSize="11"
            fontWeight="600"
            fill="#2563eb"
            textAnchor="middle"
          >
            17 May
          </text>

          <text
            x="384"
            y="114"
            fontSize="11"
            fontWeight="600"
            fill="#2563eb"
            textAnchor="middle"
          >
            24 May
          </text>

          <text
            x="508"
            y="114"
            fontSize="11"
            fontWeight="600"
            fill="#2563eb"
            textAnchor="end"
          >
            31 May
          </text>
        </svg>
      </div>
    </Panel>

    </>
  );
}
