"use client";

import { useEffect, useState } from "react";
import { FileText, ImageIcon, LayoutGrid, Loader2, Plus, Save, Settings, Users } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { CloudImageField } from "@/components/cms/editor/CloudImageField";
import { showError, showSuccess } from "@/lib/toast";
import {
  moreSpeakersApi, MoreItemType, MoreSectionType, MoreSpeakerCategory, MoreSpeakerItem, MoreSpeakerItemInput,
} from "@/lib/speakersApi";
import {
  Cell, confirmDelete, errorText, InfoNote, ModalFooter, PersonAvatar, RowActions, SpeakerPageShell,
} from "@/components/speakers/SpeakerAdminUI";

/* =========================================================
   SPEAKERS SECTION → MORE SPEAKERS — on the website Speakers page:
   the "More speakers will be announced soon" line, Our Advisors,
   Scientific Committee and the Previous Edition Highlights photos.
========================================================= */

type TabId = "main" | "advisors" | "scientific" | "highlights";
const TABS: { id: TabId; label: string; Icon: typeof Settings; section: MoreSectionType; itemType?: MoreItemType; noun: string }[] = [
  { id: "main", label: "Main Heading", Icon: Settings, section: "MAIN", noun: "" },
  { id: "advisors", label: "Our Advisors", Icon: Users, section: "ADVISORS", itemType: "ADVISOR", noun: "Advisor" },
  { id: "scientific", label: "Scientific Committee", Icon: FileText, section: "SCIENTIFIC", itemType: "SCIENTIFIC", noun: "Member" },
  { id: "highlights", label: "Previous Highlights", Icon: LayoutGrid, section: "HIGHLIGHTS", itemType: "HIGHLIGHT", noun: "Photo" },
];
const EMPTY_ITEM: Omit<MoreSpeakerItemInput, "type"> = { name: "", designation: "", organization: "", image: "", imageAltText: "", order: 0 };

