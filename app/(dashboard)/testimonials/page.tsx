"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  MessageCircleMore,
  MessageSquareQuote,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
} from "lucide-react";
import typography from "../pages/PagesTypography.module.css";
import Modal from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { CloudImageField } from "@/components/cms/editor/CloudImageField";
import { showError, showSuccess, lazySwal } from "@/lib/toast";
import { ApiRequestError } from "@/lib/api";
import {
  testimonialItemsApi,
  TestimonialItem,
  TestimonialItemInput,
  TestimonialStatus,
} from "@/lib/testimonialItemsApi";

/* =========================================================
   TESTIMONIALS MANAGEMENT — the testimonial cards of the website
   home page. Saved to backend-arogya; only "Published" cards show
   on the website. No photo = the website shows the initials.
   Layout follows the Bharat admin; colours follow Roles & Permissions.
========================================================= */

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3000";
const PAGE_SIZE = 8;
const STATUSES: TestimonialStatus[] = ["Published", "Pending Review", "Hidden"];

const COLOR_PRESETS = [
  { label: "Forest Green", value: "#1b5e20" },
  { label: "Burgundy", value: "#4B1426" },
  { label: "Navy", value: "#111844" },
  { label: "Ocean Blue", value: "#0284c7" },
  { label: "Saffron", value: "#d26019" },
  { label: "Gold", value: "#a07b30" },
  { label: "Teal", value: "#0f766e" },
  { label: "Royal Purple", value: "#7c3aed" },
];

const STATUS_STYLE: Record<TestimonialStatus, string> = {
  Published: "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]",
  "Pending Review": "bg-[#fff8e1] text-[#b78103] border border-[#ffe082]",
  Hidden: "bg-[#ffebee] text-[#c62828] border border-[#ef9a9a]",
};

const EMPTY_FORM: TestimonialItemInput = {
  name: "",
  designation: "",
  organization: "",
  feedback: "",
  status: "Published",
  image: "",
  imageAlt: "",
  color: "#1b5e20",
};

/** Same rule as the website: "Dr. Nitin Kumar" → "NK" */
const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const named = words.filter((w) => !["dr.", "dr", "mr.", "mr", "mrs.", "mrs", "ms.", "ms", "prof.", "prof"].includes(w.toLowerCase()));
  const target = named.length ? named : words;
  if (!target.length) return "";
  if (target.length === 1) return target[0].slice(0, 2).toUpperCase();
  return (target[0][0] + target[target.length - 1][0]).toUpperCase();
};

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function Avatar({ item, size = 32, textSize = 10.5 }: { item: Pick<TestimonialItem, "name" | "image" | "imageAlt" | "color">; size?: number; textSize?: number }) {
  if (item.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.image} alt={item.imageAlt || item.name} className="shrink-0 rounded-full border border-[#e4e7eb] object-cover"
        style={{ width: size, height: size }} />
    );
  }
  const tone = item.color || "#1b5e20";
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full border-[2px] border-white font-bold uppercase tracking-wider"
      style={{
        width: size,
        height: size,
        fontSize: textSize,
        color: tone,
        background: `linear-gradient(135deg, #ffffff 0%, ${tone}22 100%)`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 0 0 1.5px #e2e8f0",
      }}
    >
      {getInitials(item.name) || "?"}
    </div>
  );
}

const STAT_TONES = {
  green: { ring: "bg-emerald-50 text-emerald-700 ring-emerald-200", gradient: "linear-gradient(135deg,#ffffff 0%,#ffffff 42%,#bbf7d0 100%)", num: "#15803d" },
  violet: { ring: "bg-violet-50 text-violet-700 ring-violet-200", gradient: "linear-gradient(135deg,#ffffff 0%,#ffffff 42%,#ddd6fe 100%)", num: "#6d28d9" },
  amber: { ring: "bg-amber-50 text-amber-700 ring-amber-200", gradient: "linear-gradient(135deg,#ffffff 0%,#ffffff 42%,#fed7aa 100%)", num: "#c2410c" },
  rose: { ring: "bg-rose-50 text-rose-700 ring-rose-200", gradient: "linear-gradient(135deg,#ffffff 0%,#ffffff 42%,#fecdd3 100%)", num: "#be123c" },
} as const;

