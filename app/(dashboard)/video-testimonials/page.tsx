"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  ExternalLink,
  Eye,
  EyeOff,
  Instagram,
  Loader2,
  Pencil,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  UploadCloud,
  Youtube,
} from "lucide-react";
import typography from "../pages/PagesTypography.module.css";
import Modal from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { CloudImageField } from "@/components/cms/editor/CloudImageField";
import { showError, showSuccess, lazySwal } from "@/lib/toast";
import { ApiRequestError } from "@/lib/api";
import {
  videoTestimonialsApi,
  videoThumbnail,
  videoEmbedUrl,
  VideoSource,
  VideoStatus,
  VideoTestimonial,
  VideoTestimonialInput,
} from "@/lib/videoTestimonialsApi";

/* =========================================================
   VIDEO TESTIMONIALS — the video carousel of the website home page
   (Testimonials section). Saved to backend-arogya, the same records
   admin-arogya edits; only "Published" videos show on the website.
   Same layout as Testimonials Management.
========================================================= */

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3000";
const PAGE_SIZE = 8;

/* Each source has its own colour: badge in the table, and idle / selected styles for the form buttons */
const SOURCES: { value: VideoSource; label: string; Icon: typeof Youtube; badge: string; idle: string; active: string }[] = [
  {
    value: "YOUTUBE", label: "YouTube", Icon: Youtube,
    badge: "bg-red-50 text-red-700 border-red-200",
    idle: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
    active: "border-red-600 bg-red-600 text-white shadow-[0_4px_12px_rgba(220,38,38,0.35)]",
  },
  {
    value: "UPLOAD", label: "Upload", Icon: UploadCloud,
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    idle: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100",
    active: "border-sky-600 bg-sky-600 text-white shadow-[0_4px_12px_rgba(2,132,199,0.35)]",
  },
  {
    value: "INSTAGRAM", label: "Instagram", Icon: Instagram,
    badge: "bg-pink-50 text-pink-700 border-pink-200",
    idle: "border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100",
    active: "border-pink-600 bg-gradient-to-r from-[#833ab4] via-[#e1306c] to-[#f77737] text-white shadow-[0_4px_12px_rgba(225,48,108,0.35)]",
  },
];
const SOURCE_BY_VALUE = Object.fromEntries(SOURCES.map((s) => [s.value, s]));

const STATUS_STYLE: Record<VideoStatus, string> = {
  Published: "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]",
  Hidden: "bg-[#ffebee] text-[#c62828] border border-[#ef9a9a]",
};

