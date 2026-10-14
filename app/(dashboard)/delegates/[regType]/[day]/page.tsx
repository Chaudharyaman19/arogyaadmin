"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Globe,
  IndianRupee,
  Laptop,
  Mail,
  Phone,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Swal from "sweetalert2";
import typography from "../../../pages/PagesTypography.module.css";
import { ApiRequestError } from "@/lib/api";
import {
  CONFERENCE_DAYS,
  daysLabel,
  delegatesApi,
  formatInr,
  isWebsiteSource,
  matchesDay,
  type DayFilter,
  type Delegate,
  type RegistrationType,
} from "@/lib/delegatesApi";

/* =========================================================
   TOAST HELPER
========================================================= */

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
  background: "#1e2433",
  color: "#e2e8f0",
});

const showSuccess = (title: string) => Toast.fire({ icon: "success", iconColor: "#34d399", title });
const showError = (title: string) => Toast.fire({ icon: "error", iconColor: "#f87171", title });

/* =========================================================
   HELPERS
========================================================= */

function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isWithinLastDays = (value: string, days: number) => {
  const d = new Date(value);
  return !Number.isNaN(d.getTime()) && d.getTime() >= Date.now() - days * 24 * 60 * 60 * 1000;
};

const titleCase = (value?: string) =>
  value ? value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "—";

const cleanPassName = (value?: string) =>
  (value || "").replace(/\s*\((All \d+ Days?|All Days|\d+ Day|Single Day|1 Day)\)/gi, "").trim() || "—";

const DAY_BADGE: Record<number, string> = {
  1: "bg-emerald-50 text-emerald-800 border-emerald-200",
  2: "bg-sky-50 text-sky-800 border-sky-200",
  3: "bg-violet-50 text-violet-800 border-violet-200",
};

function DayBadge({ days }: { days: number[] }) {
  const cls =
    days.length === 3
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : days.length === 2
        ? "bg-indigo-50 text-indigo-800 border-indigo-200"
        : DAY_BADGE[days[0]] ?? "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span className={`inline-flex items-center rounded-[4px] border px-1.5 py-[1px] text-[7.5px] font-bold ${cls}`}>
      {days.length === 1 ? `Day ${days[0]} · ${CONFERENCE_DAYS[days[0] as 1 | 2 | 3] ?? ""}` : daysLabel(days)}
    </span>
  );
}

/* =========================================================
   STAT CARDS (same style as Contact Enquiry)
========================================================= */

const toneClass = {
  peach: "bg-orange-50 text-orange-700 ring-orange-200",
  coral: "bg-red-50 text-red-600 ring-red-200",
  apricot: "bg-amber-50 text-amber-700 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  gold: "bg-yellow-50 text-yellow-700 ring-yellow-200",
  salmon: "bg-orange-50 text-orange-600 ring-orange-200",
} as const;

interface StatCardItem {
  title: string;
  value: string | number;
  icon: LucideIcon;
  tone: keyof typeof toneClass;
  gradient: string;
  borderColor: string;
  numColor: string;
  footer: string;
  onClick: () => void;
}

const PAGE_SIZE = 10;
const REG_TYPES: RegistrationType[] = ["single", "group"];
const DAY_FILTERS: DayFilter[] = ["all", "day-1", "day-2", "day-3"];

type SourceTab = "all" | "website" | "crm";
type DateRange = "all" | "today" | "week" | "month";

/* =========================================================
   SINGLE / GROUP REGISTRATION — DAY-WISE LIST
========================================================= */

