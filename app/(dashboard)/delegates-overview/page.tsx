"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  CalendarDays,
  Globe,
  IndianRupee,
  Laptop,
  PieChart as PieChartIcon,
  Receipt,
  TrendingUp,
  UserRound,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import typography from "../pages/PagesTypography.module.css";
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
   HELPERS
========================================================= */

function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

const toInputDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Single / group / payments / coupons for registrations in [from, to) */
const periodStats = (rows: Delegate[], from: Date, to: Date) => {
  const inRange = rows.filter((d) => {
    const t = new Date(d.createdAt).getTime();
    return t >= from.getTime() && t < to.getTime();
  });
  return {
    single: inRange.filter((d) => d.registrationType === "single").length,
    group: inRange.filter((d) => d.registrationType === "group").length,
    payments: inRange.filter((d) => d.amount > 0).length,
    revenue: inRange.reduce((s, d) => s + (d.amount || 0), 0),
    coupons: inRange.filter((d) => d.couponCode).length,
  };
};

/** The menu list a delegate appears in */
const listHref = (d: Delegate) =>
  `/delegates/${d.registrationType}/${d.days.length === 1 ? `day-${d.days[0]}` : "all"}`;

const CARD_SHADOW = "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px";
const TOOLTIP_STYLE = { borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)" };
const AXIS_TICK = { fill: "#64748b", fontSize: 10, fontWeight: 600 };

const DAY_FILTERS: DayFilter[] = ["all", "day-1", "day-2", "day-3"];
const TYPES: { key: RegistrationType; label: string; icon: LucideIcon }[] = [
  { key: "single", label: "Single Registration", icon: UserRound },
  { key: "group", label: "Group Registration", icon: UsersRound },
];

/* =========================================================
   SMALL COMPONENTS
========================================================= */

interface TopCard {
  title: string;
  value: string | number;
  desc: string;
  icon: LucideIcon;
  iconBg: string;
  gradient: string;
  text: string;
  href: string;
}

const SUB_TONES = {
  blue: { bg: "linear-gradient(135deg,#ffffff,#dbeafe)", icon: "bg-blue-500", text: "text-blue-800" },
  emerald: { bg: "linear-gradient(135deg,#ffffff,#d1fae5)", icon: "bg-emerald-500", text: "text-emerald-800" },
  orange: { bg: "linear-gradient(135deg,#ffffff,#ffedd5)", icon: "bg-orange-500", text: "text-orange-800" },
  violet: { bg: "linear-gradient(135deg,#ffffff,#ede9fe)", icon: "bg-violet-500", text: "text-violet-800" },
} as const;

function SubCard({ title, value, tone, icon: Icon }: { title: string; value: string | number; tone: keyof typeof SUB_TONES; icon: LucideIcon }) {
  const t = SUB_TONES[tone];
  return (
    <div className="flex items-center gap-2 rounded-[7px] p-2" style={{ background: t.bg, boxShadow: CARD_SHADOW }}>
      <div className={`grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full text-white shadow-sm ${t.icon}`}>
        <Icon className="h-3 w-3" />
      </div>
      <div className="min-w-0">
        <p className={`text-[7.5px] font-bold uppercase leading-tight opacity-80 ${t.text}`}>{title}</p>
        <p className={`mt-0.5 text-[13px] font-bold leading-none ${t.text}`}>{value}</p>
      </div>
    </div>
  );
}

function PeriodPanel({ heading, stats }: { heading: React.ReactNode; stats: ReturnType<typeof periodStats> }) {
  return (
    <div className="rounded-[10px] border border-[#e5e7e6] bg-white p-3" style={{ boxShadow: CARD_SHADOW }}>
      <div className="mb-2.5 flex min-h-[26px] items-center justify-center border-b border-slate-200 pb-2 text-center text-[10px] font-bold tracking-wide text-slate-800">
        {heading}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <SubCard title="Single Reg." value={stats.single} tone="blue" icon={UserRound} />
        <SubCard title="Group Reg." value={stats.group} tone="emerald" icon={UsersRound} />
        <SubCard title="Payments" value={formatInr(stats.revenue)} tone="orange" icon={Receipt} />
        <SubCard title="Coupons Used" value={stats.coupons} tone="violet" icon={BadgePercent} />
      </div>
    </div>
  );
}

