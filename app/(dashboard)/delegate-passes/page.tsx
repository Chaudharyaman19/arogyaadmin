"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Ticket,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  Info,
  Star,
  Search,
} from "lucide-react";
import { showSuccess, showError, lazySwal } from "@/lib/toast";
import typography from "../pages/PagesTypography.module.css";
import Modal from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import {
  delegatePassesApi,
  DelegatePass,
  DelegatePassInput,
  PassApplicableTo,
  PassStatus,
} from "@/lib/delegatePassesApi";
import { ApiRequestError } from "@/lib/api";

const EMPTY_FORM = {
  name: "",
  price: "",
  daysText: "1 Day",
  applicableTo: "both" as PassApplicableTo,
  includesText: "",
  isMostPopular: false,
  status: "active" as PassStatus,
  order: "0",
};

const TYPE_OPTIONS: { value: PassApplicableTo; label: string }[] = [
  { value: "both", label: "Both (Single & Group)" },
  { value: "single", label: "Single Registration Only" },
  { value: "group", label: "Group Registration Only" },
];

const TYPE_BADGE: Record<PassApplicableTo, string> = {
  both: "bg-blue-50 text-blue-700 border-blue-200",
  single: "bg-purple-50 text-purple-700 border-purple-200",
  group: "bg-orange-50 text-orange-700 border-orange-200",
};

const TYPE_SHORT: Record<PassApplicableTo, string> = {
  both: "Single & Group",
  single: "Single Only",
  group: "Group Only",
};