/* ---------- a section heading (+ description) ---------- */
function SectionHeadingCard({ category, withDescription, onSaved }: {
  category: MoreSpeakerCategory; withDescription: boolean; onSaved: (c: MoreSpeakerCategory) => void;
}) {
  const [form, setForm] = useState({ heading: category.heading, description: category.description });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => setForm({ heading: category.heading, description: category.description }), [category]);

  const isMain = category.sectionType === "MAIN";
  const save = async () => {
    if (!form.heading.trim()) return setError("Enter the heading.");
    setSaving(true);
    setError("");
    try {
      const saved = await moreSpeakersApi.saveCategory(category.sectionType, { heading: form.heading.trim(), description: form.description.trim() });
      onSaved(saved);
      showSuccess("Heading saved. Refresh the website to see it.");
    } catch (err) {
      const msg = errorText(err, "Could not save the heading.");
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2 rounded-[7px] border border-[#e8e5df] bg-white p-[14px]">
      <h2 className="border-b border-[#f0f0ec] pb-[8px] text-[11px] font-bold uppercase tracking-wide text-[#4B1426]">
        {isMain ? "Main Line" : "Section Heading"}
      </h2>
      <Input label="Heading" required maxLength={120} value={form.heading}
        onChange={(e) => setForm({ ...form, heading: isMain ? e.target.value : e.target.value.toUpperCase() })}
        hint={isMain ? "The line under the Esteemed Speakers cards" : undefined} />
      {withDescription && (
        <Textarea label="Description" rows={3} maxLength={300} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      )}
      {error && <p className="text-[10px] font-semibold text-red-500">{error}</p>}
      <button type="button" onClick={save} disabled={saving}
        className="inline-flex h-[32px] w-full items-center justify-center gap-1.5 rounded-[4px] bg-[#1b5e20] px-[14px] text-[12px] font-semibold text-white hover:opacity-90 disabled:opacity-60">
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save Heading
      </button>
    </div>
  );
}

export default function MoreSpeakersPage() {
  const [tab, setTab] = useState<TabId>("main");
  const [categories, setCategories] = useState<MoreSpeakerCategory[]>([]);
  const [items, setItems] = useState<MoreSpeakerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ id: string | null; form: MoreSpeakerItemInput } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadItems = () =>
    moreSpeakersApi.items().then(setItems).catch((err) => showError(errorText(err, "Could not load the speakers.")));

  useEffect(() => {
    Promise.all([moreSpeakersApi.categories().then(setCategories), loadItems()])
      .catch((err) => showError(errorText(err, "Could not load More Speakers.")))
      .finally(() => setLoading(false));
  }, []);

  const active = TABS.find((t) => t.id === tab)!;
  const category = categories.find((c) => c.sectionType === active.section);
  const list = active.itemType ? items.filter((i) => i.type === active.itemType) : [];
  const isHighlight = active.itemType === "HIGHLIGHT";

  const setForm = (patch: Partial<MoreSpeakerItemInput>) => modal && setModal({ ...modal, form: { ...modal.form, ...patch } });

  const openNew = () => {
    if (!active.itemType) return;
    setError("");
    setModal({ id: null, form: { ...EMPTY_ITEM, type: active.itemType, order: list.reduce((m, i) => Math.max(m, i.order || 0), 0) + 1 } });
  };

  const save = async () => {
    if (!modal) return;
    const f: MoreSpeakerItemInput = {
      ...modal.form,
      name: modal.form.name.trim(),
      designation: modal.form.designation.trim(),
      organization: modal.form.organization.trim(),
      imageAltText: modal.form.image ? modal.form.imageAltText.trim() : "",
      order: Number(modal.form.order) || 0,
    };
    if (f.type !== "HIGHLIGHT" && !f.name) return setError("Name is required.");
    if (f.type === "HIGHLIGHT" && !f.image) return setError("Upload the photo.");
    if (f.image && !f.imageAltText) return setError("Enter the photo alt text.");
    setSaving(true);
    setError("");
    try {
      if (modal.id) await moreSpeakersApi.update(modal.id, f);
      else await moreSpeakersApi.create(f);
      showSuccess(modal.id ? "Saved." : "Added.");
      setModal(null);
      loadItems();
    } catch (err) {
      setError(errorText(err, "Could not save."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (i: MoreSpeakerItem) => {
    if (!(await confirmDelete(`Delete ${i.name ? `"${i.name}"` : "this photo"}?`, "It disappears from the website.")).isConfirmed) return;
    try {
      await moreSpeakersApi.remove(i._id);
      showSuccess("Deleted.");
      loadItems();
    } catch (err) {
      showError(errorText(err, "Could not delete."));
    }
  };

  return (
    <SpeakerPageShell
      title="More Speakers"
      description="Manage Our Advisors, Scientific Committee and Previous Edition Highlights on the website Speakers page."
      websitePath="/speakers"
      action={active.itemType ? { label: `Add ${active.noun}`, onClick: openNew } : undefined}
    >
      {/* TABS */}
      <div className="mb-[14px] flex flex-wrap gap-[6px] rounded-[8px] border border-[#e8e5df] bg-[#fafafa] p-[4px]">
        {TABS.map(({ id, label, Icon, itemType }) => (
          <button key={id} type="button" onClick={() => setTab(id)}
            className={`flex h-[32px] items-center gap-[6px] rounded-[6px] px-[14px] text-[10px] font-bold transition ${
              tab === id ? "bg-[#111844] text-white shadow-sm" : "text-[#475569] hover:bg-white"
            }`}>
            <Icon className="h-[13px] w-[13px]" /> {label}
            {itemType && <span className={`rounded-full px-1.5 text-[8.5px] ${tab === id ? "bg-white/20" : "bg-[#e2e8f0]"}`}>{items.filter((i) => i.type === itemType).length}</span>}
          </button>
        ))}
      </div>

      {loading || !category ? (
        <span className="inline-flex items-center gap-2 text-[11px] text-[#6c7587]"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</span>
      ) : (
        <div className={active.itemType ? "grid grid-cols-1 gap-[14px] xl:grid-cols-[280px_1fr]" : "max-w-[560px]"}>
          <div className="space-y-[14px]">
            <SectionHeadingCard category={category} withDescription={active.section !== "MAIN"}
              onSaved={(c) => setCategories((prev) => prev.map((x) => (x.sectionType === c.sectionType ? c : x)))} />
            {isHighlight && <InfoNote>The website shows the first <b>5 photos</b> (lowest Order first) in a collage.</InfoNote>}
          </div>

          {active.itemType && (
            <div className="overflow-hidden rounded-[7px] border border-[#e8e5df] bg-white">
              <div className="flex items-center bg-[#111844] px-[12px] py-[9px]">
                <h2 className="flex items-center gap-[6px] text-[10px] font-bold uppercase tracking-wider text-white">
                  {isHighlight ? <ImageIcon className="h-[13px] w-[13px]" /> : <Users className="h-[13px] w-[13px]" />} {active.label}
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-[8.5px]">{list.length}</span>
                </h2>
              </div>
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="h-[30px] border-b border-[#e8e5df] bg-[#f4f5f9]">
                    {(isHighlight ? ["S.No", "Photo", "Alt Text", "Order", "Actions"] : ["S.No", active.noun, "Organization", "Order", "Actions"]).map((h, i, all) => (
                      <th key={h} className={`px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-[#111844] ${i === all.length - 1 ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0ec]">
                  {!list.length ? (
                    <tr><td colSpan={5} className="py-10 text-center text-[10px] text-[#6c7587]">Nothing added yet.</td></tr>
                  ) : list.map((it, i) => (
                    <tr key={it._id} className="hover:bg-slate-50/80">
                      <Cell className="font-semibold text-[#293681]">{i + 1}</Cell>
                      {isHighlight ? (
                        <>
                          <Cell>
                            {it.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={it.image} alt={it.imageAltText || "Highlight"} className="h-[44px] w-[70px] rounded-[5px] border border-[#e2e8f0] object-cover" />
                            ) : <span className="text-[#94a3b8]">No photo</span>}
                          </Cell>
                          <Cell>{it.imageAltText || <span className="font-semibold text-amber-700">Missing alt text</span>}</Cell>
                        </>
                      ) : (
                        <>
                          <Cell>
                            <div className="flex min-w-[220px] items-center gap-[10px]">
                              <PersonAvatar name={it.name} image={it.image} alt={it.imageAltText} />
                              <div className="min-w-0">
                                <p className="truncate text-[10.5px] font-bold text-[#4B1426]">{it.name}</p>
                                <p className="line-clamp-1 text-[8.5px] font-semibold text-[#0A7C6E]" title={it.designation}>{it.designation || "—"}</p>
                              </div>
                            </div>
                          </Cell>
                          <Cell className="font-semibold">{it.organization || "—"}</Cell>
                        </>
                      )}
                      <Cell className="font-bold">{it.order}</Cell>
                      <Cell>
                        <RowActions onEdit={() => { setError(""); const { _id, ...rest } = it; setModal({ id: _id, form: { ...EMPTY_ITEM, ...rest } }); }} onDelete={() => remove(it)} />
                      </Cell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={Boolean(modal)} onClose={() => setModal(null)}
        title={`${modal?.id ? "Edit" : "Add"} ${TABS.find((t) => t.itemType === modal?.form.type)?.noun ?? ""}`} size="lg"
        footer={<ModalFooter onCancel={() => setModal(null)} onSave={save} saving={saving} label={modal?.id ? "Save Changes" : "Add"} />}>
        {modal && (
          <div className="space-y-3">
            {modal.form.type !== "HIGHLIGHT" && (
              <>
                <div className="grid grid-cols-[2fr_1fr] gap-3">
                  <Input label="Name" required maxLength={100} placeholder="e.g. Dr. N. K. Joshi" value={modal.form.name} onChange={(e) => setForm({ name: e.target.value })} />
                  <Input label="Order" type="number" min={0} value={String(modal.form.order)} onChange={(e) => setForm({ order: Number(e.target.value) })} hint="Lowest shows first" />
                </div>
                <Textarea label="Designation" rows={2} maxLength={200} placeholder="e.g. Chairman, FRI, Dehradun" value={modal.form.designation} onChange={(e) => setForm({ designation: e.target.value })} />
                <Input label="Organization" maxLength={120} value={modal.form.organization} onChange={(e) => setForm({ organization: e.target.value })} />
              </>
            )}
            {modal.form.type === "HIGHLIGHT" && (
              <Input label="Order" type="number" min={0} value={String(modal.form.order)} onChange={(e) => setForm({ order: Number(e.target.value) })} hint="The first 5 (lowest order) show on the website" />
            )}
            <div className="grid grid-cols-[auto_1fr] items-end gap-3 rounded-[6px] border border-[#e2e8f0] bg-slate-50/50 p-3">
              <CloudImageField upload={moreSpeakersApi.uploadImage} label="Photo" required={modal.form.type === "HIGHLIGHT"} value={modal.form.image}
                onChange={(v) => setForm({ image: v })} hint={modal.form.type === "HIGHLIGHT" ? "Landscape event photo" : "Square photo"}
                previewClass={modal.form.type === "HIGHLIGHT" ? "h-[64px] w-[100px]" : "h-[64px] w-[64px]"} />
              <Input label="Photo Alt Text" required={Boolean(modal.form.image)} maxLength={150} disabled={!modal.form.image}
                placeholder="Describe the photo (for SEO)" value={modal.form.imageAltText} onChange={(e) => setForm({ imageAltText: e.target.value })} />
            </div>
            {error && <p className="text-[10px] font-semibold text-red-500">{error}</p>}
          </div>
        )}
      </Modal>
    </SpeakerPageShell>
  );
}