function ChartCard({ title, icon: Icon, iconClass, children }: { title: string; icon: LucideIcon; iconClass: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[10px] border border-[#e5e7e6] bg-white p-3" style={{ boxShadow: CARD_SHADOW }}>
      <h3 className="mb-3 flex items-center gap-2 text-[11px] font-bold text-slate-800">
        <span className={`grid h-[24px] w-[24px] place-items-center rounded-[6px] ${iconClass}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

/* =========================================================
   DELEGATES OVERVIEW
========================================================= */

export default function DelegatesOverviewPage() {
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rangeStart, setRangeStart] = useState(() => {
    const d = new Date();
    return toInputDate(new Date(d.getFullYear(), d.getMonth(), 1));
  });
  const [rangeEnd, setRangeEnd] = useState(() => toInputDate(new Date()));

  useEffect(() => {
    delegatesApi
      .list()
      .then(setDelegates)
      .catch((err) => setLoadError(err instanceof ApiRequestError ? err.message : "Failed to load delegates."))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    const group = delegates.filter((d) => d.registrationType === "group");
    return {
      single: delegates.length - group.length,
      group: group.length,
      groupBookings: new Set(group.map((d) => d.transactionId).filter(Boolean)).size,
      payments: delegates.filter((d) => d.amount > 0).length,
      revenue: delegates.reduce((s, d) => s + (d.amount || 0), 0),
      coupons: delegates.filter((d) => d.couponCode).length,
      website: delegates.filter(isWebsiteSource).length,
    };
  }, [delegates]);

  const periods = useMemo(() => {
    const today = startOfDay(new Date());
    const tomorrow = new Date(today.getTime() + 86400000);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const customFrom = new Date(`${rangeStart}T00:00:00`);
    const customTo = new Date(new Date(`${rangeEnd}T00:00:00`).getTime() + 86400000);
    return {
      today: periodStats(delegates, today, tomorrow),
      week: periodStats(delegates, weekStart, tomorrow),
      custom: periodStats(delegates, customFrom, customTo),
    };
  }, [delegates, rangeStart, rangeEnd]);

  /* Last 6 months: registrations (single / group) and revenue */
  const trend = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const from = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const to = new Date(from.getFullYear(), from.getMonth() + 1, 1);
      const s = periodStats(delegates, from, to);
      return { month: from.toLocaleString("en-GB", { month: "short" }), single: s.single, group: s.group, revenue: s.revenue };
    });
  }, [delegates]);

  /* Everyone expected on each conference day (one-day + multi-day passes) */
  const footfall = useMemo(
    () =>
      ([1, 2, 3] as const).map((day) => {
        const attending = delegates.filter((d) => d.days.includes(day));
        return {
          day: `Day ${day}`,
          date: CONFERENCE_DAYS[day],
          single: attending.filter((d) => d.registrationType === "single").length,
          group: attending.filter((d) => d.registrationType === "group").length,
        };
      }),
    [delegates]
  );

  const matrix = useMemo(
    () =>
      Object.fromEntries(
        TYPES.map(({ key }) => [
          key,
          Object.fromEntries(
            DAY_FILTERS.map((f) => {
              const rows = delegates.filter((d) => d.registrationType === key && matchesDay(d, f));
              return [f, { count: rows.length, revenue: rows.reduce((s, d) => s + (d.amount || 0), 0) }];
            })
          ),
        ])
      ) as Record<RegistrationType, Record<DayFilter, { count: number; revenue: number }>>,
    [delegates]
  );

  const distribution = [
    { name: "Single Registration", value: totals.single, color: "#0284c7" },
    { name: "Group Registration", value: totals.group, color: "#10b981" },
  ];

  const topCards: TopCard[] = [
    { title: "SINGLE REGISTRATION", value: totals.single, desc: "Single delegate registrations", icon: UserRound, iconBg: "bg-sky-600", gradient: "linear-gradient(135deg,#ffffff 50%,#e0f2fe)", text: "text-sky-600", href: "/delegates/single/all" },
    { title: "GROUP REGISTRATION", value: totals.group, desc: `${totals.groupBookings} group bookings`, icon: UsersRound, iconBg: "bg-orange-500", gradient: "linear-gradient(135deg,#ffffff 50%,#ffedd5)", text: "text-orange-600", href: "/delegates/group/all" },
    { title: "TOTAL PAYMENTS", value: totals.payments, desc: "Paid registrations", icon: Receipt, iconBg: "bg-violet-600", gradient: "linear-gradient(135deg,#ffffff 50%,#ede9fe)", text: "text-violet-600", href: "/delegates/single/all" },
    { title: "TOTAL REVENUE", value: formatInr(totals.revenue), desc: "From all registrations", icon: IndianRupee, iconBg: "bg-emerald-600", gradient: "linear-gradient(135deg,#ffffff 50%,#d1fae5)", text: "text-emerald-600", href: "/delegates/single/all" },
    { title: "COUPONS USED", value: totals.coupons, desc: "Registrations with a coupon", icon: BadgePercent, iconBg: "bg-rose-600", gradient: "linear-gradient(135deg,#ffffff 50%,#ffe4e6)", text: "text-rose-600", href: "/coupons" },
    { title: "WEBSITE", value: totals.website, desc: "Registered on the website", icon: Globe, iconBg: "bg-amber-500", gradient: "linear-gradient(135deg,#ffffff 50%,#fef3c7)", text: "text-amber-600", href: "/delegates/single/all" },
    { title: "CRM / ADMIN", value: delegates.length - totals.website, desc: "Added from CRM / admin", icon: Laptop, iconBg: "bg-cyan-600", gradient: "linear-gradient(135deg,#ffffff 50%,#cffafe)", text: "text-cyan-600", href: "/add-registration" },
    { title: "TOTAL DELEGATES", value: delegates.length, desc: "Verified registrations", icon: Users, iconBg: "bg-fuchsia-600", gradient: "linear-gradient(135deg,#ffffff 50%,#fae8ff)", text: "text-fuchsia-600", href: "/delegates/single/all" },
  ];

  const th = "whitespace-nowrap px-[10px] py-[6px] text-[7.5px] font-bold text-white uppercase tracking-wide";

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col gap-[12px] px-[18px] pb-[16px] pt-[14px]">
        {/* HEADER */}
        <div className="border-b-[2px] border-[#293681] pb-[10px]">
          <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#4B1426]">Delegates Overview</h1>
          <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
            Verified delegate registrations from the website and CRM — single and group, day by day (21–23 August 2026).
          </p>
        </div>

        {loadError && (
          <div className="rounded-[6px] border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">{loadError}</div>
        )}

        {/* TOP CARDS */}
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {topCards.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group relative overflow-hidden rounded-[10px] border border-slate-200 p-3 transition-all hover:-translate-y-[1px]"
                style={{ background: item.gradient, boxShadow: CARD_SHADOW }}
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`grid h-[28px] w-[28px] place-items-center rounded-[7px] shadow-sm transition group-hover:scale-105 ${item.iconBg}`}>
                      <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                    </div>
                    <p className="text-[8.5px] font-bold uppercase tracking-wide text-gray-900">{item.title}</p>
                  </div>
                  <span className={`rounded-[5px] border-2 bg-white/70 px-1.5 text-[8px] font-bold ${item.text} ${item.iconBg.replace("bg-", "border-")}`}>
                    {index + 1}
                  </span>
                </div>
                <p className={`text-[18px] font-extrabold leading-none ${item.text}`}>{loading ? "…" : item.value}</p>
                <p className="mt-1 text-[8.5px] font-medium text-black/80">{item.desc}</p>
              </Link>
            );
          })}
        </div>

        {/* TODAY / THIS WEEK / CUSTOM RANGE */}
        <div className="grid gap-2.5 md:grid-cols-3">
          <PeriodPanel heading={`TODAY (${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" })})`} stats={periods.today} />
          <PeriodPanel heading="THIS WEEK" stats={periods.week} />
          <PeriodPanel
            heading={
              <span className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={rangeStart}
                  max={rangeEnd}
                  onChange={(e) => e.target.value && setRangeStart(e.target.value)}
                  className="cursor-pointer rounded-[4px] border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 outline-none"
                />
                <span className="text-[9px] font-medium text-slate-400">to</span>
                <input
                  type="date"
                  value={rangeEnd}
                  min={rangeStart}
                  onChange={(e) => e.target.value && setRangeEnd(e.target.value)}
                  className="cursor-pointer rounded-[4px] border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 outline-none"
                />
              </span>
            }
            stats={periods.custom}
          />
        </div>

        {/* CHARTS */}
        <div className="grid gap-2.5 lg:grid-cols-2">
          <ChartCard title="Registration Trends (last 6 months)" icon={TrendingUp} iconClass="bg-sky-100 text-sky-700">
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="singleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="groupGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={AXIS_TICK} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={AXIS_TICK} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600 }} />
                <Area type="monotone" dataKey="single" name="Single" stroke="#0284c7" strokeWidth={2.5} fill="url(#singleGradient)" />
                <Area type="monotone" dataKey="group" name="Group" stroke="#f97316" strokeWidth={2.5} fill="url(#groupGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Revenue Growth (last 6 months)" icon={IndianRupee} iconClass="bg-violet-100 text-violet-700">
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={trend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={AXIS_TICK} />
                <YAxis axisLine={false} tickLine={false} tick={AXIS_TICK} tickFormatter={(v: number) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => formatInr(v)} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Registration Distribution" icon={PieChartIcon} iconClass="bg-emerald-100 text-emerald-700">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={totals.single + totals.group ? distribution : [{ name: "No registrations", value: 1, color: "#e2e8f0" }]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={48}
                  dataKey="value"
                  paddingAngle={4}
                  label={totals.single + totals.group ? ({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%` : false}
                  labelLine={false}
                >
                  {(totals.single + totals.group ? distribution : [{ color: "#e2e8f0" }]).map((v, i) => (
                    <Cell key={i} fill={v.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-1 flex flex-wrap justify-center gap-2 border-t border-slate-100 pt-2">
              {distribution.map((v) => (
                <span key={v.name} className="flex items-center gap-1.5 rounded-[6px] border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-bold text-slate-800">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                  {v.name}: {v.value}
                </span>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Expected Attendance per Day" icon={CalendarDays} iconClass="bg-orange-100 text-orange-700">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={footfall} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={AXIS_TICK} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={AXIS_TICK} />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={TOOLTIP_STYLE}
                  labelFormatter={(label: string) => `${label} · ${footfall.find((f) => f.day === label)?.date ?? ""}`}
                />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600 }} />
                <Bar dataKey="single" name="Single" stackId="a" fill="#0284c7" maxBarSize={48} />
                <Bar dataKey="group" name="Group" stackId="a" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* TYPE × DAY BREAKDOWN */}
        <div className="overflow-hidden rounded-[7px] border border-[#e8e5df] bg-white">
          <div className="border-b border-[#e8e5df] px-[16px] py-[10px]">
            <h2 className="text-[11px] font-bold text-[#18233b]">Registrations by Pass</h2>
            <p className="text-[8.5px] font-medium text-[#6c7587]">
              Same lists as the Single / Group Registration menus. All Days = multi-day passes; Day 1–3 = one-day passes.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="h-[32px] bg-[#111844]">
                  <th className={th}>Registration</th>
                  {DAY_FILTERS.map((f) => (
                    <th key={f} className={th}>
                      {f === "all" ? "All Days" : `Day ${f.slice(4)} · ${CONFERENCE_DAYS[Number(f.slice(4)) as 1 | 2 | 3]}`}
                    </th>
                  ))}
                  <th className={th}>Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0ec]">
                {TYPES.map(({ key, label, icon: Icon }) => {
                  const total = DAY_FILTERS.reduce((s, f) => s + (matrix[key]?.[f]?.count ?? 0), 0);
                  const totalRevenue = DAY_FILTERS.reduce((s, f) => s + (matrix[key]?.[f]?.revenue ?? 0), 0);
                  return (
                    <tr key={key} className="transition hover:bg-slate-50/80">
                      <td className="px-[10px] py-[9px]">
                        <span className="flex items-center gap-1.5 text-[9.5px] font-bold text-[#4B1426]">
                          <Icon className="h-3 w-3" />
                          {label}
                        </span>
                      </td>
                      {DAY_FILTERS.map((f) => {
                        const cell = matrix[key]?.[f] ?? { count: 0, revenue: 0 };
                        return (
                          <td key={f} className="px-[10px] py-[9px]">
                            <Link href={`/delegates/${key}/${f}`} className="group inline-flex flex-col">
                              <span className="text-[13px] font-bold leading-none text-[#166b40] group-hover:underline">{loading ? "…" : cell.count}</span>
                              <span className="mt-0.5 text-[8px] font-semibold text-[#6c7587]">{formatInr(cell.revenue)}</span>
                            </Link>
                          </td>
                        );
                      })}
                      <td className="px-[10px] py-[9px]">
                        <span className="text-[13px] font-bold leading-none text-[#18233b]">{loading ? "…" : total}</span>
                        <span className="mt-0.5 block text-[8px] font-semibold text-[#6c7587]">{formatInr(totalRevenue)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* LATEST REGISTRATIONS */}
        <div className="overflow-hidden rounded-[7px] border border-[#e8e5df] bg-white">
          <div className="border-b border-[#e8e5df] px-[16px] py-[10px]">
            <h2 className="text-[11px] font-bold text-[#18233b]">Latest Registrations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead>
                <tr className="h-[32px] bg-[#111844]">
                  <th className={`${th} w-[36px]`}>S.No</th>
                  <th className={th}>Name</th>
                  <th className={th}>Email</th>
                  <th className={th}>Mobile</th>
                  <th className={th}>Type</th>
                  <th className={th}>Day(s)</th>
                  <th className={th}>Price</th>
                  <th className={th}>Received</th>
                  <th className={`${th} text-right`}>List</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0ec]">
                {loading ? (
                  <tr><td colSpan={9} className="py-10 text-center text-[10px] text-[#6c7587]">Loading delegates…</td></tr>
                ) : delegates.length === 0 ? (
                  <tr><td colSpan={9} className="py-10 text-center text-[10px] text-[#6c7587]">No registrations yet.</td></tr>
                ) : (
                  delegates.slice(0, 8).map((d, i) => (
                    <tr key={d._id} className="transition hover:bg-slate-50/80">
                      <td className="px-[10px] py-[8px] text-[9px] font-semibold text-[#6c7587]">{i + 1}</td>
                      <td className="whitespace-nowrap px-[10px] py-[8px] text-[9px] font-bold text-[#4B1426]">{[d.title, d.fullName].filter(Boolean).join(" ")}</td>
                      <td className="px-[10px] py-[8px] text-[9px] font-medium text-[#334155]">{d.email}</td>
                      <td className="px-[10px] py-[8px] text-[9px] font-bold text-[#166534]">{d.whatsappNumber || d.mobile || "—"}</td>
                      <td className="px-[10px] py-[8px] text-[8.5px] font-bold uppercase text-[#334155]">{d.registrationType}</td>
                      <td className="whitespace-nowrap px-[10px] py-[8px] text-[9px] font-semibold text-[#334155]">{daysLabel(d.days)}</td>
                      <td className="px-[10px] py-[8px] text-[9px] font-bold text-[#15803d]">{d.price || "—"}</td>
                      <td className="whitespace-nowrap px-[10px] py-[8px] text-[8.5px] font-medium text-[#6c7587]">{formatDateTime(d.createdAt)}</td>
                      <td className="px-[10px] py-[8px] text-right">
                        <Link href={listHref(d)} className="inline-flex items-center gap-1 text-[8.5px] font-bold text-[#166b40] hover:underline">
                          Open <ArrowRight className="h-2.5 w-2.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