const formatPrice = (value: number) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function DelegatePassesPage() {
  const [passes, setPasses] = useState<DelegatePass[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | PassApplicableTo>("");

  // Pagination (10 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Modal & Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    delegatePassesApi
      .list()
      .then((data) => setPasses(Array.isArray(data) ? data : []))
      .catch((err) => {
        const msg = err instanceof ApiRequestError ? err.message : "Failed to load delegate passes.";
        showError(msg);
        setPasses([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return passes.filter((p) => {
      if (typeFilter && p.applicableTo !== typeFilter) return false;
      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query) ||
        String(p.price).includes(query) ||
        (p.daysText || "").toLowerCase().includes(query)
      );
    });
  }, [passes, search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, filtered.length);
  const paginatedPasses = filtered.slice(startIndex, endIndex);
  const activeCount = passes.filter((p) => p.status === "active").length;

  const openNew = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, order: String(passes.length + 1) });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (pass: DelegatePass) => {
    setEditingId(pass._id);
    setForm({
      name: pass.name,
      price: String(pass.price ?? ""),
      daysText: pass.daysText || "1 Day",
      applicableTo: pass.applicableTo || "both",
      includesText: (pass.includes || []).join("\n"),
      isMostPopular: Boolean(pass.isMostPopular),
      status: pass.status || "active",
      order: String(pass.order ?? 0),
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    const price = Number(form.price);
    if (!form.name.trim()) {
      setError("Pass name is required.");
      return;
    }
    if (form.price.trim() === "" || !Number.isFinite(price) || price < 0) {
      setError("Enter a valid price (0 or more).");
      return;
    }

    const input: DelegatePassInput = {
      name: form.name.trim(),
      price,
      daysText: form.daysText.trim() || "1 Day",
      applicableTo: form.applicableTo,
      includes: form.includesText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      isMostPopular: form.isMostPopular,
      status: form.status,
      order: Math.max(0, Math.floor(Number(form.order) || 0)),
    };

    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await delegatePassesApi.update(editingId, input);
        showSuccess(`Pass "${input.name}" updated successfully!`);
      } else {
        await delegatePassesApi.create(input);
        showSuccess(`Pass "${input.name}" created successfully!`);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save this pass.";
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (pass: DelegatePass, newStatus: PassStatus) => {
    // Optimistic UI update
    setPasses((prev) => prev.map((p) => (p._id === pass._id ? { ...p, status: newStatus } : p)));

    try {
      await delegatePassesApi.update(pass._id, { status: newStatus });
      showSuccess(`Pass "${pass.name}" is now ${newStatus.toUpperCase()}.`);
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Failed to update pass status.";
      showError(msg);
      load();
    }
  };

  const handleDelete = async (pass: DelegatePass) => {
    const confirmResult = await lazySwal.fire({
      title: `Delete "${pass.name}"?`,
      text: "This pass will be removed from the website registration page. This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete Pass",
      cancelButtonText: "Cancel",
      background: "#1e2433",
      color: "#e2e8f0",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await delegatePassesApi.remove(pass._id);
      showSuccess(`Pass "${pass.name}" deleted.`);
      load();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not delete this pass.";
      showError(msg);
    }
  };

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* =================================================
            TOP HEADING — Matching Roles Page
        ================================================= */}
        <div className="mb-[14px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1
              className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#4B1426]"
              style={{ color: "#4B1426" }}
            >
              Delegate Pass Management
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Create and manage registration passes for delegate registrations. Select registration type, features, and highlight popular passes.
            </p>
          </div>

          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={openNew}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#1b5e20] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(27,94,32,0.25)] transition hover:bg-[#14491a]"
            >
              <Plus className="h-[12px] w-[12px]" strokeWidth={1.7} />
              Add Pass
            </button>
          </div>
        </div>

        {/* NOTE BANNER */}
        <div className="mb-[10px] flex items-start gap-[8px] rounded-[6px] border border-amber-200 bg-amber-50 px-[12px] py-[8px]">
          <Info className="mt-[1px] h-[13px] w-[13px] shrink-0 text-amber-600" />
          <p className="text-[8.5px] font-medium leading-[1.5] text-amber-800">
            <strong>Note:</strong> Passes configured here will automatically be displayed on the frontend registration page.
            You can set <strong>Included Features</strong> (one feature per line) and mark passes as{" "}
            <span className="font-bold text-[#1b5e20]">★ MOST POPULAR</span>. Only <strong>Active</strong> passes are shown on the website.
          </p>
        </div>

        {/* SEARCH & FILTER */}
        <div className="mb-[8px] flex flex-wrap items-center gap-[8px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-[8px] top-1/2 h-[11px] w-[11px] -translate-y-1/2 text-[#8a92a0]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, price or duration"
              className="h-[28px] w-[220px] rounded-[5px] border border-[#d8dce2] bg-white pl-[24px] pr-[8px] text-[8.5px] font-medium text-[#334155] outline-none placeholder:text-[#8a92a0] focus:border-[#293681]"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as "" | PassApplicableTo);
              setCurrentPage(1);
            }}
            className="h-[28px] cursor-pointer rounded-[5px] border border-[#d8dce2] bg-white px-[8px] text-[8.5px] font-medium text-[#334155] outline-none focus:border-[#293681]"
          >
            <option value="">All Registration Types</option>
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* =============================================
            PASSES TABLE
        ============================================= */}
        <div className="mt-[4px] flex min-h-0 flex-1 flex-col overflow-hidden rounded-[7px] border border-[#e8e5df] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="h-[32px] border-b border-[#e8e5df] bg-[#111844]">
                  <th className="rounded-tl-[6px] px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white">
                    Pass Name
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white">
                    Price
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white">
                    Duration
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white">
                    Registration Type
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white">
                    Included Features
                  </th>
                  <th className="px-[12px] py-[6px] text-center text-[8.5px] font-bold uppercase tracking-wider text-white">
                    Order
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white">
                    Status
                  </th>
                  <th className="rounded-tr-[6px] px-[12px] py-[6px] text-right text-[8.5px] font-bold uppercase tracking-wider text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0ec]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-[11px] text-[#6c7587]">
                        <Loader2 className="h-4 w-4 animate-spin text-[#293681]" />
                        <span>Loading passes...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[10px] text-[#6c7587]">
                      {passes.length === 0 ? "No delegate passes yet. Click \"Add Pass\" to create one." : "No passes match your search."}
                    </td>
                  </tr>
                ) : (
                  paginatedPasses.map((p) => (
                    <tr key={p._id} className="transition hover:bg-slate-50/80">
                      {/* PASS NAME */}
                      <td className="px-[12px] py-[8px]">
                        <div className="flex items-center gap-1.5">
                          <Ticket className="h-3 w-3 shrink-0 text-[#293681]" />
                          <span className="text-[8.5px] font-semibold text-[#4B1426]">{p.name}</span>
                          {p.isMostPopular && (
                            <span className="inline-flex items-center gap-0.5 rounded-[3px] border border-amber-200 bg-amber-50 px-1 py-0.5 text-[6.5px] font-bold text-amber-700">
                              <Star className="h-[7px] w-[7px] fill-amber-500 text-amber-500" />
                              MOST POPULAR
                            </span>
                          )}
                        </div>
                      </td>

                      {/* PRICE */}
                      <td className="px-[12px] py-[8px]">
                        <span className="text-[8.5px] font-bold text-[#1b5e20]">{formatPrice(p.price)}</span>
                      </td>

                      {/* DURATION */}
                      <td className="px-[12px] py-[8px]">
                        <span className="rounded-[4px] bg-[#f0f4f8] px-[6px] py-[2px] text-[7.5px] font-semibold text-[#233D4D]">
                          {p.daysText || "—"}
                        </span>
                      </td>

                      {/* REGISTRATION TYPE */}
                      <td className="px-[12px] py-[8px]">
                        <span
                          className={`inline-flex rounded-[4px] border px-[6px] py-[2px] text-[7.5px] font-bold ${TYPE_BADGE[p.applicableTo] ?? TYPE_BADGE.both}`}
                        >
                          {TYPE_SHORT[p.applicableTo] ?? TYPE_SHORT.both}
                        </span>
                      </td>

                      {/* FEATURES */}
                      <td className="px-[12px] py-[8px]">
                        {p.includes?.length ? (
                          <span
                            className="block max-w-[260px] truncate text-[8px] font-medium text-[#334155]"
                            title={p.includes.join("\n")}
                          >
                            {p.includes.join(" · ")}
                          </span>
                        ) : (
                          <span className="text-[8px] text-[#8a92a0]">—</span>
                        )}
                      </td>

                      {/* ORDER */}
                      <td className="px-[12px] py-[8px] text-center">
                        <span className="text-[8.5px] font-semibold text-[#334155]">{p.order ?? 0}</span>
                      </td>

                      {/* STATUS DROPDOWN — Active Green, Inactive Red */}
                      <td className="px-[12px] py-[8px]">
                        <select
                          key={`${p._id}-${p.status}`}
                          value={p.status}
                          onChange={(e) => handleStatusChange(p, e.target.value as PassStatus)}
                          className={`h-[24px] cursor-pointer appearance-none rounded-[4px] bg-[right_6px_center] bg-no-repeat px-[8px] pr-[22px] text-[8px] font-bold shadow-xs outline-none transition ${
                            p.status === "active"
                              ? "border border-[#a5d6a7] bg-[#e8f5e9] text-[#23714a]"
                              : "border border-[#fca5a5] bg-[#fee2e2] text-[#dc2626]"
                          }`}
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                          }}
                        >
                          <option value="active" className="bg-white font-bold text-[#23714a]">
                            ACTIVE
                          </option>
                          <option value="inactive" className="bg-white font-bold text-[#dc2626]">
                            INACTIVE
                          </option>
                        </select>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-[12px] py-[8px] text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Edit Pass"
                            onClick={() => openEdit(p)}
                            className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-blue-400/30 bg-blue-500/10 text-blue-600 shadow-[0_2px_6px_rgba(37,99,235,0.12)] backdrop-blur-md transition-all hover:scale-105 hover:border-blue-400/50 hover:bg-blue-500/20 hover:shadow-[0_3px_10px_rgba(37,99,235,0.25)] active:scale-95"
                          >
                            <Pencil className="h-[12px] w-[12px] text-blue-600" />
                          </button>

                          <button
                            type="button"
                            title="Delete Pass"
                            onClick={() => handleDelete(p)}
                            className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-red-400/30 bg-red-500/10 text-red-600 shadow-[0_2px_6px_rgba(220,38,38,0.12)] backdrop-blur-md transition-all hover:scale-105 hover:border-red-400/50 hover:bg-red-500/20 hover:shadow-[0_3px_10px_rgba(220,38,38,0.25)] active:scale-95"
                          >
                            <Trash2 className="h-[12px] w-[12px] text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Stats & Pagination (10 per page) */}
          {!loading && filtered.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8e5df] bg-[#fafafa] px-[12px] py-[6px] text-[8px]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#2563eb]">
                  Total Passes: <strong className="font-bold text-[#1d4ed8]">{passes.length}</strong>
                </span>
                <span className="font-semibold text-[#23714a]">
                  Active: <strong className="font-bold">{activeCount}</strong>
                </span>
                <span className="text-[7.5px] text-[#8a92a0]">
                  (Showing {startIndex + 1}–{endIndex} of {filtered.length})
                </span>
              </div>

              <div className="flex items-center gap-[4px]">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`flex h-[22px] min-w-[22px] items-center justify-center rounded-[4px] border px-1.5 text-[8px] font-bold transition ${
                      safePage === pageNum
                        ? "border-[#00291b] bg-[#00291b] text-white shadow-xs"
                        : "border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Next Page"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =============================================
          ADD / EDIT PASS MODAL — Matching Roles Modal
      ============================================= */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Delegate Pass" : "Add New Delegate Pass"}
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-95"
              style={{
                background: "#fff1f2",
                borderRadius: "4px",
                boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(220,38,38,0.15) 0px 0px 0px 1px",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: "#16a34a",
                borderRadius: "4px",
                boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(22,163,74,0.2) 0px 0px 0px 1px",
              }}
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editingId ? "Save Changes" : "Add Pass"}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Pass Name"
            required
            placeholder="e.g. DELEGATE PASS, PAPER PRESENTATION"
            value={form.name}
            maxLength={120}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price (₹)"
              required
              type="number"
              min={0}
              placeholder="1500"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <Input
              label="Days / Duration"
              placeholder="1 Day"
              value={form.daysText}
              maxLength={60}
              onChange={(e) => setForm({ ...form, daysText: e.target.value })}
            />
          </div>

          <Select
            label="Applicable Registration Type"
            value={form.applicableTo}
            onChange={(e) => setForm({ ...form, applicableTo: e.target.value as PassApplicableTo })}
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>

          <Textarea
            label="Included Features (Key Points)"
            rows={4}
            placeholder={"Full-day Access\nLunch & Refreshments\nConference Kit"}
            value={form.includesText}
            onChange={(e) => setForm({ ...form, includesText: e.target.value })}
            hint="One feature per line"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as PassStatus })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
            <Input
              label="Display Sort Order"
              type="number"
              min={0}
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />
          </div>

          <button
            type="button"
            onClick={() => setForm({ ...form, isMostPopular: !form.isMostPopular })}
            className={`flex w-full items-center gap-2 rounded-[6px] border px-3 py-2 text-left transition ${
              form.isMostPopular ? "border-amber-300 bg-amber-50" : "border-[#e2e8f0] bg-white hover:bg-slate-50"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border ${
                form.isMostPopular ? "border-amber-500 bg-amber-500 text-white" : "border-slate-300 bg-white"
              }`}
            >
              {form.isMostPopular && <Check className="h-3 w-3 stroke-[3]" />}
            </span>
            <span>
              <span className="block text-[11px] font-semibold text-[#334155]">Mark as ★ MOST POPULAR</span>
              <span className="block text-[10px] text-[#64748b]">Highlights this pass on the registration page.</span>
            </span>
          </button>

          {error && <p className="text-[10px] font-semibold text-red-500">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
