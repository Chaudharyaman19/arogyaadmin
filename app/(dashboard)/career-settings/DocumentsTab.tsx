"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FileText, Settings, Eye, Check, GripVertical, Image as ImageIcon,
  GraduationCap, Briefcase, IdCard, Link as LinkIcon, Paperclip, ChevronDown,
  CloudUpload, Lightbulb
} from "lucide-react";
import Swal from "sweetalert2";
import { DEFAULT_DOCUMENTS, loadSection, saveSection, type DocumentsSettingsData } from "@/lib/careersSettings";
import type { RegisterTabActions } from "./page";

const Toggle2 = ({ checked, onChange }: { checked: boolean; onChange?: (next: boolean) => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={!onChange}
    onClick={() => onChange?.(!checked)}
    className={`w-[22px] h-[12px] flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out ${onChange ? "cursor-pointer" : "cursor-default"} ${checked ? 'bg-[#148943]' : 'bg-[#E1E6EC]'}`}
  >
    <div className={`bg-white w-[8px] h-[8px] rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-[10px]' : 'translate-x-0'}`} />
  </button>
);

const CheckboxSquare = ({ checked, onChange, label }: { checked: boolean; onChange?: (next: boolean) => void; label?: string }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    aria-label={label}
    disabled={!onChange}
    onClick={() => onChange?.(!checked)}
    className={`w-[12px] h-[12px] rounded-[3px] flex items-center justify-center flex-shrink-0 ${checked ? 'bg-[#2563EB]' : 'border border-[#E0E5EB] bg-white'} ${onChange ? "cursor-pointer" : "cursor-default"}`}
  >
    {checked && <Check size={8} className="text-white" strokeWidth={3} />}
  </button>
);

const DOC_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  resume: { icon: FileText, color: "text-[#2563EB]", bg: "bg-[#EFF6FF]" },
  photo: { icon: ImageIcon, color: "text-[#10B981]", bg: "bg-[#ECFDF5]" },
  eduCerts: { icon: GraduationCap, color: "text-[#8B5CF6]", bg: "bg-[#F5F3FF]" },
  expCerts: { icon: Briefcase, color: "text-[#F59E0B]", bg: "bg-[#FFFBEB]" },
  idProof: { icon: IdCard, color: "text-[#EC4899]", bg: "bg-[#FDF2F8]" },
  portfolio: { icon: LinkIcon, color: "text-[#9333EA]", bg: "bg-[#FAF5FF]" },
  other: { icon: Paperclip, color: "text-[#EF4444]", bg: "bg-[#FEF2F2]" },
};

const ADDITIONAL_SETTINGS = [
  { key: "multiStep", label: "Enable multi-step application form" },
  { key: "progressBar", label: "Show progress bar" },
  { key: "draftSave", label: "Enable draft save (candidate can resume later)" },
  { key: "terms", label: "Enable terms & conditions checkbox" },
  { key: "recaptcha", label: "Enable reCAPTCHA (Bot protection)" },
  { key: "multipleApps", label: "Allow multiple applications per candidate" },
  { key: "timeEstimate", label: "Show expected time to complete form" },
];

