"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  TicketPercent,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Info,
  Search,
  RotateCcw,
} from "lucide-react";
import { showSuccess, showError, lazySwal } from "@/lib/toast";
import typography from "../pages/PagesTypography.module.css";
import Modal from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import {
  couponsApi,
  couponState,
  Coupon,
  CouponApplicableTo,
  CouponInput,
  CouponState,
} from "@/lib/couponsApi";
import { ApiRequestError } from "@/lib/api";

const EMPTY_FORM = {
  code: "",
  discountPercent: "",
  applicableTo: "both" as CouponApplicableTo,
  usageLimit: "1",
};

const TYPE_OPTIONS: { value: CouponApplicableTo; label: string }[] = [
  { value: "both", label: "Both (Single & Group)" },
  { value: "single", label: "Single Registration Only" },
  { value: "group", label: "Group Registration Only" },
];

const TYPE_BADGE: Record<CouponApplicableTo, string> = {
  both: "bg-blue-50 text-blue-700 border-blue-200",
  single: "bg-purple-50 text-purple-700 border-purple-200",
  group: "bg-orange-50 text-orange-700 border-orange-200",
};

const TYPE_SHORT: Record<CouponApplicableTo, string> = {
  both: "Single & Group",
  single: "Single Only",
  group: "Group Only",
};

const STATE_STYLE: Record<CouponState, string> = {
  active: "border border-[#a5d6a7] bg-[#e8f5e9] text-[#23714a]",
  inactive: "border border-[#fca5a5] bg-[#fee2e2] text-[#dc2626]",
  sold_out: "border border-[#fdba74] bg-[#fff7ed] text-[#c2410c]",
};