export default function TestimonialsPage() {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | TestimonialStatus>("All");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialItemInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const openedFromUrl = useRef(false);

  const load = () => {
    setLoading(true);
    testimonialItemsApi
      .list()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setItems(list);
        setSelectedId((prev) => (prev && list.some((t) => t._id === prev) ? prev : list[0]?._id ?? null));
      })
      .catch((err) => showError(err instanceof ApiRequestError ? err.message : "Failed to load testimonials."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  /* /testimonials?add=1 (the old "Add New Testimonial" page) opens the add form */
  useEffect(() => {
    if (!openedFromUrl.current && new URLSearchParams(window.location.search).get("add") === "1") {
      openedFromUrl.current = true;
      openAdd();
    }
  }, []);

  const counts = useMemo(() => {
    const by = (s: TestimonialStatus) => items.filter((t) => t.status === s).length;
    return { total: items.length, published: by("Published"), pending: by("Pending Review"), hidden: by("Hidden") };
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((t) => {
      if (statusFilter !== "All" && t.status !== statusFilter) return false;
      if (!q) return true;
      return [t.name, t.designation, t.organization, t.feedback].some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [items, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);
  const selected = items.find((t) => t._id === selectedId) ?? null;

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("All");
    setPage(1);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (item: TestimonialItem) => {
    setEditingId(item._id);
    setForm({
      name: item.name.trim(),
      designation: item.designation || "",
      organization: item.organization || "",
      feedback: item.feedback || "",
      status: item.status || "Published",
      image: item.image || "",
      imageAlt: item.imageAlt || "",
      color: item.color || "#1b5e20",
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    const input: TestimonialItemInput = {
      ...form,
      name: form.name.trim(),
      designation: form.designation.trim(),
      organization: form.organization.trim(),
      feedback: form.feedback.trim(),
      imageAlt: form.image ? form.imageAlt.trim() : "",
    };
    if (!input.name) return setError("Name is required.");
    if (input.feedback.length < 10) return setError("Testimonial text must be at least 10 characters.");
    if (input.image && !input.imageAlt) return setError("Enter the photo alt text.");

    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await testimonialItemsApi.update(editingId, input);
        showSuccess(`Testimonial by "${input.name}" updated.`);
      } else {
        const created = await testimonialItemsApi.create(input);
        setSelectedId(created._id);
        showSuccess(`Testimonial by "${input.name}" added.`);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save this testimonial.";
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (item: TestimonialItem, status: TestimonialStatus) => {
    setItems((prev) => prev.map((t) => (t._id === item._id ? { ...t, status } : t)));
    try {
      await testimonialItemsApi.update(item._id, { status });
      showSuccess(`"${item.name.trim()}" is now ${status}.`);
    } catch (err) {
      showError(err instanceof ApiRequestError ? err.message : "Failed to update the status.");
      load();
    }
  };

  const handleDelete = async (item: TestimonialItem) => {
    const confirm = await lazySwal.fire({
      title: `Delete testimonial by "${item.name.trim()}"?`,
      text: "It will be removed from the website. This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      background: "#1e2433",
      color: "#e2e8f0",
    });
    if (!confirm.isConfirmed) return;
    try {
      await testimonialItemsApi.remove(item._id);
      showSuccess("Testimonial deleted.");
      if (selectedId === item._id) setSelectedId(null);
      load();
    } catch (err) {
      showError(err instanceof ApiRequestError ? err.message : "Could not delete this testimonial.");
    }
  };

  const statCards = [
    { title: "TOTAL TESTIMONIALS", value: String(counts.total), icon: MessageSquareQuote, tone: STAT_TONES.green, footer: "View all", onClick: () => { clearFilters(); } },
    { title: "PUBLISHED", value: String(counts.published), icon: CheckCircle2, tone: STAT_TONES.violet,
      footer: counts.total ? `${((counts.published / counts.total) * 100).toFixed(1)}% of total` : "View published", onClick: () => { setStatusFilter("Published"); setPage(1); } },
    { title: "PENDING REVIEW", value: String(counts.pending), icon: Clock3, tone: STAT_TONES.amber, footer: "Review pending", onClick: () => { setStatusFilter("Pending Review"); setPage(1); } },
    { title: "HIDDEN", value: String(counts.hidden), icon: EyeOff, tone: STAT_TONES.rose, footer: "View hidden", onClick: () => { setStatusFilter("Hidden"); setPage(1); } },
  ];

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* TOP HEADING — Roles & Permissions colours */}
        <div className="mb-[14px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#4B1426]" style={{ color: "#4B1426" }}>
              Testimonials Management
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Manage what delegates and healthcare leaders say — only Published testimonials appear on the website.
            </p>
          </div>
          <div className="flex items-center gap-[10px]">
            <a href={WEBSITE_URL} target="_blank" rel="noreferrer"
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] border border-[#fed7aa] bg-[#fff7ed] px-[14px] text-[8.5px] font-semibold text-[#ea580c] shadow-sm transition hover:bg-[#ffedd5]">
              <ExternalLink className="h-[12px] w-[12px]" strokeWidth={1.7} /> View on Website
            </a>
            <Link href="/pages/home/edit"
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] border border-[#d8dce2] bg-white px-[14px] text-[8.5px] font-semibold text-[#334155] shadow-sm transition hover:bg-slate-50">
              <Settings className="h-[12px] w-[12px]" strokeWidth={1.7} /> Section Settings
            </Link>
            <button type="button" onClick={openAdd}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#1b5e20] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(27,94,32,0.25)] transition hover:bg-[#14491a]">
              <Plus className="h-[12px] w-[12px]" strokeWidth={1.7} /> Add New Testimonial
            </button>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {statCards.map(({ title, value, icon: Icon, tone, footer, onClick }) => (
            <div key={title} className="relative flex h-[92px] flex-col overflow-hidden rounded-[11px] border border-[#e5e7e6] bg-white p-2"
              style={{ background: tone.gradient, boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(27,31,35,0.15) 0px 0px 0px 1px" }}>
              <div className="flex items-start gap-1.5">
                <div className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-white/80 ring-1 ${tone.ring}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[8.5px] font-semibold tracking-[0.01em] text-slate-900">{title}</p>
                  <div className="mt-1.5 flex items-end gap-1">
                    <span className="text-[21px] font-semibold leading-none tracking-[-0.04em]" style={{ color: tone.num }}>{loading ? "…" : value}</span>
                  </div>
                </div>
              </div>
              <button type="button" onClick={onClick}
                className="absolute bottom-1.5 left-2 right-2 flex items-center justify-center gap-1 text-[8px] font-semibold text-[#293957] transition hover:text-blue-600">
                {footer} <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {/* MAIN SPLIT */}
        <section className="mt-[14px] grid items-start gap-[14px] xl:grid-cols-[minmax(0,1fr)_300px]">
          {/* LEFT: FILTERS + TABLE */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-[8px]">
              <label className="relative min-w-[200px] flex-1">
                <Search className="absolute right-[12px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#5d6b84]" />
                <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  placeholder="Search testimonials by name, role or keyword..."
                  className="h-[34px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] pr-[36px] text-[10px] font-semibold text-[#273655] outline-none placeholder:text-[#8b95a7] focus:border-[#293681]" />
              </label>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
                className="h-[34px] min-w-[120px] cursor-pointer rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none">
                <option value="All">All Status</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button type="button" onClick={clearFilters}
                className="inline-flex h-[34px] items-center gap-[6px] rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10px] font-semibold text-[#35445f] hover:bg-slate-50">
                <RefreshCw className="h-[13px] w-[13px]" /> Clear
              </button>
            </div>

            <div className="mt-[10px] flex flex-col overflow-hidden rounded-[7px] border border-[#e8e5df] bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] border-collapse text-left">
                  <thead>
                    <tr className="h-[32px] border-b border-[#e8e5df] bg-[#111844]">
                      {["#", "Testimonial", "Status", "Added On", "Actions"].map((h, i, all) => (
                        <th key={h} className={`px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white ${i === 0 ? "rounded-tl-[6px]" : ""} ${i === all.length - 1 ? "rounded-tr-[6px] text-right" : ""}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0ec]">
                    {loading ? (
                      <tr><td colSpan={5} className="py-12 text-center">
                        <div className="flex items-center justify-center gap-2 text-[11px] text-[#6c7587]">
                          <Loader2 className="h-4 w-4 animate-spin text-[#293681]" /> Loading testimonials...
                        </div>
                      </td></tr>
                    ) : rows.length === 0 ? (
                      <tr><td colSpan={5} className="py-12 text-center text-[10px] text-[#6c7587]">
                        {items.length ? "No testimonials match your filters." : 'No testimonials yet. Click "Add New Testimonial" to create one.'}
                      </td></tr>
                    ) : (
                      rows.map((item, idx) => (
                        <tr key={item._id} onClick={() => setSelectedId(item._id)}
                          className={`cursor-pointer transition hover:bg-slate-50/80 ${selectedId === item._id ? "bg-[#f4faf6]" : ""}`}>
                          <td className="px-[12px] py-[8px] text-[8.5px] font-semibold text-[#293681]">{start + idx + 1}</td>
                          <td className="px-[12px] py-[8px]">
                            <div className="flex min-w-[260px] items-start gap-[10px]">
                              <Avatar item={item} />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[10.5px] font-bold" style={{ color: "#4B1426" }}>{item.name}</p>
                                <p className="truncate text-[8px] font-semibold text-[#0A7C6E]">
                                  {[item.designation, item.organization].filter(Boolean).join(" · ") || "—"}
                                </p>
                                <p className="mt-[2px] line-clamp-1 max-w-[360px] text-[8.5px] text-[#475569]">{item.feedback}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-[12px] py-[8px]">
                            <select key={`${item._id}-${item.status}`} value={item.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleStatusChange(item, e.target.value as TestimonialStatus)}
                              className={`h-[24px] cursor-pointer appearance-none rounded-[4px] bg-[right_6px_center] bg-no-repeat px-[8px] pr-[22px] text-[8px] font-bold shadow-xs outline-none ${STATUS_STYLE[item.status]}`}
                              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}>
                              {STATUSES.map((s) => <option key={s} value={s} className="bg-white font-bold text-slate-800">{s}</option>)}
                            </select>
                          </td>
                          <td className="whitespace-nowrap px-[12px] py-[8px]">
                            <div className="flex flex-col leading-tight">
                              <span className="text-[9px] font-semibold text-[#334155]">{formatDate(item.createdAt)}</span>
                              <span className="mt-0.5 text-[8px] font-medium text-[#dc2626]">{item.updatedBy && item.updatedBy !== "seed" ? `By ${item.updatedBy}` : "By Admin"}</span>
                            </div>
                          </td>
                          <td className="px-[12px] py-[8px] text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button type="button" title="View Details" onClick={(e) => { e.stopPropagation(); setSelectedId(item._id); }}
                                className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-orange-400/30 bg-orange-500/10 text-orange-600 transition hover:scale-105 hover:bg-orange-500/20">
                                <Eye className="h-[12px] w-[12px]" />
                              </button>
                              <button type="button" title="Edit" onClick={(e) => { e.stopPropagation(); openEdit(item); }}
                                className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-blue-400/30 bg-blue-500/10 text-blue-600 transition hover:scale-105 hover:bg-blue-500/20">
                                <Pencil className="h-[12px] w-[12px]" />
                              </button>
                              <button type="button" title="Delete" onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                                className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-red-400/30 bg-red-500/10 text-red-600 transition hover:scale-105 hover:bg-red-500/20">
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

              {!loading && filtered.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8e5df] bg-[#fafafa] px-[12px] py-[6px] text-[8px]">
                  <span className="text-[#475569]">
                    Showing <strong>{start + 1}</strong> to <strong>{Math.min(start + PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong> testimonials
                  </span>
                  <div className="flex items-center gap-[4px]">
                    <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50 disabled:opacity-30">
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button key={n} type="button" onClick={() => setPage(n)}
                        className={`flex h-[22px] min-w-[22px] items-center justify-center rounded-[4px] border px-1.5 text-[8px] font-bold ${
                          safePage === n ? "border-[#00291b] bg-[#00291b] text-white" : "border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50"}`}>
                        {n}
                      </button>
                    ))}
                    <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50 disabled:opacity-30">
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-[12px]">
            {/* Details */}
            <section className="rounded-[8px] border border-[#e2e8f0] bg-white px-[14px] py-[13px]">
              <h2 className="text-[12px] font-bold text-[#4B1426]">Testimonial Details</h2>
              {selected ? (
                <div className="mt-[10px]">
                  <div className="flex flex-col items-center rounded-[8px] border border-[#e4e7eb] bg-[#fafbfc] p-4">
                    <Avatar item={selected} size={54} textSize={18} />
                    <p className="mt-2.5 text-center text-[12px] font-bold text-[#4B1426]">{selected.name}</p>
                    <p className="text-center text-[9px] font-semibold text-[#0A7C6E]">{selected.designation || "—"}</p>
                    {selected.organization && <p className="text-center text-[8.5px] font-medium text-[#64748b]">{selected.organization}</p>}
                  </div>
                  <div className="mt-[10px] rounded-[6px] border border-[#e2e8f0] bg-[#f8fafc] p-2.5 text-[8.5px] font-medium italic leading-[1.5] text-[#334155]">
                    &ldquo;{selected.feedback}&rdquo;
                  </div>
                  <div className="mt-[10px] space-y-[6px] text-[9px]">
                    <p className="flex items-center justify-between">
                      <span className="font-semibold text-[#69758c]">Status:</span>
                      <span className={`rounded-[4px] px-[8px] py-[2px] text-[8.5px] font-bold ${STATUS_STYLE[selected.status]}`}>{selected.status}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="font-semibold text-[#69758c]">On website:</span>
                      <span className="font-bold">{selected.image ? "Photo" : `Initials (${getInitials(selected.name)})`}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="font-semibold text-[#69758c]">Added on:</span>
                      <span className="font-semibold text-[#4B1426]">{formatDate(selected.createdAt)}</span>
                    </p>
                  </div>
                  <div className="mt-[12px] flex items-center gap-2 border-t border-[#f0f2f5] pt-3">
                    <button type="button" onClick={() => openEdit(selected)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[4px] border border-[#d8dce2] bg-white py-1.5 text-[8.5px] font-bold text-[#334155] hover:bg-slate-50">
                      <Pencil className="h-3 w-3 text-blue-600" /> Edit
                    </button>
                    <button type="button" onClick={() => handleStatusChange(selected, selected.status === "Published" ? "Hidden" : "Published")}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[4px] border border-[#d8dce2] bg-white py-1.5 text-[8.5px] font-bold text-[#334155] hover:bg-slate-50">
                      <RefreshCw className="h-3 w-3 text-emerald-600" /> {selected.status === "Published" ? "Hide" : "Publish"}
                    </button>
                    <button type="button" onClick={() => handleDelete(selected)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-[4px] border border-rose-200 bg-rose-50 py-1.5 text-[8.5px] font-bold text-rose-700 hover:bg-rose-100">
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <MessageCircleMore className="h-5 w-5" />
                  </div>
                  <p className="text-[11px] font-bold text-[#19274a]">No Testimonial Selected</p>
                  <p className="mt-1 max-w-[210px] text-[8.5px] leading-relaxed text-[#69758c]">Select a testimonial from the table to see its details.</p>
                </div>
              )}
            </section>

            {/* Quick actions */}
            <section className="rounded-[8px] border border-[#e2e8f0] bg-white px-[14px] py-[13px]">
              <h2 className="text-[12px] font-bold text-[#4B1426]">Quick Actions</h2>
              <div className="mt-[10px] flex flex-col gap-[6px]">
                <button type="button" onClick={openAdd} className="flex items-center justify-between rounded-[5px] border border-[#e2e8f0] px-[10px] py-[7px] text-[9.5px] font-semibold text-[#334155] hover:bg-slate-50">
                  <span className="flex items-center gap-2"><Plus className="h-3.5 w-3.5 text-[#1b5e20]" /> Add New Testimonial</span><ArrowRight className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => { setStatusFilter("Pending Review"); setPage(1); }} className="flex items-center justify-between rounded-[5px] border border-[#e2e8f0] px-[10px] py-[7px] text-[9.5px] font-semibold text-[#334155] hover:bg-slate-50">
                  <span className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 text-amber-600" /> Review Pending ({counts.pending})</span><ArrowRight className="h-3 w-3" />
                </button>
                <Link href="/pages/home/edit" className="flex items-center justify-between rounded-[5px] border border-[#e2e8f0] px-[10px] py-[7px] text-[9.5px] font-semibold text-[#334155] hover:bg-slate-50">
                  <span className="flex items-center gap-2"><Settings className="h-3.5 w-3.5 text-[#111844]" /> Section Headings & Stats</span><ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </section>

            {/* CTA card */}
            <section className="rounded-[8px] bg-gradient-to-br from-[#111844] to-[#1b5e20] px-[14px] py-[14px] text-white">
              <p className="text-[12px] font-bold">Real stories. Real impact.</p>
              <p className="mt-1 text-[9px] text-white/80">Share the voices that inspire trust in Arogya Sangoshthi.</p>
              <button type="button" onClick={openAdd} className="mt-3 inline-flex items-center gap-1.5 rounded-[5px] bg-white px-[10px] py-[6px] text-[9px] font-bold text-[#1b5e20] hover:bg-white/90">
                <Plus className="h-3 w-3" /> Add New Testimonial
              </button>
            </section>
          </aside>
        </section>
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Testimonial" : "Add New Testimonial"}
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)}
              className="inline-flex h-[32px] items-center px-[14px] text-[12px] font-semibold text-red-600 hover:bg-red-100"
              style={{ background: "#fff1f2", borderRadius: "4px", boxShadow: "rgba(220,38,38,0.15) 0px 0px 0px 1px" }}>
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={saving}
              className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
              style={{ background: "#1b5e20", borderRadius: "4px" }}>
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editingId ? "Save Changes" : "Add Testimonial"}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name" required placeholder="Dr. Nitin Kumar" maxLength={60}
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Designation" placeholder="Sr. Web Developer" maxLength={60}
              value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Organisation" placeholder="Optional" maxLength={80}
              value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TestimonialStatus })}>
              <option value="Published">Published (shown on website)</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Hidden">Hidden</option>
            </Select>
          </div>

          {/* Photo (optional) + initials badge */}
          <div className="rounded-[6px] border border-[#e2e8f0] bg-slate-50/50 p-3">
            <div className="mb-2 flex items-center gap-3">
              <Avatar item={form} size={46} textSize={15} />
              <p className="text-[10px] leading-relaxed text-[#475569]">
                <strong>Photo is optional.</strong> Without a photo the website shows the initials
                {form.name.trim() ? <> (<strong>{getInitials(form.name)}</strong>)</> : null} in the badge colour.
              </p>
            </div>
            {!form.image && (
              <div className="mb-3 flex flex-wrap items-center gap-[6px]">
                <span className="text-[10px] font-semibold text-[#334155]">Badge colour:</span>
                {COLOR_PRESETS.map((c) => (
                  <button key={c.value} type="button" title={c.label} onClick={() => setForm({ ...form, color: c.value })}
                    className={`h-[20px] w-[20px] rounded-full border-2 ${form.color === c.value ? "border-[#111844] ring-2 ring-offset-1 ring-[#111844]/30" : "border-white"}`}
                    style={{ background: c.value, boxShadow: "0 0 0 1px #cbd5e1" }} />
                ))}
              </div>
            )}
            <div className="grid grid-cols-[1.4fr_1fr] gap-3">
              <CloudImageField upload={testimonialItemsApi.upload} label="Photo (optional)" value={form.image}
                onChange={(v) => setForm({ ...form, image: v })} hint="Square photo works best" previewClass="h-[56px] w-[56px]" />
              <Input label="Photo Alt Text" required={Boolean(form.image)} placeholder="Describe the photo" maxLength={150}
                disabled={!form.image} value={form.imageAlt} onChange={(e) => setForm({ ...form, imageAlt: e.target.value })} />
            </div>
          </div>

          <Textarea label="Testimonial" required rows={4} maxLength={400}
            placeholder="What did they say about Arogya Sangoshthi?"
            value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })}
            hint={`${form.feedback.length} / 400 characters`} />

          {error && <p className="text-[10px] font-semibold text-red-500">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
