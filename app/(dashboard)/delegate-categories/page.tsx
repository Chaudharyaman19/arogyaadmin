"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Info,
  Search,
} from "lucide-react";
import { showSuccess, showError, lazySwal } from "@/lib/toast";
import typography from "../pages/PagesTypography.module.css";
import Modal from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import {
  delegateCategoriesApi,
  DelegateCategory,
  CategoryRegType,
} from "@/lib/delegateCategoriesApi";
import { ApiRequestError } from "@/lib/api";

const EMPTY_FORM = {
  name: "",
  type: "both" as CategoryRegType,
};

const TYPE_OPTIONS: { value: CategoryRegType; label: string }[] = [
  { value: "both", label: "Both (Single & Group)" },
  { value: "single", label: "Single Registration Only" },
  { value: "group", label: "Group Registration Only" },
];

const TYPE_BADGE: Record<CategoryRegType, string> = {
  both: "bg-blue-50 text-blue-700 border-blue-200",
  single: "bg-purple-50 text-purple-700 border-purple-200",
  group: "bg-orange-50 text-orange-700 border-orange-200",
};

const TYPE_SHORT: Record<CategoryRegType, string> = {
  both: "Single & Group",
  single: "Single Only",
  group: "Group Only",
};

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

export default function DelegateCategoriesPage() {
  const [categories, setCategories] = useState<DelegateCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | CategoryRegType>("");

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
    delegateCategoriesApi
      .list()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => {
        const msg = err instanceof ApiRequestError ? err.message : "Failed to load categories.";
        showError(msg);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return categories.filter((c) => {
      if (typeFilter && c.type !== typeFilter) return false;
      return !query || c.name.toLowerCase().includes(query);
    });
  }, [categories, search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, filtered.length);
  const paginatedCategories = filtered.slice(startIndex, endIndex);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (category: DelegateCategory) => {
    setEditingId(category._id);
    setForm({ name: category.name, type: category.type || "both" });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    const name = form.name.trim();
    if (!name) {
      setError("Category name is required.");
      return;
    }

    const duplicate = categories.some(
      (c) => c._id !== editingId && c.type === form.type && c.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) {
      setError(`"${name}" already exists for this registration type.`);
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await delegateCategoriesApi.update(editingId, { name, type: form.type });
        showSuccess(`Category "${name}" updated successfully!`);
      } else {
        await delegateCategoriesApi.create({ name, type: form.type });
        showSuccess(`Category "${name}" created successfully!`);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save this category.";
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: DelegateCategory) => {
    const confirmResult = await lazySwal.fire({
      title: `Delete "${category.name}"?`,
      text: "Delegates will no longer be able to pick this category during registration. This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete Category",
      cancelButtonText: "Cancel",
      background: "#1e2433",
      color: "#e2e8f0",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await delegateCategoriesApi.remove(category._id);
      showSuccess(`Category "${category.name}" deleted.`);
      load();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not delete this category.";
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
              Category Management
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Manage the dynamic options available for delegates during registration. Add, edit, or remove categories.
            </p>
          </div>

          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={openNew}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#1b5e20] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(27,94,32,0.25)] transition hover:bg-[#14491a]"
            >
              <Plus className="h-[12px] w-[12px]" strokeWidth={1.7} />
              Add Category
            </button>
          </div>
        </div>

        {/* NOTE BANNER */}
        <div className="mb-[10px] flex items-start gap-[8px] rounded-[6px] border border-amber-200 bg-amber-50 px-[12px] py-[8px]">
          <Info className="mt-[1px] h-[13px] w-[13px] shrink-0 text-amber-600" />
          <p className="text-[8.5px] font-medium leading-[1.5] text-amber-800">
            <strong>Note:</strong> These categories appear as options on the website delegate registration form.
            <strong> Single</strong> categories show only for single registration, <strong>Group</strong> only for group
            registration, and <strong>Both</strong> on either form.
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
              placeholder="Search categories..."
              className="h-[28px] w-[220px] rounded-[5px] border border-[#d8dce2] bg-white pl-[24px] pr-[8px] text-[8.5px] font-medium text-[#334155] outline-none placeholder:text-[#8a92a0] focus:border-[#293681]"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as "" | CategoryRegType);
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
            CATEGORIES TABLE
        ============================================= */}
        <div className="mt-[4px] flex min-h-0 flex-1 flex-col overflow-hidden rounded-[7px] border border-[#e8e5df] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="h-[32px] border-b border-[#e8e5df] bg-[#111844]">
                  <th className="w-[60px] rounded-tl-[6px] px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white">
                    S.No
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white">
                    Category Name
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white">
                    Reg. Type
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white">
                    Created On
                  </th>
                  <th className="rounded-tr-[6px] px-[12px] py-[6px] text-right text-[8.5px] font-bold uppercase tracking-wider text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0ec]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-[11px] text-[#6c7587]">
                        <Loader2 className="h-4 w-4 animate-spin text-[#293681]" />
                        <span>Loading categories...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[10px] text-[#6c7587]">
                      {categories.length === 0
                        ? "No categories yet. Click \"Add Category\" to create one."
                        : "No categories match your search."}
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.map((c, index) => (
                    <tr key={c._id} className="transition hover:bg-slate-50/80">
                      {/* S.NO */}
                      <td className="px-[12px] py-[8px]">
                        <span className="text-[8.5px] font-semibold text-[#64748b]">{startIndex + index + 1}</span>
                      </td>

                      {/* CATEGORY NAME */}
                      <td className="px-[12px] py-[8px]">
                        <div className="flex items-center gap-1.5">
                          <Tag className="h-3 w-3 shrink-0 text-[#293681]" />
                          <span className="text-[8.5px] font-semibold text-[#4B1426]">{c.name}</span>
                        </div>
                      </td>

                      {/* REG. TYPE */}
                      <td className="px-[12px] py-[8px]">
                        <span
                          className={`inline-flex rounded-[4px] border px-[6px] py-[2px] text-[7.5px] font-bold ${TYPE_BADGE[c.type] ?? TYPE_BADGE.both}`}
                        >
                          {TYPE_SHORT[c.type] ?? c.type}
                        </span>
                      </td>

                      {/* CREATED */}
                      <td className="px-[12px] py-[8px]">
                        <span className="text-[8px] font-medium text-[#334155]">{formatDate(c.createdAt)}</span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-[12px] py-[8px] text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="Edit Category"
                            onClick={() => openEdit(c)}
                            className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-blue-400/30 bg-blue-500/10 text-blue-600 shadow-[0_2px_6px_rgba(37,99,235,0.12)] backdrop-blur-md transition-all hover:scale-105 hover:border-blue-400/50 hover:bg-blue-500/20 hover:shadow-[0_3px_10px_rgba(37,99,235,0.25)] active:scale-95"
                          >
                            <Pencil className="h-[12px] w-[12px] text-blue-600" />
                          </button>

                          <button
                            type="button"
                            title="Delete Category"
                            onClick={() => handleDelete(c)}
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
                  Total Categories: <strong className="font-bold text-[#1d4ed8]">{categories.length}</strong>
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
          ADD / EDIT CATEGORY MODAL — Matching Roles Modal
      ============================================= */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Category" : "Add New Category"}
        size="sm"
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
              {editingId ? "Save Changes" : "Save"}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <Select
            label="Registration Type"
            required
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as CategoryRegType })}
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>

          <Input
            label="Name"
            required
            placeholder="Enter category name..."
            value={form.name}
            maxLength={120}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
          />

          {error && <p className="text-[10px] font-semibold text-red-500">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