export default function DelegateRegistrationsPage() {
  const params = useParams<{ regType: string; day: string }>();
  const router = useRouter();
  const regType = params.regType as RegistrationType;
  const day = params.day as DayFilter;
  if (!REG_TYPES.includes(regType) || !DAY_FILTERS.includes(day)) notFound();

  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sourceTab, setSourceTab] = useState<SourceTab>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [primaryOnly, setPrimaryOnly] = useState(false);
  const [groupTxn, setGroupTxn] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setDelegates(await delegatesApi.list());
    } catch (err) {
      setLoadError(err instanceof ApiRequestError ? err.message : "Failed to load delegates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // A new menu item (type / day) starts from a clean view
  useEffect(() => {
    setPage(1);
    setSelectedIds([]);
    setGroupTxn(null);
  }, [regType, day]);

  /* Registrations of this type + day (before the table filters) */
  const scoped = useMemo(
    () => delegates.filter((d) => d.registrationType === regType && matchesDay(d, day)),
    [delegates, regType, day]
  );

  const dayCounts = useMemo(
    () =>
      Object.fromEntries(
        DAY_FILTERS.map((f) => [f, delegates.filter((d) => d.registrationType === regType && matchesDay(d, f)).length])
      ) as Record<DayFilter, number>,
    [delegates, regType]
  );

  const counts = useMemo(
    () => ({
      all: scoped.length,
      website: scoped.filter(isWebsiteSource).length,
      crm: scoped.filter((d) => !isWebsiteSource(d)).length,
      today: scoped.filter((d) => isSameDay(new Date(d.createdAt), new Date())).length,
      week: scoped.filter((d) => isWithinLastDays(d.createdAt, 7)).length,
      revenue: scoped.reduce((sum, d) => sum + (d.amount || 0), 0),
    }),
    [scoped]
  );

  const filtered = useMemo(() => {
    if (groupTxn) return delegates.filter((d) => d.transactionId === groupTxn);
    const q = search.trim().toLowerCase();
    const now = new Date();
    return scoped.filter((d) => {
      if (sourceTab === "website" && !isWebsiteSource(d)) return false;
      if (sourceTab === "crm" && isWebsiteSource(d)) return false;
      if (regType === "group" && primaryOnly && !d.isPrimary) return false;

      const created = new Date(d.createdAt);
      if (dateRange === "today" && !isSameDay(created, now)) return false;
      if (dateRange === "week" && !isWithinLastDays(d.createdAt, 7)) return false;
      if (dateRange === "month" && (created.getMonth() !== now.getMonth() || created.getFullYear() !== now.getFullYear())) return false;

      if (!q) return true;
      return [d.fullName, d.email, d.mobile, d.whatsappNumber, d.organization, d.transactionId, d.delegateId, d.city]
        .some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [delegates, scoped, groupTxn, search, sourceTab, primaryOnly, dateRange, regType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, filtered.length);
  const paginatedRows = filtered.slice(startIndex, endIndex);
  const allOnPageSelected = paginatedRows.length > 0 && paginatedRows.every((d) => selectedIds.includes(d._id));

  const changeSourceTab = (next: SourceTab) => {
    setSourceTab(next);
    setPage(1);
  };

  /* ---------- actions ---------- */

  const handleDelete = async (delegate: Delegate) => {
    const result = await Swal.fire({
      title: `Delete "${delegate.fullName}"?`,
      text: "The registration is removed permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
      background: "#1e2433",
      color: "#e2e8f0",
    });
    if (!result.isConfirmed) return;

    const previous = delegates;
    setDelegates((prev) => prev.filter((d) => d._id !== delegate._id));
    setSelectedIds((prev) => prev.filter((id) => id !== delegate._id));
    try {
      await delegatesApi.remove(delegate._id);
      showSuccess("Delegate deleted");
    } catch (err) {
      setDelegates(previous);
      showError(err instanceof ApiRequestError ? err.message : "Failed to delete delegate.");
    }
  };

  const handleBulkDelete = async () => {
    const result = await Swal.fire({
      title: `Delete ${selectedIds.length} registration(s)?`,
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Delete ${selectedIds.length}`,
      confirmButtonColor: "#dc2626",
      background: "#1e2433",
      color: "#e2e8f0",
    });
    if (!result.isConfirmed) return;

    try {
      const { deletedCount } = await delegatesApi.bulkRemove(selectedIds);
      setDelegates((prev) => prev.filter((d) => !selectedIds.includes(d._id)));
      setSelectedIds([]);
      showSuccess(`${deletedCount} delegate(s) deleted`);
    } catch (err) {
      showError(err instanceof ApiRequestError ? err.message : "Failed to delete delegates.");
    }
  };

  const exportCsv = () => {
    const header = ["S.No", "Delegate ID", "Name", "Email", "Mobile", "WhatsApp", "Day(s)", "Pass", "Price", "Transaction ID", "Designation", "Organization", "Category", "Specialization", "City", "State", "Country", "Source", "Registered On"];
    const rows = filtered.map((d, i) => [
      i + 1, d.delegateId, `${d.title || ""} ${d.fullName}`.trim(), d.email, d.mobile, d.whatsappNumber, daysLabel(d.days),
      cleanPassName(d.planName), d.price, d.transactionId, d.designation, d.organization, d.category || d.industryType,
      d.specialization || d.areasOfInterest, d.city, d.state, d.country, d.source, formatDateTime(d.createdAt),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${regType}-registration-${day}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- view ---------- */

  const typeTitle = regType === "group" ? "Group Registration" : "Single Registration";
  const dayTitle = day === "all" ? "All Days" : `Day ${day.slice(4)}`;

  const statCards: StatCardItem[] = [
    {
      title: "TOTAL REGISTRATIONS",
      value: counts.all,
      icon: Users,
      tone: "peach",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ffedd5 100%)",
      borderColor: "#fed7aa",
      numColor: "#c2410c",
      footer: "View all",
      onClick: () => { changeSourceTab("all"); setDateRange("all"); },
    },
    {
      title: "WEBSITE",
      value: counts.website,
      icon: Globe,
      tone: "coral",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fee2e2 100%)",
      borderColor: "#fecaca",
      numColor: "#dc2626",
      footer: "View website",
      onClick: () => changeSourceTab("website"),
    },
    {
      title: "CRM / ADMIN",
      value: counts.crm,
      icon: Laptop,
      tone: "apricot",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fef3c7 100%)",
      borderColor: "#fde68a",
      numColor: "#b45309",
      footer: "View CRM",
      onClick: () => changeSourceTab("crm"),
    },
    {
      title: "TOTAL PAYMENT",
      value: formatInr(counts.revenue),
      icon: IndianRupee,
      tone: "rose",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ffe4e6 100%)",
      borderColor: "#fecdd3",
      numColor: "#be123c",
      footer: "Revenue",
      onClick: () => changeSourceTab("all"),
    },
    {
      title: "TODAY",
      value: counts.today,
      icon: Sparkles,
      tone: "gold",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fef9c3 100%)",
      borderColor: "#fef08a",
      numColor: "#a16207",
      footer: "New today",
      onClick: () => setDateRange("today"),
    },
    {
      title: "LAST 7 DAYS",
      value: counts.week,
      icon: CalendarDays,
      tone: "salmon",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ffe4d6 100%)",
      borderColor: "#fdc9b0",
      numColor: "#ea580c",
      footer: "This week",
      onClick: () => setDateRange("week"),
    },
  ];

  const SOURCE_TABS: { key: SourceTab; label: string }[] = [
    { key: "all", label: "All Registrations" },
    { key: "website", label: "Website" },
    { key: "crm", label: "CRM / Admin" },
  ];

  const th = "whitespace-nowrap px-[10px] py-[6px] text-[7.5px] font-bold text-white uppercase tracking-wide";

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* HEADER + DAY TABS */}
        <div className="mb-[14px] flex flex-wrap items-end justify-between gap-[10px] border-b-[2px] border-[#293681] pb-[10px]">
          <div>
            <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#4B1426]">
              {typeTitle} <span className="text-[#166b40]">— {dayTitle}</span>
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              {day === "all"
                ? "Delegates with a multi-day pass (2 or 3 days)."
                : `Delegates with a one-day pass for ${CONFERENCE_DAYS[Number(day.slice(4)) as 1 | 2 | 3]} 2026.`}
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-[8px] border border-[#e5e7e6] bg-[#f6f7f5] p-[3px]">
            {DAY_FILTERS.map((f) => {
              const active = f === day;
              return (
                <Link
                  key={f}
                  href={`/delegates/${regType}/${f}`}
                  className={`flex items-center gap-1.5 rounded-[6px] px-[10px] py-[5px] text-[9.5px] font-bold transition ${
                    active ? "bg-[#166b40] text-white shadow-sm" : "text-[#414b5e] hover:bg-white"
                  }`}
                >
                  <CalendarDays className="h-3 w-3" />
                  {f === "all" ? "All Days" : `Day ${f.slice(4)}`}
                  <span className={`rounded-full px-1.5 text-[8px] ${active ? "bg-white/25" : "bg-[#e5e7e6]"}`}>
                    {dayCounts[f]}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* STATS ROW */}
        <div className="mb-[12px] grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          {statCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="relative flex h-[82px] flex-col overflow-hidden rounded-[10px] border border-[#e5e7e6] bg-white p-1.5 !pb-4.5 transition-all hover:translate-y-[-1px]"
                style={{
                  background: item.gradient,
                  borderColor: item.borderColor,
                  boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                }}
              >
                <div className="flex items-start gap-1.5">
                  <div className={`grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full ring-1 bg-white/80 shadow-xs ${toneClass[item.tone]}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[7px] !font-semibold tracking-[0.01em] text-slate-900" style={{ fontWeight: 600, color: "#0f172a" }}>
                      {item.title}
                    </p>
                    <div className="mt-1 flex items-end justify-between">
                      <span className="text-[16px] !font-semibold leading-none tracking-[-0.04em]" style={{ color: item.numColor, fontWeight: 600 }}>
                        {item.value}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  onClick={item.onClick}
                  className="absolute bottom-1 left-1.5 right-1.5 flex cursor-pointer items-center justify-center gap-1 text-[7px] font-semibold text-[#293957] transition hover:text-blue-600"
                >
                  {item.footer}
                  <ArrowRight className="h-2.5 w-2.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* TABLE CARD */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[7px] border border-[#e8e5df] bg-white">
          {/* TABS */}
          <div className="flex flex-wrap items-center gap-[20px] border-b border-[#e8e5df] px-[16px] pt-[11px]">
            {SOURCE_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => changeSourceTab(t.key)}
                className={`relative pb-[9px] text-[10px] font-bold transition-colors ${
                  sourceTab === t.key ? "text-[#166b40]" : "text-[#6c7587] hover:text-[#18233b]"
                }`}
              >
                {t.label} ({counts[t.key]})
                {sourceTab === t.key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#166b40]" />}
              </button>
            ))}
          </div>

          {/* SEARCH + FILTERS */}
          <div className="flex flex-wrap items-center gap-[8px] border-b border-[#f0f0ec] px-[16px] py-[10px]">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-[9px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 text-[#9aa0aa]" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, email, mobile, organization, delegate ID or transaction ID..."
                className="h-[30px] w-full rounded-[5px] border border-[#e5e6e2] bg-white pl-[26px] pr-[9px] text-[9.5px] font-medium text-[#414b5e] outline-none placeholder:text-[#9aa0aa] focus:border-[#8fa98e]"
              />
            </div>
            {regType === "group" && (
              <select
                value={primaryOnly ? "primary" : "all"}
                onChange={(e) => {
                  setPrimaryOnly(e.target.value === "primary");
                  setPage(1);
                }}
                className="h-[30px] rounded-[5px] border border-[#e5e6e2] bg-white px-[8px] text-[9.5px] font-semibold text-[#414b5e] outline-none"
              >
                <option value="all">All Members</option>
                <option value="primary">Primary Contacts Only</option>
              </select>
            )}
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value as DateRange);
                setPage(1);
              }}
              className="h-[30px] rounded-[5px] border border-[#e5e6e2] bg-white px-[8px] text-[9.5px] font-semibold text-[#414b5e] outline-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
            </select>
            <button
              type="button"
              onClick={exportCsv}
              disabled={!filtered.length}
              className="flex h-[30px] items-center gap-1.5 rounded-[5px] bg-[#166b40] px-[12px] text-[9.5px] font-bold text-white transition hover:bg-[#11532f] disabled:opacity-40"
            >
              <Download className="h-3 w-3" />
              Export
            </button>
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                className="flex h-[30px] items-center gap-1.5 rounded-[5px] bg-red-600 px-[12px] text-[9.5px] font-bold text-white transition hover:bg-red-700"
              >
                <Trash2 className="h-3 w-3" />
                Delete ({selectedIds.length})
              </button>
            )}
          </div>

          {groupTxn && (
            <div className="flex items-center justify-between border-b border-[#f0f0ec] bg-blue-50/60 px-[16px] py-[7px] text-[9.5px] font-semibold text-[#1e3a8a]">
              <span>Showing every member of group booking {groupTxn}</span>
              <button type="button" onClick={() => setGroupTxn(null)} className="flex items-center gap-1 text-red-600 hover:underline">
                <X className="h-3 w-3" /> Clear group filter
              </button>
            </div>
          )}

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse text-left">
              <thead>
                <tr className="h-[32px] border-b border-[#e8e5df] bg-[#111844]">
                  <th className={`${th} w-[56px]`}>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={allOnPageSelected}
                        onChange={(e) => {
                          const pageIds = paginatedRows.map((d) => d._id);
                          setSelectedIds((prev) =>
                            e.target.checked ? [...new Set([...prev, ...pageIds])] : prev.filter((id) => !pageIds.includes(id))
                          );
                        }}
                        className="h-3 w-3 cursor-pointer accent-[#166b40]"
                        title="Select all on this page"
                      />
                      S.No
                    </label>
                  </th>
                  <th className={th}>Delegate</th>
                  <th className={th}>Contact</th>
                  <th className={th}>Pass / Price</th>
                  <th className={th}>Designation / Organization</th>
                  <th className={th}>Category / Specialization</th>
                  <th className={th}>Source</th>
                  <th className={th}>Registered</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0ec]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[10px] text-[#6c7587]">Loading delegates…</td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[10px] font-semibold text-red-600">{loadError}</td>
                  </tr>
                ) : paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[10px] text-[#6c7587]">No registrations match your filters.</td>
                  </tr>
                ) : (
                  paginatedRows.map((d, rowIndex) => (
                    <tr key={d._id} className="align-top transition hover:bg-slate-50/80">
                      <td className="px-[12px] py-[8px]">
                        <label className="flex items-center gap-1.5 text-[9px] font-semibold text-[#6c7587]">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(d._id)}
                            onChange={(e) =>
                              setSelectedIds((prev) => (e.target.checked ? [...prev, d._id] : prev.filter((id) => id !== d._id)))
                            }
                            className="h-3 w-3 cursor-pointer accent-[#166b40]"
                          />
                          {startIndex + rowIndex + 1}
                        </label>
                      </td>
                      <td className="px-[12px] py-[8px]">
                        <span className="inline-block rounded-[3px] border border-green-200 bg-green-50 px-1 font-mono text-[7.5px] font-bold text-[#14532d]">
                          {d.delegateId || d._id.slice(-8).toUpperCase()}
                        </span>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1">
                          <button type="button" onClick={() => router.push(`/delegates/view/${d._id}`)} className="text-left text-[9px] font-bold text-[#4B1426] hover:underline">
                            {[d.title, d.fullName].filter(Boolean).join(" ")}
                          </button>
                          {d.isPrimary && d.groupSize > 1 && !groupTxn && (
                            <button
                              type="button"
                              onClick={() => {
                                setGroupTxn(d.transactionId || null);
                                setPage(1);
                              }}
                              className="rounded-[3px] bg-blue-50 px-1 text-[7.5px] font-bold text-blue-700 hover:underline"
                              title="Show every member of this group"
                            >
                              +{d.groupSize - 1} members
                            </button>
                          )}
                          {!d.isPrimary && <span className="rounded-[3px] bg-slate-100 px-1 text-[7.5px] font-bold text-slate-600">Member</span>}
                        </div>
                      </td>
                      <td className="px-[12px] py-[8px]">
                        <div className="flex items-center gap-1 text-[9px] font-bold text-[#166534]">
                          <Phone className="h-2.5 w-2.5" />
                          {d.whatsappNumber || d.mobile || "—"}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-[9px] font-medium text-[#334155]">
                          <Mail className="h-2.5 w-2.5 text-[#94a3b8]" />
                          <span className="max-w-[170px] truncate" title={d.email}>{d.email}</span>
                        </div>
                      </td>
                      <td className="px-[12px] py-[8px]">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-[9.5px] font-bold text-[#15803d]">{d.price || "—"}</span>
                          <DayBadge days={d.days} />
                        </div>
                        <div className="mt-0.5 text-[8.5px] font-semibold text-[#063B00]">{cleanPassName(d.planName)}</div>
                        {d.transactionId && (
                          <div className="mt-0.5 font-mono text-[7.5px] uppercase text-[#64748b]">
                            Txn: <span className="font-semibold text-[#4B1426]">{d.transactionId}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-[12px] py-[8px]">
                        <div className="text-[9px] font-semibold text-[#b91c1c]">{titleCase(d.designation)}</div>
                        <div className="mt-0.5 flex items-center gap-1 text-[9px] font-medium text-[#1d4ed8]">
                          <Building2 className="h-2.5 w-2.5 shrink-0" />
                          {titleCase(d.organization)}
                        </div>
                      </td>
                      <td className="px-[12px] py-[8px]">
                        <div className="text-[9px] font-semibold text-[#15803d]">{titleCase(d.category || d.industryType)}</div>
                        <div className="mt-0.5 text-[9px] font-medium text-[#1d4ed8]">{titleCase(d.specialization || d.areasOfInterest)}</div>
                      </td>
                      <td className="px-[12px] py-[8px]">
                        <span
                          className={`rounded-[4px] border px-1.5 py-[1px] text-[7.5px] font-bold ${
                            isWebsiteSource(d) ? "border-purple-200 bg-purple-50 text-purple-700" : "border-orange-200 bg-orange-50 text-orange-700"
                          }`}
                        >
                          {isWebsiteSource(d) ? "WEBSITE" : (d.source || "CRM").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-[12px] py-[8px] text-[8.5px] font-medium text-[#6c7587]">{formatDateTime(d.createdAt)}</td>
                      <td className="px-[12px] py-[8px]">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="View Details"
                            onClick={() => router.push(`/delegates/view/${d._id}`)}
                            className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-orange-400/30 bg-orange-500/10 text-orange-600 shadow-[0_2px_6px_rgba(249,115,22,0.12)] transition-all hover:scale-105 hover:bg-orange-500/20 active:scale-95"
                          >
                            <Eye className="h-[12px] w-[12px]" />
                          </button>
                          <a
                            href={`https://wa.me/${(d.whatsappNumber || d.mobile || "").replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Message on WhatsApp"
                            className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-emerald-400/30 bg-emerald-500/10 text-emerald-600 shadow-[0_2px_6px_rgba(16,185,129,0.12)] transition-all hover:scale-105 hover:bg-emerald-500/20 active:scale-95"
                          >
                            <Phone className="h-[12px] w-[12px]" />
                          </a>
                          <button
                            type="button"
                            title="Delete"
                            onClick={() => handleDelete(d)}
                            className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-red-400/30 bg-red-500/10 text-red-600 shadow-[0_2px_6px_rgba(220,38,38,0.12)] transition-all hover:scale-105 hover:bg-red-500/20 active:scale-95"
                          >
                            <Trash2 className="h-[12px] w-[12px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION FOOTER */}
          {filtered.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8e5df] bg-[#fafafa] px-[12px] py-[8px] text-[8px]">
              <span className="font-semibold text-[#5f6a7c]">
                Showing {startIndex + 1} to {endIndex} of {filtered.length} registrations
              </span>
              <div className="flex items-center gap-[4px]">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`flex h-[22px] min-w-[22px] items-center justify-center rounded-[4px] border px-1.5 text-[8px] font-bold transition ${
                      safePage === pageNum ? "border-[#00291b] bg-[#00291b] text-white shadow-xs" : "border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
