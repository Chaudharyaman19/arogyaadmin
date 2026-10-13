"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  EyeOff,
  FileText,
  FolderTree,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import typography from "@/app/(dashboard)/pages/PagesTypography.module.css";
import Modal from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { showSuccess, showError, lazySwal } from "@/lib/toast";
import { blogCategoriesApi, BlogCategory, BlogCategoryInput } from "@/lib/blogsApi";
import { ApiRequestError } from "@/lib/api";

/* =========================================================
   MANAGE BLOG CATEGORIES — the categories a blog post can be
   filed under (Add New Post → Blog Category) and the list in the
   sidebar of the website's Blogs page. Saved to backend-arogya.
========================================================= */

const EMPTY_FORM: BlogCategoryInput = { name: "", slug: "", description: "", status: "Published", order: 1 };

const slugify = (value: string) =>
  value.toLowerCase().replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof ApiRequestError ? err.message || fallback : fallback;

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";

export default function ManageBlogCategoriesView() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // Add / edit modal: null = closed, "new" = adding, otherwise the category being edited
  const [editing, setEditing] = useState<BlogCategory | "new" | null>(null);
  const [form, setForm] = useState<BlogCategoryInput>(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setCategories(await blogCategoriesApi.list());
    } catch (err) {
      showError(errorMessage(err, "Could not load the categories."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const publishedCount = useMemo(() => categories.filter((c) => c.status === "Published").length, [categories]);
  const totalPosts = useMemo(() => categories.reduce((sum, c) => sum + c.totalPosts, 0), [categories]);

  const rows = useMemo(() => {
    const search = query.trim().toLowerCase();
    return categories.filter(
      (c) =>
        (statusFilter === "All Status" || c.status === statusFilter) &&
        (!search || c.name.toLowerCase().includes(search) || c.slug.includes(search) || c.description.toLowerCase().includes(search))
    );
  }, [categories, query, statusFilter]);

  const statCards = [
    { title: "TOTAL CATEGORIES", value: categories.length, footer: "All blog categories", icon: FolderTree, gradient: "#ede9fe", border: "#ddd6fe", color: "#6d28d9", onClick: () => setStatusFilter("All Status") },
    { title: "PUBLISHED", value: publishedCount, footer: "Visible on website", icon: Check, gradient: "#d1fae5", border: "#a7f3d0", color: "#047857", onClick: () => setStatusFilter("Published") },
    { title: "HIDDEN", value: categories.length - publishedCount, footer: "Not visible on website", icon: EyeOff, gradient: "#fce7f3", border: "#fbcfe8", color: "#be185d", onClick: () => setStatusFilter("Hidden") },
    { title: "TOTAL POSTS", value: totalPosts, footer: "Across all categories", icon: FileText, gradient: "#e0f2fe", border: "#bae6fd", color: "#0369a1", onClick: () => setStatusFilter("All Status") },
  ];

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, order: categories.length + 1 });
    setSlugTouched(false);
    setEditing("new");
  };

  const openEdit = (category: BlogCategory) => {
    setForm({ name: category.name, slug: category.slug, description: category.description, status: category.status, order: category.order });
    setSlugTouched(true);
    setEditing(category);
  };

  const handleSave = async () => {
    const input: BlogCategoryInput = {
      ...form,
      name: form.name.trim(),
      slug: slugify(form.slug || form.name),
      description: form.description.trim(),
      order: Number(form.order) || 1,
    };
    if (!input.name) return showError("Enter the category name.");

    setSaving(true);
    try {
      if (editing === "new") {
        await blogCategoriesApi.create(input);
        showSuccess(`Category "${input.name}" created.`);
      } else if (editing) {
        await blogCategoriesApi.update(editing._id, input);
        showSuccess(`Category "${input.name}" saved.`);
      }
      setEditing(null);
      await load();
    } catch (err) {
      showError(errorMessage(err, "Could not save this category."));
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (category: BlogCategory, status: "Published" | "Hidden") => {
    try {
      const saved = await blogCategoriesApi.update(category._id, {
        name: category.name,
        slug: category.slug,
        description: category.description,
        order: category.order,
        status,
      });
      setCategories((prev) => prev.map((c) => (c._id === category._id ? saved : c)));
      showSuccess(status === "Published" ? `"${category.name}" is now visible on the website.` : `"${category.name}" is hidden from the website.`);
    } catch (err) {
      showError(errorMessage(err, "Could not change the status."));
    }
  };

  const handleDelete = async (category: BlogCategory) => {
    const result = await lazySwal.fire({
      title: "Delete this category?",
      html: `<p style="color:#e2e8f0;font-size:0.9rem;">Remove <strong>${category.name.replace(/</g, "&lt;")}</strong>?<br/>This cannot be undone.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "No, Cancel",
      background: "#1e2433",
      color: "#e2e8f0",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#374151",
    });
    if (!result.isConfirmed) return;
    try {
      await blogCategoriesApi.remove(category._id);
      showSuccess(`Category "${category.name}" deleted.`);
      await load();
    } catch (err) {
      // e.g. the category still has posts
      showError(errorMessage(err, "Could not delete this category."));
    }
  };

  const iconButton =
    "flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border backdrop-blur-md transition-all hover:scale-105 active:scale-95";

  return (
    <main
      className={`${typography.pages} h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[14px] text-[#142347] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300`}
    >
      <div className="min-h-full w-full">
        {/* TOP HEADING */}
        <div className="mb-[18px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#4B1426]" style={{ color: "#4B1426" }}>
              Manage Categories
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Categories for blog posts — shown in Add New Post and in the sidebar of the website&apos;s Blogs page.
            </p>
          </div>

          <div className="flex items-center gap-[10px]">
            <Link
              href="/blogs"
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] border border-[#fed7aa] bg-[#fff7ed] px-[14px] text-[8.5px] font-semibold text-[#ea580c] shadow-sm transition hover:bg-[#ffedd5]"
            >
              <ArrowLeft className="h-[12px] w-[12px]" strokeWidth={1.7} />
              Back to Blog &amp; Awareness
            </Link>
            <button
              type="button"
              onClick={openAdd}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#1b5e20] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(27,94,32,0.25)] transition hover:bg-[#14491a]"
            >
              <Plus className="h-[12px] w-[12px]" strokeWidth={1.7} />
              Add New Category
            </button>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
          {statCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="relative flex h-[98px] flex-col overflow-hidden rounded-[11px] border bg-white p-2 !pb-5.5 transition-all hover:translate-y-[-1px]"
                style={{
                  background: `linear-gradient(135deg, #ffffff 0%, #ffffff 42%, ${item.gradient} 100%)`,
                  borderColor: item.border,
                  boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                }}
              >
                <div className="flex items-start gap-1.5">
                  <div className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-white/80 shadow-xs ring-1 ring-black/5" style={{ color: item.color }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[8.5px] !font-semibold tracking-[0.01em] text-slate-900" style={{ fontWeight: 600, color: "#0f172a" }}>
                      {item.title}
                    </p>
                    <div className="mt-1.5 text-[21px] !font-semibold leading-none tracking-[-0.04em]" style={{ color: item.color, fontWeight: 600 }}>
                      {item.value}
                    </div>
                  </div>
                </div>
                <div
                  onClick={item.onClick}
                  className="absolute bottom-1 left-2 right-2 flex cursor-pointer items-center justify-center gap-1 text-[8px] font-semibold text-[#293957] transition hover:text-blue-600"
                >
                  {item.footer}
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            );
          })}
        </div>

        {/* SEARCH & FILTER */}
        <div className="mt-[14px] flex flex-wrap items-center gap-[10px]">
          <label className="relative min-w-[200px] flex-1">
            <Search className="absolute right-[13px] top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#5d6b84]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search categories..."
              className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[14px] pr-[40px] text-[10.5px] font-semibold text-[#273655] outline-none placeholder:text-[#8b95a7]"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-[40px] min-w-[130px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none"
          >
            <option>All Status</option>
            <option>Published</option>
            <option>Hidden</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setStatusFilter("All Status");
              load();
            }}
            className="inline-flex h-[40px] items-center justify-center gap-[6px] rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10px] font-semibold text-[#35445f] hover:bg-slate-50"
          >
            <RefreshCw className={`h-[13px] w-[13px] ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* TABLE */}
        <div className="mt-[12px] overflow-hidden rounded-[7px] border border-[#e8e5df] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="h-[32px] border-b border-[#e8e5df] bg-[#111844]">
                  {["Order", "Category", "Description", "Total Posts", "Updated By", "Status", "Actions"].map((label, i) => (
                    <th key={label} className={`px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-white ${i === 6 ? "text-right" : ""}`}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0ec]">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs font-medium text-slate-500">
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-[#0f766e]" /> Loading categories...
                        </span>
                      ) : categories.length === 0 ? (
                        'No categories yet — click "Add New Category" to add the first one.'
                      ) : (
                        "No categories match your search."
                      )}
                    </td>
                  </tr>
                ) : (
                  rows.map((category) => (
                    <tr key={category._id} className="transition hover:bg-slate-50/80">
                      <td className="whitespace-nowrap px-[12px] py-[8px] text-[8.5px] font-semibold text-[#293681]">#{category.order}</td>
                      <td className="px-[12px] py-[8px]">
                        <span className="block text-[9px] font-semibold text-[#4B1426]">{category.name}</span>
                        <span className="block font-mono text-[7.5px] font-medium text-[#64748b]">{category.slug}</span>
                      </td>
                      <td className="max-w-[320px] px-[12px] py-[8px] text-[8.5px] font-medium text-[#475569]">
                        {category.description || <span className="text-[#94a3b8]">—</span>}
                      </td>
                      <td className="px-[12px] py-[8px]">
                        <span className="inline-block min-w-[26px] rounded-[4px] bg-[#f0f4f8] px-[6px] py-[2px] text-center text-[8.5px] font-bold text-[#233D4D]">
                          {category.totalPosts}
                        </span>
                      </td>
                      <td className="px-[12px] py-[8px]">
                        <span className="block text-[8.5px] font-semibold text-[#dc2626]">{category.updatedBy || "—"}</span>
                        <span className="block text-[7.5px] font-medium text-[#64748b]">{formatDate(category.updatedAt)}</span>
                      </td>
                      <td className="px-[12px] py-[8px]">
                        <select
                          value={category.status}
                          onChange={(e) => handleStatus(category, e.target.value as "Published" | "Hidden")}
                          className={`h-[24px] cursor-pointer rounded-[4px] border px-[6px] text-[8px] font-bold outline-none ${
                            category.status === "Published"
                              ? "border-[#a5d6a7] bg-[#e8f5e9] text-[#23714a]"
                              : "border-[#ef9a9a] bg-[#ffebee] text-[#c62828]"
                          }`}
                        >
                          <option value="Published" className="bg-white text-[#23714a]">Published</option>
                          <option value="Hidden" className="bg-white text-[#c62828]">Hidden</option>
                        </select>
                      </td>
                      <td className="px-[12px] py-[8px]">
                        <div className="flex items-center justify-end gap-1.5">
                          <button type="button" title="Edit category" onClick={() => openEdit(category)} className={`${iconButton} border-blue-400/30 bg-blue-500/10 text-blue-600`}>
                            <Pencil className="h-[12px] w-[12px]" />
                          </button>
                          <button type="button" title="Delete category" onClick={() => handleDelete(category)} className={`${iconButton} border-red-400/30 bg-red-500/10 text-red-600`}>
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
          <div className="border-t border-[#e8e5df] bg-[#fafafa] px-[12px] py-[6px] text-[8px] font-semibold text-[#2563eb]">
            Total Categories: <strong className="font-bold text-[#1d4ed8]">{rows.length}</strong>
            <span className="ml-2 font-medium text-[#8a92a0]">(a category with posts cannot be deleted — move its posts first)</span>
          </div>
        </div>

        {/* ADD / EDIT MODAL */}
        <Modal
          isOpen={editing !== null}
          onClose={() => setEditing(null)}
          title={editing === "new" ? "New Category" : "Edit Category"}
          size="md"
          footer={
            <>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="inline-flex h-[32px] items-center px-[14px] text-[12px] font-semibold text-red-600 transition hover:bg-red-100"
                style={{ background: "#fff1f2", borderRadius: "4px", boxShadow: "rgba(220,38,38,0.15) 0px 0px 0px 1px" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: "#16a34a", borderRadius: "4px" }}
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {editing === "new" ? "Add Category" : "Save Changes"}
              </button>
            </>
          }
        >
          <div className="space-y-3">
            <Input
              label="Category Name"
              required
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((prev) => ({ ...prev, name, slug: slugTouched ? prev.slug : slugify(name) }));
              }}
              placeholder="e.g. Health & Wellness"
              maxLength={40}
              hint={editing !== "new" && editing ? "Renaming a category also renames it on its posts." : undefined}
            />
            <Input
              label="Slug"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
              }}
              placeholder="health-wellness"
              maxLength={60}
            />
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={2}
              maxLength={200}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Display Order #"
                type="number"
                min={1}
                value={form.order}
                onChange={(e) => setForm((prev) => ({ ...prev, order: Number(e.target.value) }))}
              />
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#18233b]">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as "Published" | "Hidden" }))}
                  className={`h-[38px] w-full cursor-pointer rounded-[4px] border px-[12px] text-[11px] font-bold outline-none ${
                    form.status === "Published" ? "border-[#a5d6a7] bg-[#e8f5e9] text-[#23714a]" : "border-[#ef9a9a] bg-[#ffebee] text-[#c62828]"
                  }`}
                >
                  <option value="Published" className="bg-white text-[#23714a]">Published</option>
                  <option value="Hidden" className="bg-white text-[#c62828]">Hidden</option>
                </select>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </main>
  );
}