export default function DocumentsTab({ registerActions }: { registerActions?: RegisterTabActions }) {
  const [data, setData] = useState<DocumentsSettingsData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [editingConfirm, setEditingConfirm] = useState(false);
  const dataRef = useRef<DocumentsSettingsData | null>(null);
  dataRef.current = data;

  const load = useCallback(() => {
    setLoadError("");
    setData(null);
    loadSection<DocumentsSettingsData>("documents")
      .then(setData)
      .catch((err) => setLoadError((err as Error)?.message || "Could not load settings"));
  }, []);

  useEffect(() => { load(); }, [load, reloadKey]);

  const patchDoc = (id: string, p: Partial<DocumentsSettingsData["documents"][number]>) =>
    setData((prev) => (prev ? { ...prev, documents: prev.documents.map((d) => (d.id === id ? { ...d, ...p } : d)) } : prev));
  const patchField = (name: string, p: Partial<DocumentsSettingsData["fields"][number]>) =>
    setData((prev) => (prev ? { ...prev, fields: prev.fields.map((f) => (f.name === name ? { ...f, ...p } : f)) } : prev));
  const patchSetting = (key: string, value: boolean) =>
    setData((prev) => (prev ? { ...prev, settings: { ...prev.settings, [key]: value } } : prev));

  const save = async () => {
    const current = dataRef.current;
    if (!current || saving) return;
    setSaving(true);
    try {
      const saved = await saveSection<DocumentsSettingsData>("documents", current);
      setData(saved);
      Swal.fire({ icon: "success", title: "Documents & form settings saved", text: "Candidates will see the updated form.", confirmButtonColor: "#148943" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Could not save", text: (err as Error)?.message || "Please try again.", confirmButtonColor: "#dc2626" });
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setData(JSON.parse(JSON.stringify(DEFAULT_DOCUMENTS)));
    Swal.fire({ icon: "info", title: "Reset to defaults", text: "Defaults loaded. Click Save Settings to apply them.", confirmButtonColor: "#148943" });
  };

  useEffect(() => {
    if (!registerActions) return;
    return registerActions(() => ({ save, reset, saving }));
  });

  if (!data) {
    return (
      <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[14px] text-[10px] font-semibold text-[#506083]">
        {loadError ? <span className="text-[#DC2626]">{loadError} </span> : "Loading settings..."}
        <button onClick={() => setReloadKey((k) => k + 1)} className="ml-[8px] text-[#2563EB] font-bold hover:underline">Retry</button>
      </div>
    );
  }

  const previewFields = data.fields.filter((f) => f.show);

  return (
    <>
      {/* Top Section: Banner & Quick Tips */}
      <div className="flex items-stretch gap-[8px] mb-[6px]" style={{ height: '132.1px' }}>
        <div
          className="flex-1 bg-white rounded-[6px] border border-[#E1E6EC] overflow-hidden relative bg-no-repeat"
          style={{ backgroundImage: "url('/apli_f.png')", backgroundPosition: "right center", backgroundSize: "contain" }}
        >
          <div className="flex items-center gap-[10px] relative z-10 w-full h-full py-[4px] px-[10px] bg-gradient-to-r from-white via-white/90 to-transparent">
            <div className="flex items-center justify-center flex-shrink-0">
              <div className="w-[42px] h-[42px] rounded-[8px] bg-[#E4F4E7] flex items-center justify-center text-[#148943]">
                <FileText size={20} />
              </div>
            </div>
            <div className="flex-1 min-w-0 pr-[20px]">
              <h2 className="text-[13px] font-bold text-[#172762] mb-[1px]">Documents & Application Form Settings</h2>
              <p className="text-[8px] font-semibold text-[#506083] whitespace-nowrap overflow-hidden text-ellipsis">Configure required documents, application form fields and validation rules for candidates.</p>
            </div>
          </div>
        </div>

        <div className="w-[280px] bg-[#F8FAFC] border border-[#E1E6EC] rounded-[6px] py-[6px] px-[8px] flex-shrink-0">
          <div className="flex items-center gap-[4px] mb-[4px]">
            <div className="w-[14px] h-[14px] rounded-full bg-[#2563EB] flex items-center justify-center text-white">
              <Lightbulb size={8} />
            </div>
            <h3 className="text-[9px] font-bold text-[#2563EB]">Quick Tips</h3>
          </div>
          <ul className="text-[7.5px] font-semibold text-[#506083] space-y-[1px] list-disc list-inside">
            <li>Enable only essential fields to keep the form simple.</li>
            <li>Set clear file size and format rules.</li>
            <li>You can preview how the form looks to candidates.</li>
            <li>Changes will apply to all job postings.</li>
          </ul>
        </div>
      </div>

      {/* 3 Column Grid */}
      <div className="grid grid-cols-[1.2fr_0.8fr_1fr] gap-[6px]">
        {/* Column 1 */}
        <div className="flex flex-col gap-[6px] h-full">
          {/* Required Documents */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px]">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <FileText size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Required Documents</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Select which documents candidates must upload.</p>
              </div>
            </div>

            <div className="grid grid-cols-[12px_minmax(120px,2fr)_minmax(60px,1fr)_minmax(80px,1.5fr)_minmax(50px,1fr)] gap-[12px] items-center mb-[8px] px-[8px] pb-[8px] border-b border-[#E1E6EC]">
              <div className="w-[12px]"></div>
              <div className="text-[10px] font-bold text-[#172762]">Document</div>
              <div className="text-[10px] font-bold text-[#172762] text-center">Required</div>
              <div className="text-[10px] font-bold text-[#172762]">File Format</div>
              <div className="text-[10px] font-bold text-[#172762]">Max Size</div>
            </div>

            <div className="space-y-[1px]">
              {data.documents.map((row) => {
                const cfg = DOC_ICONS[row.id] || DOC_ICONS.other;
                return (
                  <div key={row.id} className="grid grid-cols-[12px_minmax(120px,2fr)_minmax(60px,1fr)_minmax(80px,1.5fr)_minmax(50px,1fr)] gap-[12px] items-center py-[4px] px-[8px] hover:bg-[#F8FAFC] rounded-[6px] transition-colors group border-b border-[#F1F5F9] last:border-0">
                    <div className="w-[12px] text-[#CBD5E1] group-hover:text-[#94A3B8] transition-colors flex justify-center">
                      <GripVertical size={12} />
                    </div>
                    <div className="flex items-center gap-[8px] overflow-hidden">
                      <div className={`w-[20px] h-[20px] rounded-[4px] flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                        <cfg.icon size={12} />
                      </div>
                      <span className="text-[10px] font-semibold text-[#2C3E5D] truncate">{row.name}</span>
                    </div>
                    <div className="flex justify-center">
                      <CheckboxSquare checked={row.required} label={`Require ${row.name}`} onChange={(v) => patchDoc(row.id, { required: v })} />
                    </div>
                    <div className="text-[9.5px] font-semibold text-[#506083] truncate">{row.format}</div>
                    <div className="text-[10px] font-semibold text-[#506083] truncate">{row.max}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Field Validation Rules */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px] flex-1">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Settings size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Field Validation Rules</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Set validation rules to ensure correct data is submitted.</p>
              </div>
            </div>

            <div className="space-y-[4px]">
              {[
                { label: "Mobile Number", val: "10 digits (India)", eg: "e.g. 9876543210" },
                { label: "Email Address", val: "Valid email format", eg: "e.g. user@domain.com" },
                { label: "CTC Fields", val: "Numeric value only", eg: "e.g. 500000" },
                { label: "Experience", val: "Numeric (in years)", eg: "e.g. 5" },
                { label: "Notice Period", val: "Dropdown (Predefined)", eg: "Configure Options", isLink: true },
                { label: "LinkedIn URL", val: "Valid URL format", eg: "e.g. https://linkedin.com/..." },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-[8px]">
                  <span className="text-[9px] font-semibold text-[#172762] w-[95px] truncate">{item.label}</span>
                  <div className="relative flex-1">
                    <select className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[3px] text-[8.5px] font-semibold text-[#506083] appearance-none outline-none bg-white cursor-default">
                      <option>{item.val}</option>
                    </select>
                    <ChevronDown size={8} className="absolute right-[6px] top-1/2 -translate-y-1/2 text-[#506083] pointer-events-none" />
                  </div>
                  <span className={`text-[8.5px] font-semibold w-[80px] truncate ${item.isLink ? 'text-[#2563EB] cursor-pointer hover:underline' : 'text-[#94A3B8]'}`}>
                    {item.eg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-[6px] h-full">
          {/* Application Form Fields */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px]">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <FileText size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Application Form Fields</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Configure fields in the candidate application form.</p>
              </div>
            </div>

            <div className="grid grid-cols-[12px_minmax(120px,1.5fr)_60px_50px_1fr] gap-[12px] items-end mb-[8px] px-[2px]">
              <div className="w-[12px]"></div>
              <div className="text-[10px] font-bold text-[#172762] pb-[2px]">Field Name</div>
              <div className="text-[10px] font-bold text-[#172762] text-center leading-[1.2]">Show in<br />Form</div>
              <div className="text-[10px] font-bold text-[#172762] text-center pb-[2px]">Required</div>
              <div></div>
            </div>

            <div className="space-y-[1px]">
              {data.fields.map((row) => (
                <div key={row.name} className="grid grid-cols-[12px_minmax(120px,1.5fr)_60px_50px_1fr] gap-[12px] items-center py-[3px] px-[2px] hover:bg-[#F8FAFC] rounded-[4px] transition-colors group border-b border-[#F1F5F9] last:border-0">
                  <div className="w-[12px] text-[#CBD5E1] group-hover:text-[#94A3B8] transition-colors flex justify-center">
                    <GripVertical size={12} />
                  </div>
                  <span className={`text-[10px] font-semibold truncate ${row.show ? "text-[#172762]" : "text-[#94A3B8]"}`}>{row.name}</span>
                  <div className="flex justify-center">
                    <CheckboxSquare checked={row.show} label={`Show ${row.name}`} onChange={(v) => patchField(row.name, { show: v, required: v ? row.required : false })} />
                  </div>
                  <div className="flex justify-center">
                    <CheckboxSquare checked={row.required} label={`Require ${row.name}`} onChange={row.show ? (v) => patchField(row.name, { required: v }) : undefined} />
                  </div>
                  <div></div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Form Settings */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px] flex-1">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Settings size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Additional Form Settings</h3>
              </div>
            </div>

            <div className="space-y-[4px]">
              {ADDITIONAL_SETTINGS.map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold text-[#172762]">{item.label}</span>
                  <Toggle2 checked={!!data.settings[item.key]} onChange={(v) => patchSetting(item.key, v)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-[6px] h-full">
          {/* Form Preview (Candidate View) */}
          <div className="bg-[#F8FAFC] rounded-[6px] border border-[#E1E6EC] p-[8px]">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Eye size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Form Preview (Candidate View)</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">This is how the form will look to candidates on the website.</p>
              </div>
            </div>

            <div className="bg-white border border-[#E1E6EC] rounded-[6px] p-[8px] shadow-sm">
              <h4 className="text-[10px] font-bold text-[#172762] mb-[6px]">Apply for This Position</h4>

              <div className="space-y-[4px]">
                {previewFields.some((f) => f.name === "Full Name" || f.name === "Email Address") && (
                  <div className="grid grid-cols-2 gap-[6px]">
                    {previewFields.filter((f) => f.name === "Full Name" || f.name === "Email Address").map((f) => (
                      <div key={f.name}>
                        <label className="block text-[8px] font-bold text-[#172762] mb-[2px]">{f.name} {f.required && <span className="text-red-500">*</span>}</label>
                        <input disabled type="text" placeholder={`Enter ${f.name.toLowerCase()}`} className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[4px] text-[8px] placeholder-[#94A3B8] bg-[#F8FAFC] outline-none" />
                      </div>
                    ))}
                  </div>
                )}

                {previewFields.some((f) => f.name === "Mobile Number") && (
                  <div>
                    <label className="block text-[8px] font-bold text-[#172762] mb-[2px]">Mobile Number {previewFields.find((f) => f.name === "Mobile Number")?.required && <span className="text-red-500">*</span>}</label>
                    <div className="flex">
                      <div className="border border-[#E1E6EC] border-r-0 rounded-l-[4px] px-[4px] py-[4px] text-[8px] font-semibold text-[#506083] bg-[#F8FAFC] flex items-center gap-[2px]">
                        +91 <ChevronDown size={8} />
                      </div>
                      <input disabled type="text" placeholder="Enter mobile number" className="flex-1 border border-[#E1E6EC] rounded-r-[4px] px-[6px] py-[4px] text-[8px] placeholder-[#94A3B8] bg-[#F8FAFC] outline-none" />
                    </div>
                  </div>
                )}

                {previewFields.some((f) => f.name === "Current Location") && (
                  <div>
                    <label className="block text-[8px] font-bold text-[#172762] mb-[2px]">Current Location</label>
                    <div className="relative">
                      <select disabled className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[4px] text-[8px] font-semibold text-[#94A3B8] appearance-none outline-none bg-[#F8FAFC]">
                        <option>Select location</option>
                      </select>
                      <ChevronDown size={8} className="absolute right-[6px] top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                    </div>
                  </div>
                )}

                {previewFields.some((f) => f.name === "Current CTC" || f.name === "Expected CTC") && (
                  <div className="grid grid-cols-2 gap-[6px]">
                    {previewFields.filter((f) => f.name === "Current CTC" || f.name === "Expected CTC").map((f) => (
                      <div key={f.name}>
                        <label className="block text-[8px] font-bold text-[#172762] mb-[2px]">{f.name}</label>
                        <div className="relative">
                          <select disabled className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[4px] text-[8px] font-semibold text-[#94A3B8] appearance-none outline-none bg-[#F8FAFC]">
                            <option>Select</option>
                          </select>
                          <ChevronDown size={8} className="absolute right-[6px] top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {previewFields.some((f) => f.name === "Total Experience" || f.name === "Notice Period") && (
                  <div className="grid grid-cols-2 gap-[8px]">
                    {previewFields.filter((f) => f.name === "Total Experience" || f.name === "Notice Period").map((f) => (
                      <div key={f.name}>
                        <label className="block text-[8px] font-bold text-[#172762] mb-[2px]">{f.name} {f.required && <span className="text-red-500">*</span>}</label>
                        <div className="relative">
                          <select disabled className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[4px] text-[8px] font-semibold text-[#94A3B8] appearance-none outline-none bg-[#F8FAFC]">
                            <option>Select</option>
                          </select>
                          <ChevronDown size={8} className="absolute right-[6px] top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {data.documents.find((d) => d.id === "resume")?.required && (
                  <div>
                    <label className="block text-[8px] font-bold text-[#172762] mb-[2px]">Upload Resume / CV <span className="text-red-500">*</span></label>
                    <div className="border border-dashed border-[#CBD5E1] rounded-[4px] bg-[#F8FAFC] py-[8px] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#F1F5F9] transition-colors">
                      <CloudUpload size={14} className="text-[#2563EB] mb-[2px]" />
                      <p className="text-[8.5px] font-semibold text-[#172762]">Click to upload <span className="font-medium text-[#506083]">or drag &amp; drop</span></p>
                      <p className="text-[7.5px] font-medium text-[#94A3B8]">PDF, DOC, DOCX (Max 5 MB)</p>
                    </div>
                  </div>
                )}

                {data.documents.filter((d) => d.id !== "resume" && d.required).map((doc) => (
                  <div key={doc.id}>
                    <label className="block text-[8px] font-bold text-[#172762] mb-[2px]">Upload {doc.name} <span className="text-red-500">*</span></label>
                    <div className="border border-dashed border-[#CBD5E1] rounded-[4px] bg-[#F8FAFC] py-[6px] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#F1F5F9] transition-colors">
                      <p className="text-[8px] font-medium text-[#94A3B8]">{doc.format} (Max {doc.max})</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Confirmation Screen */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px] flex-1">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Check size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Confirmation Screen</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Message shown after successful submission.</p>
              </div>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E1E6EC] rounded-[6px] p-[10px] flex flex-col items-center text-center">
              <div className="w-[24px] h-[24px] bg-[#148943] rounded-full flex items-center justify-center text-white mb-[8px] shadow-sm">
                <Check size={14} strokeWidth={3} />
              </div>
              {editingConfirm ? (
                <div className="w-full space-y-[6px] text-left">
                  <input
                    value={data.confirmationTitle}
                    onChange={(e) => setData((prev) => (prev ? { ...prev, confirmationTitle: e.target.value } : prev))}
                    className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[4px] text-[9px] font-bold text-[#172762] outline-none focus:border-[#148943]"
                    placeholder="Confirmation title"
                  />
                  <textarea
                    value={data.confirmationMessage}
                    onChange={(e) => setData((prev) => (prev ? { ...prev, confirmationMessage: e.target.value } : prev))}
                    rows={4}
                    className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[4px] text-[8.5px] font-medium text-[#172762] outline-none focus:border-[#148943] resize-none"
                    placeholder="Confirmation message"
                  />
                  <button onClick={() => setEditingConfirm(false)} className="w-full bg-[#148943] text-white px-[10px] py-[4px] rounded-[4px] text-[9px] font-bold hover:bg-[#117639] transition-colors">
                    Done Editing
                  </button>
                </div>
              ) : (
                <>
                  <h4 className="text-[10px] font-bold text-[#148943] mb-[4px]">{data.confirmationTitle}</h4>
                  <p className="text-[8px] font-semibold text-[#506083] leading-tight mb-[10px] max-w-[85%] mx-auto">
                    {data.confirmationMessage}
                  </p>
                  <button onClick={() => setEditingConfirm(true)} className="bg-white border border-[#D5E6FA] text-[#2563EB] px-[10px] py-[4px] rounded-[4px] text-[9px] font-bold hover:bg-[#EEF4FF] transition-colors">
                    Edit Confirmation Message
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