const LINK_RULES: Record<VideoSource, { test: RegExp; message: string; placeholder: string }> = {
  YOUTUBE: { test: /^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//, message: "Paste a YouTube link (https://youtube.com/... or https://youtu.be/...).", placeholder: "https://youtu.be/... or https://youtube.com/shorts/..." },
  INSTAGRAM: { test: /^https:\/\/(www\.)?instagram\.com\//, message: "Paste an Instagram link (https://www.instagram.com/...).", placeholder: "https://www.instagram.com/reel/..." },
  UPLOAD: { test: /^https:\/\//, message: "Upload the video file first.", placeholder: "" },
};

const EMPTY_FORM: VideoTestimonialInput = {
  name: "",
  designation: "",
  organization: "",
  sourceType: "YOUTUBE",
  videoUrl: "",
  thumbnail: "",
  status: "Published",
};

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function SourceBadge({ source }: { source: VideoSource }) {
  const s = SOURCE_BY_VALUE[source] ?? SOURCES[0];
  return (
    <span className={`inline-flex items-center gap-1 rounded-[4px] border px-[6px] py-[2px] text-[7.5px] font-bold uppercase ${s.badge}`}>
      <s.Icon className="h-3 w-3" /> {s.label}
    </span>
  );
}

function Thumb({ video, className }: { video: Pick<VideoTestimonial, "thumbnail" | "sourceType" | "videoUrl" | "name">; className: string }) {
  const src = videoThumbnail(video);
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-[5px] bg-[#0b1f17] ${className}`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={video.name} className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full w-full place-items-center text-white/60"><Clapperboard className="h-4 w-4" /></div>
      )}
      <PlayCircle className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow" />
    </div>
  );
}

/** Upload button for the "Upload" source — sends the file to Cloudinary through the backend */
function VideoFileUpload({ value, onUploaded }: { value: string; onUploaded: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await videoTestimonialsApi.uploadVideo(file);
      onUploaded(res.url);
      showSuccess(`Video uploaded to Cloudinary (${res.fileSize}).`);
    } catch (err) {
      showError(err instanceof ApiRequestError ? err.message : "Video upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#18233b]">
        Video File <span className="text-red-500">*</span>
      </span>
      <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      <div className="flex items-center gap-3">
        <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()}
          className="inline-flex h-[34px] items-center gap-[6px] border border-[#0f766e] bg-[#f0fdfa] px-[12px] text-[11px] font-semibold text-[#0f766e] hover:bg-[#ccfbf1] disabled:opacity-60">
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
          {uploading ? "Uploading video..." : value ? "Replace Video" : "Upload Video"}
        </button>
        <span className="text-[10px] text-[#64748b]">MP4, WEBM or MOV · up to 50 MB</span>
      </div>
      {value && (
        <video src={value} controls className="mt-2 max-h-[160px] w-full rounded-[6px] bg-black" />
      )}
    </div>
  );
}

export default function VideoTestimonialsPage() {
  const [items, setItems] = useState<VideoTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | VideoStatus>("All");
  const [sourceFilter, setSourceFilter] = useState<"All" | VideoSource>("All");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VideoTestimonialInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    videoTestimonialsApi
      .list()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setItems(list);
        setSelectedId((prev) => (prev && list.some((v) => v._id === prev) ? prev : list[0]?._id ?? null));
      })
      .catch((err) => showError(err instanceof ApiRequestError ? err.message : "Failed to load video testimonials."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => ({
    total: items.length,
    published: items.filter((v) => v.status === "Published").length,
    hidden: items.filter((v) => v.status === "Hidden").length,
    youtube: items.filter((v) => v.sourceType === "YOUTUBE").length,
  }), [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((v) => {
      if (statusFilter !== "All" && v.status !== statusFilter) return false;
      if (sourceFilter !== "All" && v.sourceType !== sourceFilter) return false;
      if (!q) return true;
      return [v.name, v.designation, v.organization].some((x) => (x || "").toLowerCase().includes(q));
    });
  }, [items, query, statusFilter, sourceFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);
  const selected = items.find((v) => v._id === selectedId) ?? null;

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("All");
    setSourceFilter("All");
    setPage(1);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (v: VideoTestimonial) => {
    setEditingId(v._id);
    setForm({
      name: v.name.trim(),
      designation: v.designation || "",
      organization: v.organization || "",
      sourceType: v.sourceType || "YOUTUBE",
      videoUrl: v.videoUrl || "",
      thumbnail: v.thumbnail || "",
      status: v.status || "Published",
    });
    setError("");
    setModalOpen(true);
  };

  /** Switching the source clears a link that belongs to another source */
  const changeSource = (sourceType: VideoSource) =>
    setForm((prev) => ({ ...prev, sourceType, videoUrl: LINK_RULES[sourceType].test.test(prev.videoUrl) && sourceType !== "UPLOAD" ? prev.videoUrl : "" }));

  const handleSave = async () => {
    const input: VideoTestimonialInput = {
      ...form,
      name: form.name.trim(),
      designation: form.designation.trim(),
      organization: form.organization.trim(),
      videoUrl: form.videoUrl.trim(),
    };
    if (!input.name) return setError("Speaker name is required.");
    if (!input.videoUrl || !LINK_RULES[input.sourceType].test.test(input.videoUrl)) return setError(LINK_RULES[input.sourceType].message);

    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await videoTestimonialsApi.update(editingId, input);
        showSuccess(`Video by "${input.name}" updated.`);
      } else {
        const created = await videoTestimonialsApi.create(input);
        setSelectedId(created._id);
        showSuccess(`Video by "${input.name}" added.`);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save this video.";
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (v: VideoTestimonial, status: VideoStatus) => {
    setItems((prev) => prev.map((x) => (x._id === v._id ? { ...x, status } : x)));
    try {
      await videoTestimonialsApi.update(v._id, { status });
      showSuccess(`"${v.name.trim()}" is now ${status}.`);
    } catch (err) {
      showError(err instanceof ApiRequestError ? err.message : "Failed to update the status.");
      load();
    }
  };

  const handleDelete = async (v: VideoTestimonial) => {
    const confirm = await lazySwal.fire({
      title: `Delete video by "${v.name.trim()}"?`,
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
      await videoTestimonialsApi.remove(v._id);
      showSuccess("Video testimonial deleted.");
      if (selectedId === v._id) setSelectedId(null);
      load();
    } catch (err) {
      showError(err instanceof ApiRequestError ? err.message : "Could not delete this video.");
    }
  };

  const statCards = [
    { title: "TOTAL VIDEOS", value: counts.total, icon: Clapperboard, ring: "bg-emerald-50 text-emerald-700 ring-emerald-200", gradient: "linear-gradient(135deg,#ffffff 0%,#ffffff 42%,#bbf7d0 100%)", num: "#15803d", footer: "View all", onClick: clearFilters },
    { title: "PUBLISHED", value: counts.published, icon: CheckCircle2, ring: "bg-violet-50 text-violet-700 ring-violet-200", gradient: "linear-gradient(135deg,#ffffff 0%,#ffffff 42%,#ddd6fe 100%)", num: "#6d28d9",
      footer: counts.total ? `${((counts.published / counts.total) * 100).toFixed(1)}% of total` : "View published", onClick: () => { setStatusFilter("Published"); setPage(1); } },
    { title: "HIDDEN", value: counts.hidden, icon: EyeOff, ring: "bg-rose-50 text-rose-700 ring-rose-200", gradient: "linear-gradient(135deg,#ffffff 0%,#ffffff 42%,#fecdd3 100%)", num: "#be123c", footer: "View hidden", onClick: () => { setStatusFilter("Hidden"); setPage(1); } },
    { title: "FROM YOUTUBE", value: counts.youtube, icon: Youtube, ring: "bg-amber-50 text-amber-700 ring-amber-200", gradient: "linear-gradient(135deg,#ffffff 0%,#ffffff 42%,#fed7aa 100%)", num: "#c2410c", footer: "View YouTube", onClick: () => { setSourceFilter("YOUTUBE"); setPage(1); } },
  ];

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* TOP HEADING */}
        <div className="mb-[14px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#4B1426]" style={{ color: "#4B1426" }}>
              Video Testimonials
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              YouTube, Instagram or uploaded videos for the website testimonials carousel — only Published videos appear on the website.
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
              <Plus className="h-[12px] w-[12px]" strokeWidth={1.7} /> Add Video
            </button>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {statCards.map(({ title, value, icon: Icon, ring, gradient, num, footer, onClick }) => (
            <div key={title} className="relative flex h-[92px] flex-col overflow-hidden rounded-[11px] border border-[#e5e7e6] bg-white p-2"
              style={{ background: gradient, boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(27,31,35,0.15) 0px 0px 0px 1px" }}>
              <div className="flex items-start gap-1.5">
                <div className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-white/80 ring-1 ${ring}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[8.5px] font-semibold tracking-[0.01em] text-slate-900">{title}</p>
                  <span className="mt-1.5 block text-[21px] font-semibold leading-none tracking-[-0.04em]" style={{ color: num }}>{loading ? "…" : value}</span>
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
                  placeholder="Search videos by speaker, designation or organisation..."
                  className="h-[34px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] pr-[36px] text-[10px] font-semibold text-[#273655] outline-none placeholder:text-[#8b95a7] focus:border-[#293681]" />
              </label>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
                className="h-[34px] min-w-[110px] cursor-pointer rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none">
                <option value="All">All Status</option>
                <option value="Published">Published</option>
                <option value="Hidden">Hidden</option>
              </select>
              <select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value as typeof sourceFilter); setPage(1); }}
                className="h-[34px] min-w-[110px] cursor-pointer rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none">
                <option value="All">All Sources</option>
                {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
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
                      {["#", "Video", "Source", "Status", "Added On", "Actions"].map((h, i, all) => (
                        <th key={h} className={`px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white ${i === 0 ? "rounded-tl-[6px]" : ""} ${i === all.length - 1 ? "rounded-tr-[6px] text-right" : ""}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0ec]">
                    {loading ? (
                      <tr><td colSpan={6} className="py-12 text-center">
                        <div className="flex items-center justify-center gap-2 text-[11px] text-[#6c7587]">
                          <Loader2 className="h-4 w-4 animate-spin text-[#293681]" /> Loading video testimonials...
                        </div>
                      </td></tr>
                    ) : rows.length === 0 ? (
                      <tr><td colSpan={6} className="py-12 text-center text-[10px] text-[#6c7587]">
                        {items.length ? "No videos match your filters." : 'No video testimonials yet. Click "Add Video" to create one.'}
                      </td></tr>
                    ) : (
                      rows.map((v, idx) => (
                        <tr key={v._id} onClick={() => setSelectedId(v._id)}
                          className={`cursor-pointer transition hover:bg-slate-50/80 ${selectedId === v._id ? "bg-[#f4faf6]" : ""}`}>
                          <td className="px-[12px] py-[8px] text-[8.5px] font-semibold text-[#293681]">{start + idx + 1}</td>
                          <td className="px-[12px] py-[8px]">
                            <div className="flex min-w-[260px] items-center gap-[10px]">
                              <Thumb video={v} className="h-[38px] w-[64px]" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[10.5px] font-bold" style={{ color: "#4B1426" }}>{v.name}</p>
                                <p className="truncate text-[8px] font-semibold text-[#0A7C6E]">
                                  {[v.designation, v.organization].filter(Boolean).join(" · ") || "—"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-[12px] py-[8px]"><SourceBadge source={v.sourceType} /></td>
                          <td className="px-[12px] py-[8px]">
                            <select key={`${v._id}-${v.status}`} value={v.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleStatusChange(v, e.target.value as VideoStatus)}
                              className={`h-[24px] cursor-pointer appearance-none rounded-[4px] bg-[right_6px_center] bg-no-repeat px-[8px] pr-[22px] text-[8px] font-bold shadow-xs outline-none ${STATUS_STYLE[v.status]}`}
                              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}>
                              <option value="Published" className="bg-white font-bold text-slate-800">Published</option>
                              <option value="Hidden" className="bg-white font-bold text-slate-800">Hidden</option>
                            </select>
                          </td>
                          <td className="whitespace-nowrap px-[12px] py-[8px]">
                            <div className="flex flex-col leading-tight">
                              <span className="text-[9px] font-semibold text-[#334155]">{formatDate(v.createdAt)}</span>
                              <span className="mt-0.5 text-[8px] font-medium text-[#dc2626]">{v.updatedBy ? `By ${v.updatedBy}` : "By Admin"}</span>
                            </div>
                          </td>
                          <td className="px-[12px] py-[8px] text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button type="button" title="Preview" onClick={(e) => { e.stopPropagation(); setSelectedId(v._id); }}
                                className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-orange-400/30 bg-orange-500/10 text-orange-600 transition hover:scale-105 hover:bg-orange-500/20">
                                <Eye className="h-[12px] w-[12px]" />
                              </button>
                              <button type="button" title="Edit" onClick={(e) => { e.stopPropagation(); openEdit(v); }}
                                className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-blue-400/30 bg-blue-500/10 text-blue-600 transition hover:scale-105 hover:bg-blue-500/20">
                                <Pencil className="h-[12px] w-[12px]" />
                              </button>
                              <button type="button" title="Delete" onClick={(e) => { e.stopPropagation(); handleDelete(v); }}
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
                    Showing <strong>{start + 1}</strong> to <strong>{Math.min(start + PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong> videos
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
            <section className="rounded-[8px] border border-[#e2e8f0] bg-white px-[14px] py-[13px]">
              <h2 className="text-[12px] font-bold text-[#4B1426]">Video Preview</h2>
              {selected ? (
                <div className="mt-[10px]">
                  <div className="overflow-hidden rounded-[8px] border border-[#e4e7eb] bg-black">
                    {selected.sourceType === "UPLOAD" ? (
                      <video key={selected._id} src={selected.videoUrl} controls poster={videoThumbnail(selected) || undefined} className="aspect-video w-full" />
                    ) : videoEmbedUrl(selected) ? (
                      <iframe key={selected._id} src={videoEmbedUrl(selected)} title={selected.name} allowFullScreen
                        className={`w-full ${selected.sourceType === "INSTAGRAM" ? "h-[360px] bg-white" : "aspect-video"}`} />
                    ) : (
                      <div className="grid aspect-video place-items-center text-[10px] text-white/70">Preview not available</div>
                    )}
                  </div>
                  <div className="mt-[10px] text-center">
                    <p className="text-[12px] font-bold text-[#4B1426]">{selected.name}</p>
                    <p className="text-[9px] font-semibold text-[#0A7C6E]">{selected.designation || "—"}</p>
                    {selected.organization && <p className="text-[8.5px] font-medium text-[#64748b]">{selected.organization}</p>}
                  </div>
                  <div className="mt-[10px] space-y-[6px] text-[9px]">
                    <p className="flex items-center justify-between">
                      <span className="font-semibold text-[#69758c]">Source:</span>
                      <SourceBadge source={selected.sourceType} />
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="font-semibold text-[#69758c]">Status:</span>
                      <span className={`rounded-[4px] px-[8px] py-[2px] text-[8.5px] font-bold ${STATUS_STYLE[selected.status]}`}>{selected.status}</span>
                    </p>
                    <p className="flex items-center justify-between gap-2">
                      <span className="shrink-0 font-semibold text-[#69758c]">Link:</span>
                      <a href={selected.videoUrl} target="_blank" rel="noreferrer" className="truncate font-semibold text-blue-600 hover:underline">{selected.videoUrl}</a>
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
                    <Clapperboard className="h-5 w-5" />
                  </div>
                  <p className="text-[11px] font-bold text-[#19274a]">No Video Selected</p>
                  <p className="mt-1 max-w-[210px] text-[8.5px] leading-relaxed text-[#69758c]">Select a video from the table to preview it.</p>
                </div>
              )}
            </section>

            <section className="rounded-[8px] border border-[#e2e8f0] bg-white px-[14px] py-[13px]">
              <h2 className="text-[12px] font-bold text-[#4B1426]">Quick Actions</h2>
              <div className="mt-[10px] flex flex-col gap-[6px]">
                <button type="button" onClick={openAdd} className="flex items-center justify-between rounded-[5px] border border-[#e2e8f0] px-[10px] py-[7px] text-[9.5px] font-semibold text-[#334155] hover:bg-slate-50">
                  <span className="flex items-center gap-2"><Plus className="h-3.5 w-3.5 text-[#1b5e20]" /> Add Video</span><ArrowRight className="h-3 w-3" />
                </button>
                <Link href="/testimonials" className="flex items-center justify-between rounded-[5px] border border-[#e2e8f0] px-[10px] py-[7px] text-[9.5px] font-semibold text-[#334155] hover:bg-slate-50">
                  <span className="flex items-center gap-2"><PlayCircle className="h-3.5 w-3.5 text-[#111844]" /> Written Testimonials</span><ArrowRight className="h-3 w-3" />
                </Link>
                <Link href="/pages/home/edit" className="flex items-center justify-between rounded-[5px] border border-[#e2e8f0] px-[10px] py-[7px] text-[9.5px] font-semibold text-[#334155] hover:bg-slate-50">
                  <span className="flex items-center gap-2"><Settings className="h-3.5 w-3.5 text-[#111844]" /> Video Heading & Button</span><ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </section>

            <section className="rounded-[8px] bg-gradient-to-br from-[#111844] to-[#1b5e20] px-[14px] py-[14px] text-white">
              <p className="text-[12px] font-bold">Hear it from those who experienced it.</p>
              <p className="mt-1 text-[9px] text-white/80">Add short videos from delegates and speakers to the website carousel.</p>
              <button type="button" onClick={openAdd} className="mt-3 inline-flex items-center gap-1.5 rounded-[5px] bg-white px-[10px] py-[6px] text-[9px] font-bold text-[#1b5e20] hover:bg-white/90">
                <Plus className="h-3 w-3" /> Add Video
              </button>
            </section>
          </aside>
        </section>
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Video Testimonial" : "Add Video"}
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
              {editingId ? "Save Changes" : "Add Video"}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Speaker Name" required placeholder="e.g. Dr. Garima Gupta" maxLength={60}
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Designation" placeholder="e.g. Public Health Expert" maxLength={60}
              value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Organisation" placeholder="Optional" maxLength={80}
              value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as VideoStatus })}>
              <option value="Published">Published (shown on website)</option>
              <option value="Hidden">Hidden</option>
            </Select>
          </div>

          <div>
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#18233b]">Source Type</span>
            <div className="grid grid-cols-3 gap-2">
              {SOURCES.map(({ value, label, Icon, idle, active }) => (
                <button key={value} type="button" onClick={() => changeSource(value)}
                  className={`flex h-[38px] items-center justify-center gap-2 rounded-[6px] border text-[12px] font-semibold transition ${
                    form.sourceType === value ? active : idle
                  }`}>
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
          </div>

          {form.sourceType === "UPLOAD" ? (
            <VideoFileUpload value={form.videoUrl} onUploaded={(url) => setForm((prev) => ({ ...prev, videoUrl: url }))} />
          ) : (
            <Input label="Video URL" required placeholder={LINK_RULES[form.sourceType].placeholder} maxLength={1000}
              value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              hint={form.sourceType === "YOUTUBE" ? "Normal videos and Shorts both work." : "Paste the link of the reel or post."} />
          )}

          <div className="rounded-[6px] border border-[#e2e8f0] bg-slate-50/50 p-3">
            <CloudImageField upload={videoTestimonialsApi.uploadThumbnail} label="Thumbnail (optional)" value={form.thumbnail}
              onChange={(v) => setForm({ ...form, thumbnail: v })} hint="Landscape image" previewClass="h-[56px] w-[96px]" />
            <p className="mt-1.5 text-[10px] text-[#64748b]">
              {form.sourceType === "YOUTUBE"
                ? "Leave empty to use YouTube's own thumbnail."
                : form.sourceType === "UPLOAD"
                  ? "Leave empty to use a frame from the uploaded video."
                  : "Instagram does not share thumbnails — add one so the card is not blank."}
            </p>
          </div>

          {error && <p className="text-[10px] font-semibold text-red-500">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