const STATE_LABEL: Record<CouponState, string> = {
  active: "ACTIVE",
  inactive: "INACTIVE",
  sold_out: "SOLD OUT",
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | CouponApplicableTo>("");

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
    couponsApi
      .list()
      .then((data) => setCoupons(Array.isArray(data) ? data : []))
      .catch((err) => {
        const msg = err instanceof ApiRequestError ? err.message : "Failed to load coupons.";
        showError(msg);
        setCoupons([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toUpperCase();
    return coupons.filter((c) => {
      if (typeFilter && c.applicableTo !== typeFilter) return false;
      return !query || c.code.toUpperCase().includes(query);
    });
  }, [coupons, search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, filtered.length);
  const paginatedCoupons = filtered.slice(startIndex, endIndex);
  const activeCount = coupons.filter((c) => couponState(c) === "active").length;
  const soldOutCount = coupons.filter((c) => couponState(c) === "sold_out").length;

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      discountPercent: String(coupon.discountPercent ?? ""),
      applicableTo: coupon.applicableTo || "both",
      usageLimit: String(coupon.usageLimit || 1),
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    const code = form.code.trim().toUpperCase();
    const discountPercent = Number(form.discountPercent);
    const usageLimit = Number(form.usageLimit);

    if (!code) {
      setError("Coupon code is required.");
      return;
    }
    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
      setError("Coupon code must be 3–30 characters: letters, numbers, - and _ only.");
      return;
    }
    if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 100) {
      setError("Discount must be a whole number between 1 and 100.");
      return;
    }
    if (!Number.isInteger(usageLimit) || usageLimit < 1) {
      setError("Usage limit must be at least 1.");
      return;
    }
    if (coupons.some((c) => c._id !== editingId && c.code.toUpperCase() === code)) {
      setError(`Coupon "${code}" already exists.`);
      return;
    }

    const input: CouponInput = { code, discountPercent, applicableTo: form.applicableTo, usageLimit };

    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await couponsApi.update(editingId, input);
        showSuccess(`Coupon "${code}" updated successfully!`);
      } else {
        await couponsApi.create(input);
        showSuccess(`Coupon "${code}" created successfully!`);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save this coupon.";
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleStateChange = async (coupon: Coupon, newState: CouponState) => {
    // Optimistic UI update
    setCoupons((prev) =>
      prev.map((c) =>
        c._id === coupon._id
          ? { ...c, isActive: newState !== "inactive", status: newState === "sold_out" ? "used" : "available" }
          : c,
      ),
    );

    try {
      await couponsApi.setState(coupon._id, newState);
      showSuccess(`Coupon "${coupon.code}" is now ${STATE_LABEL[newState]}.`);
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Failed to update coupon status.";
      showError(msg);
      load();
    }
  };

  const handleReset = async (coupon: Coupon) => {
    const confirmResult = await lazySwal.fire({
      title: `Reset "${coupon.code}"?`,
      text: `Usage count goes back to 0 and the coupon becomes available again for ${coupon.usageLimit} use(s).`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Reset Coupon",
      cancelButtonText: "Cancel",
      background: "#1e2433",
      color: "#e2e8f0",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await couponsApi.reset(coupon._id);
      showSuccess(`Coupon "${coupon.code}" reset to available.`);
      load();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not reset this coupon.";
      showError(msg);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    const confirmResult = await lazySwal.fire({
      title: `Delete "${coupon.code}"?`,
      text: "Delegates will no longer be able to use this coupon. This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete Coupon",
      cancelButtonText: "Cancel",
      background: "#1e2433",
      color: "#e2e8f0",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await couponsApi.remove(coupon._id);
      showSuccess(`Coupon "${coupon.code}" deleted.`);
      load();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not delete this coupon.";
      showError(msg);
    }
  };

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* =================================================
            TOP HEADING — Matching Delegate Passes Page
        ================================================= */}
        <div className="mb-[14px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1
              className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#4B1426]"
              style={{ color: "#4B1426" }}
            >
              Coupon Management
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Create and manage discount coupons for delegate registrations.
            </p>
          </div>

          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={openNew}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#1b5e20] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(27,94,32,0.25)] transition hover:bg-[#14491a]"
            >
              <Plus className="h-[12px] w-[12px]" strokeWidth={1.7} />
              Add Coupon
            </button>
          </div>
        </div>

        {/* NOTE BANNER */}
        <div className="mb-[10px] flex items-start gap-[8px] rounded-[6px] border border-amber-200 bg-amber-50 px-[12px] py-[8px]">
          <Info className="mt-[1px] h-[13px] w-[13px] shrink-0 text-amber-600" />
          <p className="text-[8.5px] font-medium leading-[1.5] text-amber-800">
            <strong>Note:</strong> Coupons work like <strong>AROGYA10</strong> → 10% off. You can set a{" "}
            <strong>Usage Limit</strong> (e.g. 10 uses) per coupon. Once the limit is reached, the status automatically
            changes to <span className="font-bold text-[#c2410c]">SOLD OUT</span>. Edit the coupon to increase the limit
            (it becomes available again), or use <strong>Reset</strong> to clear its usage.
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
              placeholder="Search code..."
              className="h-[28px] w-[220px] rounded-[5px] border border-[#d8dce2] bg-white pl-[24px] pr-[8px] text-[8.5px] font-medium text-[#334155] outline-none placeholder:text-[#8a92a0] focus:border-[#293681]"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as "" | CouponApplicableTo);
              setCurrentPage(1);
            }}
            className="h-[28px] cursor-pointer rounded-[5px] border border-[#d8dce2] bg-white px-[8px] text-[8.5px] font-medium text-[#334155] outline-none focus:border-[#293681]"
          >
            <option value="">All Types</option>
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* =============================================
            COUPONS TABLE
        ============================================= */}
        <div className="mt-[4px] flex min-h-0 flex-1 flex-col overflow-hidden rounded-[7px] border border-[#e8e5df] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="h-[32px] border-b border-[#e8e5df] bg-[#111844]">
                  <th className="w-[54px] rounded-tl-[6px] px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white">
                    S.No
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white">
                    Coupon Code
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white">
                    Discount
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white">
                    Applicable To
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white">
                    Usage
                  </th>
                  <th className="px-[12px] py-[6px] text-center text-[8.5px] font-bold uppercase tracking-wider text-white">
                    Remaining
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
                        <span>Loading coupons...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[10px] text-[#6c7587]">
                      {coupons.length === 0
                        ? "No coupons yet. Click \"Add Coupon\" to create one."
                        : "No coupons match your search."}
                    </td>
                  </tr>
                ) : (
                  paginatedCoupons.map((c, index) => {
                    const state = couponState(c);
                    const limit = c.usageLimit || 1;
                    const used = c.usedCount || 0;
                    const remaining = Math.max(0, limit - used);
                    const usedPercent = Math.min(100, Math.round((used / limit) * 100));

                    return (
                      <tr key={c._id} className="transition hover:bg-slate-50/80">
                        {/* S.NO */}
                        <td className="px-[12px] py-[8px]">
                          <span className="text-[8.5px] font-semibold text-[#64748b]">{startIndex + index + 1}</span>
                        </td>

                        {/* CODE */}
                        <td className="px-[12px] py-[8px]">
                          <div className="flex items-center gap-1.5">
                            <TicketPercent className="h-3 w-3 shrink-0 text-[#293681]" />
                            <span className="rounded-[4px] border border-dashed border-[#b8c2d9] bg-[#f5f7fb] px-[6px] py-[2px] font-mono text-[8.5px] font-bold tracking-wide text-[#4B1426]">
                              {c.code}
                            </span>
                          </div>
                        </td>

                        {/* DISCOUNT */}
                        <td className="px-[12px] py-[8px]">
                          <span className="text-[9px] font-bold text-[#1b5e20]">{c.discountPercent}%</span>
                          <span className="ml-0.5 text-[7.5px] font-semibold text-[#64748b]">off</span>
                        </td>

                        {/* APPLICABLE TO */}
                        <td className="px-[12px] py-[8px]">
                          <span
                            className={`inline-flex rounded-[4px] border px-[6px] py-[2px] text-[7.5px] font-bold ${TYPE_BADGE[c.applicableTo] ?? TYPE_BADGE.both}`}
                          >
                            {TYPE_SHORT[c.applicableTo] ?? c.applicableTo}
                          </span>
                        </td>

                        {/* USAGE */}
                        <td className="px-[12px] py-[8px]">
                          <div className="flex items-center gap-1.5" title={c.usedBy?.length ? `Used by:\n${c.usedBy.join("\n")}` : undefined}>
                            <div className="h-[5px] w-[60px] overflow-hidden rounded-full bg-[#eef0f4]">
                              <div
                                className={`h-full rounded-full ${remaining === 0 ? "bg-[#ea580c]" : "bg-[#2e7d32]"}`}
                                style={{ width: `${usedPercent}%` }}
                              />
                            </div>
                            <span className="text-[8px] font-semibold text-[#334155]">
                              {used} / {limit}
                            </span>
                          </div>
                        </td>

                        {/* REMAINING */}
                        <td className="px-[12px] py-[8px] text-center">
                          <span className={`text-[8.5px] font-bold ${remaining === 0 ? "text-[#c2410c]" : "text-[#23714a]"}`}>
                            {remaining}
                          </span>
                        </td>

                        {/* STATUS DROPDOWN */}
                        <td className="px-[12px] py-[8px]">
                          <select
                            key={`${c._id}-${state}`}
                            value={state}
                            onChange={(e) => handleStateChange(c, e.target.value as CouponState)}
                            className={`h-[24px] cursor-pointer appearance-none rounded-[4px] bg-[right_6px_center] bg-no-repeat px-[8px] pr-[22px] text-[8px] font-bold shadow-xs outline-none transition ${STATE_STYLE[state]}`}
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
                            <option value="sold_out" className="bg-white font-bold text-[#c2410c]">
                              SOLD OUT
                            </option>
                          </select>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-[12px] py-[8px] text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {(used > 0 || state === "sold_out") && (
                              <button
                                type="button"
                                title="Reset Usage"
                                onClick={() => handleReset(c)}
                                className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-emerald-400/30 bg-emerald-500/10 text-emerald-700 shadow-[0_2px_6px_rgba(5,150,105,0.12)] backdrop-blur-md transition-all hover:scale-105 hover:border-emerald-400/50 hover:bg-emerald-500/20 hover:shadow-[0_3px_10px_rgba(5,150,105,0.25)] active:scale-95"
                              >
                                <RotateCcw className="h-[12px] w-[12px]" />
                              </button>
                            )}

                            <button
                              type="button"
                              title="Edit Coupon"
                              onClick={() => openEdit(c)}
                              className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-blue-400/30 bg-blue-500/10 text-blue-600 shadow-[0_2px_6px_rgba(37,99,235,0.12)] backdrop-blur-md transition-all hover:scale-105 hover:border-blue-400/50 hover:bg-blue-500/20 hover:shadow-[0_3px_10px_rgba(37,99,235,0.25)] active:scale-95"
                            >
                              <Pencil className="h-[12px] w-[12px] text-blue-600" />
                            </button>

                            <button
                              type="button"
                              title="Delete Coupon"
                              onClick={() => handleDelete(c)}
                              className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-red-400/30 bg-red-500/10 text-red-600 shadow-[0_2px_6px_rgba(220,38,38,0.12)] backdrop-blur-md transition-all hover:scale-105 hover:border-red-400/50 hover:bg-red-500/20 hover:shadow-[0_3px_10px_rgba(220,38,38,0.25)] active:scale-95"
                            >
                              <Trash2 className="h-[12px] w-[12px] text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Stats & Pagination (10 per page) */}
          {!loading && filtered.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8e5df] bg-[#fafafa] px-[12px] py-[6px] text-[8px]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#2563eb]">
                  Total Coupons: <strong className="font-bold text-[#1d4ed8]">{coupons.length}</strong>
                </span>
                <span className="font-semibold text-[#23714a]">
                  Active: <strong className="font-bold">{activeCount}</strong>
                </span>
                <span className="font-semibold text-[#c2410c]">
                  Sold Out: <strong className="font-bold">{soldOutCount}</strong>
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
          ADD / EDIT COUPON MODAL
      ============================================= */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Coupon" : "Add New Coupon"}
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
              {editingId ? "Save Changes" : "Save Coupon"}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <Select
            label="Applicable To"
            required
            value={form.applicableTo}
            onChange={(e) => setForm({ ...form, applicableTo: e.target.value as CouponApplicableTo })}
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>

          <Input
            label="Coupon Code"
            required
            placeholder="e.g. AROGYA10"
            value={form.code}
            maxLength={30}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, "") })}
            hint="Auto-converted to uppercase"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Discount Percent (%)"
              required
              type="number"
              min={1}
              max={100}
              placeholder="e.g. 10"
              value={form.discountPercent}
              onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
              hint="Range: 1% – 100%"
            />
            <Input
              label="Usage Limit"
              required
              type="number"
              min={1}
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
              hint="Number of times this coupon can be used"
            />
          </div>

          {error && <p className="text-[10px] font-semibold text-red-500">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
