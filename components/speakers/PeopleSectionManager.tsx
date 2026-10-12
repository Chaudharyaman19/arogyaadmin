"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search, Users } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { CloudImageField } from "@/components/cms/editor/CloudImageField";
import { showError, showSuccess } from "@/lib/toast";
import type { PeopleApi, SpeakerPerson, SpeakerPersonInput } from "@/lib/speakersApi";
import {
  Cell, confirmDelete, errorText, HeadingCard, InfoNote, ModalFooter, PersonAvatar, RowActions, SpeakerPageShell,
} from "./SpeakerAdminUI";

/* =========================================================
   A "heading + list of people" section of the Speakers Section
   dropdown (Esteemed Speakers, Previous Speakers, Eminent Speakers,
   Organising Committee): section heading, searchable / paginated
   table and an add / edit form.
========================================================= */

const PAGE_SIZE = 10;

export interface PeopleSectionConfig {
  title: string;
  description: string;
  websitePath: string;
  api: PeopleApi;
  /** singular, e.g. "Speaker" / "Member" */
  noun: string;
  /** Esteemed and Previous speakers have a title / topic */
  withTitle?: boolean;
  headingHint: string;
  websiteNote: ReactNode;
  namePlaceholder: string;
}

export default function PeopleSectionManager({ config }: { config: PeopleSectionConfig }) {
  const { api, noun, withTitle } = config;
  const empty: SpeakerPersonInput = { name: "", designation: "", organization: "", ...(withTitle ? { title: "" } : {}), image: "", imageAltText: "", order: 0 };

  const [items, setItems] = useState<SpeakerPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ id: string | null; form: SpeakerPersonInput } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .list()
      .then(setItems)
      .catch((err) => showError(errorText(err, `Could not load the ${noun.toLowerCase()}s.`)))
      .finally(() => setLoading(false));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((s) => [s.name, s.designation, s.organization, s.title].some((v) => v?.toLowerCase().includes(q)));
  }, [items, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const setForm = (patch: Partial<SpeakerPersonInput>) => modal && setModal({ ...modal, form: { ...modal.form, ...patch } });

  const openNew = () => {
    setError("");
    const nextOrder = items.reduce((max, s) => Math.max(max, s.order || 0), 0) + 1;
    setModal({ id: null, form: { ...empty, order: nextOrder } });
  };

  const save = async () => {
    if (!modal) return;
    const f: SpeakerPersonInput = {
      ...modal.form,
      name: modal.form.name.trim(),
      designation: modal.form.designation.trim(),
      organization: modal.form.organization.trim(),
      ...(withTitle ? { title: (modal.form.title ?? "").trim() } : {}),
      imageAltText: modal.form.image ? modal.form.imageAltText.trim() : "",
      order: Number(modal.form.order) || 0,
    };
    if (!withTitle) delete f.title;
    if (!f.name) return setError("Name is required.");
    if (f.image && !f.imageAltText) return setError("Enter the photo alt text.");
    setSaving(true);
    setError("");
    try {
      if (modal.id) await api.update(modal.id, f);
      else await api.create(f);
      showSuccess(modal.id ? `${noun} updated.` : `${noun} added.`);
      setModal(null);
      load();
    } catch (err) {
      setError(errorText(err, `Could not save the ${noun.toLowerCase()}.`));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: SpeakerPerson) => {
    if (!(await confirmDelete(`Delete "${s.name}"?`, `The ${noun.toLowerCase()} disappears from the website.`)).isConfirmed) return;
    try {
      await api.remove(s._id);
      showSuccess(`${noun} deleted.`);
      load();
    } catch (err) {
      showError(errorText(err, `Could not delete the ${noun.toLowerCase()}.`));
    }
  };

  const headers = ["S.No", noun, "Organization", ...(withTitle ? ["Title / Topic"] : []), "Order", "Actions"];

  return (
    <SpeakerPageShell title={config.title} description={config.description} websitePath={config.websitePath} action={{ label: `Add ${noun}`, onClick: openNew }}>
      <div className="grid grid-cols-1 gap-[14px] xl:grid-cols-[280px_1fr]">
        <div className="space-y-[14px]">
          <HeadingCard load={api.getHeading} save={api.saveHeading} hint={config.headingHint} />
          <InfoNote>{config.websiteNote}</InfoNote>
        </div>

        <div className="overflow-hidden rounded-[7px] border border-[#e8e5df] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#111844] px-[12px] py-[8px]">
            <h2 className="flex items-center gap-[6px] text-[10px] font-bold uppercase tracking-wider text-white">
              <Users className="h-[13px] w-[13px]" /> {noun}s
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[8.5px]">{items.length}</span>
            </h2>
            <div className="relative">
              <Search className="pointer-events-none absolute left-[8px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 text-white/60" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={`Search ${noun.toLowerCase()}s...`}
                className="h-[28px] w-[220px] rounded-[5px] border border-white/20 bg-white/10 pl-[26px] pr-[8px] text-[10px] text-white outline-none placeholder:text-white/60 focus:border-white/50"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="h-[30px] border-b border-[#e8e5df] bg-[#f4f5f9]">
                  {headers.map((h, i) => (
                    <th key={h} className={`px-[12px] py-[6px] text-[8.5px] font-bold uppercase tracking-wider text-[#111844] ${i === 0 ? "w-[54px]" : ""} ${i === headers.length - 1 ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0ec]">
                {loading ? (
                  <tr><td colSpan={headers.length} className="py-10 text-center">
                    <span className="inline-flex items-center gap-2 text-[11px] text-[#6c7587]"><Loader2 className="h-4 w-4 animate-spin text-[#293681]" /> Loading...</span>
                  </td></tr>
                ) : !rows.length ? (
                  <tr><td colSpan={headers.length} className="py-10 text-center text-[10px] text-[#6c7587]">
                    {search ? `No ${noun.toLowerCase()} matches your search.` : `No ${noun.toLowerCase()}s added yet.`}
                  </td></tr>
                ) : rows.map((s, i) => (
                  <tr key={s._id} className="hover:bg-slate-50/80">
                    <Cell className="font-semibold text-[#293681]">{(safePage - 1) * PAGE_SIZE + i + 1}</Cell>
                    <Cell>
                      <div className="flex min-w-[220px] items-center gap-[10px]">
                        <PersonAvatar name={s.name} image={s.image} alt={s.imageAltText} />
                        <div className="min-w-0">
                          <p className="truncate text-[10.5px] font-bold text-[#4B1426]">{s.name}</p>
                          <p className="line-clamp-1 text-[8.5px] font-semibold text-[#0A7C6E]" title={s.designation}>{s.designation || "—"}</p>
                        </div>
                      </div>
                    </Cell>
                    <Cell className="font-semibold">{s.organization || "—"}</Cell>
                    {withTitle && <Cell>{s.title || "—"}</Cell>}
                    <Cell className="font-bold">{s.order}</Cell>
                    <Cell>
                      <RowActions
                        onEdit={() => { setError(""); const { _id, ...rest } = s; setModal({ id: _id, form: { ...empty, ...rest } }); }}
                        onDelete={() => remove(s)}
                      />
                    </Cell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between border-t border-[#f0f0ec] px-[12px] py-[8px] text-[9px] text-[#64748b]">
              <span>Showing {(safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} results</span>
              <div className="flex items-center gap-1">
                <button type="button" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}
                  className="flex h-[24px] items-center gap-1 rounded-[4px] border border-[#e2e8f0] px-2 font-semibold hover:bg-slate-50 disabled:opacity-40">
                  <ChevronLeft className="h-3 w-3" /> Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button key={n} type="button" onClick={() => setPage(n)}
                    className={`h-[24px] min-w-[24px] rounded-[4px] border px-1 font-bold ${n === safePage ? "border-[#111844] bg-[#111844] text-white" : "border-[#e2e8f0] hover:bg-slate-50"}`}>
                    {n}
                  </button>
                ))}
                <button type="button" disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}
                  className="flex h-[24px] items-center gap-1 rounded-[4px] border border-[#e2e8f0] px-2 font-semibold hover:bg-slate-50 disabled:opacity-40">
                  Next <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={Boolean(modal)} onClose={() => setModal(null)} title={modal?.id ? `Edit ${noun}` : `Add ${noun}`} size="lg"
        footer={<ModalFooter onCancel={() => setModal(null)} onSave={save} saving={saving} label={modal?.id ? "Save Changes" : `Add ${noun}`} />}>
        {modal && (
          <div className="space-y-3">
            <div className="grid grid-cols-[2fr_1fr] gap-3">
              <Input label="Name" required maxLength={100} placeholder={config.namePlaceholder} value={modal.form.name} onChange={(e) => setForm({ name: e.target.value })} />
              <Input label="Order" type="number" min={0} value={String(modal.form.order)} onChange={(e) => setForm({ order: Number(e.target.value) })} hint="Lowest shows first" />
            </div>
            <Textarea label="Designation" rows={2} maxLength={200} placeholder="e.g. Director" value={modal.form.designation} onChange={(e) => setForm({ designation: e.target.value })} />
            <Input label="Organization" maxLength={120} placeholder="e.g. AIIMS Delhi" value={modal.form.organization} onChange={(e) => setForm({ organization: e.target.value })} />
            {withTitle && (
              <Input label="Title / Topic" maxLength={80} placeholder="e.g. Traditional Knowledge & Sustainability" value={modal.form.title ?? ""}
                onChange={(e) => setForm({ title: e.target.value })} />
            )}
            <div className="grid grid-cols-[auto_1fr] items-end gap-3 rounded-[6px] border border-[#e2e8f0] bg-slate-50/50 p-3">
              <CloudImageField upload={api.uploadImage} label="Photo" value={modal.form.image}
                onChange={(v) => setForm({ image: v })} hint="Square photo, face in the centre" previewClass="h-[64px] w-[64px]" />
              <Input label="Photo Alt Text" required={Boolean(modal.form.image)} maxLength={150} disabled={!modal.form.image}
                placeholder={modal.form.name ? `${modal.form.name}, ${modal.form.designation || "speaker"}` : "Describe the photo (for SEO)"}
                value={modal.form.imageAltText} onChange={(e) => setForm({ imageAltText: e.target.value })} />
            </div>
            {error && <p className="text-[10px] font-semibold text-red-500">{error}</p>}
          </div>
        )}
      </Modal>
    </SpeakerPageShell>
  );
}
