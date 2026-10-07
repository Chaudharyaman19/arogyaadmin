"use client";

/* =========================================================
   SITESTATUS PANEL
   Extracted from app/(dashboard)/page.tsx
========================================================= */

import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Globe2,
  LockKeyhole,
  ShieldCheck,
  Timer,
  Wrench,
} from "lucide-react";
import {
  Panel,
  PanelTitle,
} from "@/components/dashboard/DashboardPanels";
import { useDashboardPanels } from "../DashboardPanelsContext";

export function SiteStatusPanel() {
  const { siteStatus, liveDashboard } = useDashboardPanels();

  return (
    <>
    {/* =================================================
        SITE STATUS
    ================================================= */}

    <Panel>
      <PanelTitle
        right={
          <Link
            href="#"
            className="text-[9px] font-bold text-blue-600 hover:underline"
          >
            View Site Health
          </Link>
        }
      >
        Site Status
      </PanelTitle>

      <div className="px-3">
        {(siteStatus
          ? [
            [
              LockKeyhole,
              "SSL Certificate",

              siteStatus.sslValid
                ? "Valid"
                : "Invalid",
            ],

            [
              Timer,
              "SSL Expiry",

              siteStatus.certificateDaysRemaining !=
                null
                ? `${siteStatus.certificateDaysRemaining} Days · ${siteStatus.sslIssuer ??
                "Issuer Unknown"
                }`
                : "Unavailable",
            ],

            [
              ShieldCheck,
              "Security Status",

              `${siteStatus.securityHeaders.present}/${siteStatus.securityHeaders.total} Headers`,
            ],

            [
              Timer,
              "Current Availability",

              siteStatus.online
                ? `Online · ${siteStatus.responseTimeMs}ms`
                : `HTTP ${siteStatus.httpStatus}`,
            ],

            [
              Globe2,
              "HTTP Status",

              `${siteStatus.httpStatus}${siteStatus.redirected
                ? " · Redirected"
                : ""
              }`,
            ],

            [
              Globe2,
              "Server IP",

              siteStatus.ipAddress ??
              "Unavailable",
            ],

            [
              Wrench,
              "Node.js Version",

              siteStatus.nodeVersion,
            ],
          ]
          : [
            [
              Activity,
              "Website Health",

              liveDashboard?.sources.siteStatus
                ?.message ??
              "Checking",
            ],
          ]
        ).map(
          ([
            Icon,
            label,
            value,
          ]) => (
            <div
              key={String(
                label,
              )}
              className="
                grid
                grid-cols-[19px_1fr_auto_17px]
                items-center
                gap-2
                border-b
                border-[#f0f0ec]
                py-[6px]
                text-[10px]
                last:border-b-0
              "
            >
              <Icon className="h-4 w-4 text-[#3b4d70]" />

              <span className="font-bold">
                {label as string}
              </span>

              <span
                className={`
                  font-bold

                  ${label ===
                    "Last Backup"
                    ? "text-[#4B1426]"
                    : label ===
                      "Security Status"
                      ? "text-blue-600"
                      : "text-emerald-700"
                  }
                `}
              >
                {value as string}
              </span>

              <CheckCircle2
                className={`
                  h-4
                  w-4

                  ${siteStatus
                    ? "text-emerald-700"
                    : "text-slate-400"
                  }
                `}
              />
            </div>
          ),
        )}
      </div>
    </Panel>

    </>
  );
}
