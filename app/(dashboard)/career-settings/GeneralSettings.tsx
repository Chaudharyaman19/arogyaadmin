"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Settings, Brain, FileText, MessageSquare, Users, Bell, Edit, Check, AlertTriangle, Info, ChevronDown, Eye, Mail } from "lucide-react";
import Swal from "sweetalert2";
import {
  DEFAULT_GENERAL, DEFAULT_TEMPLATES, NOTIFY_RECIPIENT_OPTIONS,
  loadSection, saveSection, liveCareersUrl,
  type GeneralSettingsData,
} from "@/lib/careersSettings";
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

const inputCls = "flex-1 border border-[#E1E6EC] rounded-[4px] px-[6px] py-[3px] text-[9px] font-semibold text-[#172762] outline-none focus:border-[#148943]";

const DOC_ROWS = [
  { key: "resume", label: "Resume / CV", desc: "PDF, DOC, DOCX (Max 5 MB)" },
  { key: "photo", label: "Passport Size Photo", desc: "JPG, PNG (Max 2 MB)" },
  { key: "eduCerts", label: "Educational Certificates (Optional)", desc: "" },
  { key: "expCerts", label: "Experience Certificates (Optional)", desc: "" },
  { key: "additional", label: "Additional Documents (Optional)", desc: "" },
];
const FIELD_ROWS = [
  { key: "location", label: "Current Location" },
  { key: "expectedCtc", label: "Expected CTC" },
  { key: "totalExperience", label: "Total Experience" },
  { key: "currentCompany", label: "Current Company" },
  { key: "willingToRelocate", label: "Willing to Relocate" },
];
const NOTIFY_ROWS = [
  { key: "forwardToHr", label: "Notify HR when application is forwarded", on: true },
  { key: "ackCandidate", label: "Notify candidate when application is received", on: true },
  { key: "resultCandidate", label: "Notify candidate on result (Eligible/Not Eligible)", on: true },
  { key: "hrStatusUpdates", label: "Notify HR on status updates (Shortlisted, Interview, etc.)", on: true },
  { key: "dailySummary", label: "Send daily application summary to HR", on: false },
  { key: "weeklyReport", label: "Send weekly report to Admin", on: false },
];

export default function GeneralSettings({ registerActions, onNavigate }: {
  registerActions?: RegisterTabActions;
  onNavigate?: (tab: string) => void;
}) {
  const [data, setData] = useState<GeneralSettingsData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [recipientInput, setRecipientInput] = useState("");
  const dataRef = useRef<GeneralSettingsData | null>(null);
  dataRef.current = data;

  const load = useCallback(() => {
    setLoadError("");
    setData(null);
    loadSection<GeneralSettingsData>("general")
      .then((loaded) => setData(loaded))
      .catch((err) => setLoadError((err as Error)?.message || "Could not load settings"));
  }, []);

  useEffect(() => { load(); }, [load, reloadKey]);

  const patch = (p: Partial<GeneralSettingsData>) => setData((prev) => (prev ? { ...prev, ...p } : prev));
  const patchMap = (field: "screeningAreas" | "docs" | "formFields" | "notify", key: string, value: boolean) =>
    setData((prev) => (prev ? { ...prev, [field]: { ...prev[field], [key]: value } } : prev));

  const save = async () => {
    const current = dataRef.current;
    if (!current || saving) return;
    setSaving(true);
    try {
      const saved = await saveSection<GeneralSettingsData>("general", current);
      setData(saved);
      Swal.fire({ icon: "success", title: "General settings saved", text: "Your career module settings are updated.", confirmButtonColor: "#148943" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Could not save", text: (err as Error)?.message || "Please try again.", confirmButtonColor: "#dc2626" });
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setData({ ...DEFAULT_GENERAL });
    Swal.fire({ icon: "info", title: "Reset to defaults", text: "Defaults loaded. Click Save Settings to apply them.", confirmButtonColor: "#148943" });
  };

  useEffect(() => {
    if (!registerActions) return;
    return registerActions(() => ({ save, reset, saving }));
  });

  const addRecipient = () => {
    const value = recipientInput.trim().replace(/,$/, "");
    if (!value) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      Swal.fire({ icon: "warning", title: "Invalid email", text: `"${value}" is not a valid email address.`, confirmButtonColor: "#dc2626" });
      return;
    }
    if (data && data.adminRecipients.includes(value)) {
      setRecipientInput("");
      return;
    }
    patch({ adminRecipients: [...(data?.adminRecipients || []), value] });
    setRecipientInput("");
  };

  const showAckPreview = () => {
    const ack = DEFAULT_TEMPLATES.find((t) => t.id === "ack")!;
    Swal.fire({
      icon: "info",
      title: "Auto Acknowledgement Email",
      html: `<div style="text-align:left;font-size:12px;">
        <p><b>Subject:</b> ${ack.subject}</p>
        <hr style="margin:8px 0;border:none;border-top:1px solid #e5e7eb;" />
        <pre style="white-space:pre-wrap;font-family:inherit;font-size:12px;">${ack.body.replace(/</g, "&lt;")}</pre>
      </div>`,
      confirmButtonColor: "#148943",
      width: 560,
    });
  };

  if (!data) {
    return (
      <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[14px] text-[10px] font-semibold text-[#506083]">
        {loadError ? (
          <span className="text-[#DC2626]">{loadError} </span>
        ) : ("Loading settings...")}
        <button onClick={() => setReloadKey((k) => k + 1)} className="ml-[8px] text-[#2563EB] font-bold hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-[6px]">
      {/* Basic Settings */}
      <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px] flex flex-col">
        <div className="flex items-center gap-[6px] mb-[10px]">
          <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
            <Settings size={16} />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-[#172762]">Basic Settings</h3>
            <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Manage general settings for the career module.</p>
          </div>
        </div>

        <div className="space-y-[6px] flex-1">
          <div className="flex items-start justify-between">
            <span className="text-[9px] font-bold text-[#172762] w-[110px]">Career Module Status</span>
            <div className="flex-1 flex flex-col gap-[3px] items-start">
              <div className="flex items-center gap-[4px]">
                <Toggle2 checked={data.moduleActive} onChange={(v) => patch({ moduleActive: v })} />
                <span className="text-[9px] font-bold text-[#172762]">{data.moduleActive ? "Active" : "Inactive"}</span>
              </div>
              <div className={`${data.moduleActive ? "bg-[#E4F4E7] text-[#148943]" : "bg-[#FEE2E2] text-[#DC2626]"} px-[6px] py-[2px] rounded-[3px] text-[8px] font-bold w-full`}>
                {data.moduleActive ? "Career page is live on website." : "Career page is hidden from website."}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-[#172762] w-[110px]">Career Page Title</span>
            <input value={data.pageTitle} onChange={(e) => patch({ pageTitle: e.target.value })} className={inputCls} />
          </div>

          <div className="flex items-start justify-between">
            <span className="text-[9px] font-bold text-[#172762] w-[110px] pt-[4px]">Career Page URL Slug</span>
            <div className="flex-1 flex flex-col gap-[3px]">
              <input value={data.slug} onChange={(e) => patch({ slug: e.target.value.replace(/\s+/g, "-").toLowerCase() })} className="w-full border border-[#E1E6EC] rounded-[4px] px-[6px] py-[3px] text-[9px] font-semibold text-[#172762] outline-none focus:border-[#148943]" />
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-semibold text-[#506083] truncate max-w-[120px]">https://arogyabharat.org/{data.slug}</span>
                <button onClick={() => window.open(liveCareersUrl(), "_blank")} className="text-[8px] font-bold text-[#2563EB] flex items-center gap-[2px] hover:underline whitespace-nowrap"><Eye size={10} /> View Page</button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-[#172762] w-[110px]">Default From Email</span>
            <input value={data.fromEmail} onChange={(e) => patch({ fromEmail: e.target.value })} className={inputCls} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-[#172762] w-[110px]">Reply To Email</span>
            <input value={data.replyTo} onChange={(e) => patch({ replyTo: e.target.value })} className={inputCls} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-[#172762] w-[110px]">Application Auto<br />Acknowledgement</span>
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center gap-[4px]">
                <Toggle2 checked={data.autoAck} onChange={(v) => patch({ autoAck: v })} />
                <span className="text-[9px] font-bold text-[#172762]">{data.autoAck ? "Enable" : "Disabled"}</span>
              </div>
              <button onClick={showAckPreview} className="text-[9px] font-bold text-[#2563EB] border border-[#2563EB] rounded-[3px] px-[6px] py-[3px] flex items-center gap-[3px] hover:bg-[#EEF4FF] transition-colors whitespace-nowrap"><Mail size={10} /> Preview Email</button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Eligibility Settings */}
      <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px] flex flex-col">
        <div className="flex items-center justify-between mb-[10px]">
          <div className="flex items-center gap-[6px]">
            <div className="w-[30px] h-[30px] rounded-[4px] bg-[#F3E8FF] text-[#7550EF] flex items-center justify-center border border-[#E9D5FF]">
              <Brain size={16} />
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-[#172762]">AI Eligibility Settings</h3>
              <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Set eligibility criteria for AI screening and application.</p>
            </div>
          </div>
          <button onClick={() => onNavigate?.("AI Eligibility & Screening")} className="text-[8px] font-bold text-[#2563EB] flex items-center gap-[1px] hover:underline whitespace-nowrap"><Edit size={9} /> Full</button>
        </div>

        <div className="space-y-[8px] flex-1">
          <div>
            <label className="block text-[9px] font-bold text-[#172762] mb-[4px]">Minimum AI Eligibility Score (%)</label>
            <div className="relative">
              <input type="number" min={0} max={100} value={data.minScore} onChange={(e) => patch({ minScore: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} className="w-full border border-[#E1E6EC] rounded-[4px] px-[8px] py-[4px] text-[9px] font-bold text-[#172762] outline-none focus:border-[#148943]" />
              <div className="absolute right-[8px] top-1/2 -translate-y-1/2 flex flex-col">
                <button type="button" onClick={() => patch({ minScore: Math.min(100, data.minScore + 1) })} className="text-[#506083] hover:text-[#172762]"><ChevronDown size={8} className="rotate-180" /></button>
                <button type="button" onClick={() => patch({ minScore: Math.max(0, data.minScore - 1) })} className="text-[#506083] hover:text-[#172762]"><ChevronDown size={8} /></button>
              </div>
            </div>
            <p className="mt-[4px] text-[8px] font-semibold text-[#506083] leading-tight">Candidates with score {data.minScore}% or above<br />can proceed to application form.</p>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-[#172762] mb-[4px]">AI Screening Areas</label>
            <div className="bg-[#F8FAFC] border border-[#E1E6EC] rounded-[4px] p-[8px] space-y-[4px]">
              {[
                { key: "skills", label: "Skills Match" },
                { key: "experience", label: "Experience Match" },
                { key: "education", label: "Education Match" },
                { key: "role", label: "Role Relevance" },
                { key: "industry", label: "Industry Fit" },
              ].map((item) => (
                <button key={item.key} type="button" onClick={() => patchMap("screeningAreas", item.key, !data.screeningAreas[item.key])} className="flex items-center gap-[6px] w-full text-left">
                  <div className={`w-[10px] h-[10px] rounded-[2px] flex items-center justify-center ${data.screeningAreas[item.key] ? "bg-[#2563EB] text-white" : "bg-white border border-[#CBD5E1] text-transparent"}`}>
                    <Check size={8} strokeWidth={3} />
                  </div>
                  <span className="text-[9px] font-semibold text-[#172762]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#E8F1FF] border border-[#D5E6FA] rounded-[4px] p-[8px] flex gap-[6px] items-start mt-[auto]">
            <div className="w-[12px] h-[12px] rounded-full bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0 mt-[1px]">
              <Info size={8} />
            </div>
            <p className="text-[9px] font-semibold text-[#2563EB] leading-tight">Candidates below {data.minScore}% will see a &quot;Not Eligible&quot; result page with guidance.</p>
          </div>
        </div>
      </div>

      {/* Documents & Application Form */}
      <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px] flex flex-col">
        <div className="flex items-center justify-between mb-[10px]">
          <div className="flex items-center gap-[6px]">
            <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-[#172762]">Documents & Application Form</h3>
              <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Configure required documents and form fields.</p>
            </div>
          </div>
        </div>

        <div className="space-y-[10px] flex-1 flex flex-col">
          <div>
            <h4 className="text-[9px] font-bold text-[#172762] mb-[6px]">Required Documents</h4>
            <div className="space-y-[4px]">
              {DOC_ROWS.map((doc) => (
                <div key={doc.key} className="flex items-center justify-between">
                  <div onClick={() => patchMap("docs", doc.key, !data.docs[doc.key])} className="flex items-center gap-[4px] text-left cursor-pointer">
                    <Toggle2 checked={!!data.docs[doc.key]} onChange={(v) => patchMap("docs", doc.key, v)} />
                    <span className="text-[9px] font-semibold text-[#172762]">{doc.label}</span>
                  </div>
                  {doc.desc && <span className="text-[8px] font-semibold text-[#506083]">{doc.desc}</span>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[9px] font-bold text-[#172762] mb-[6px]">Application Form Fields</h4>
            <div className="grid grid-cols-2 gap-y-[4px] gap-x-[8px]">
              {FIELD_ROWS.map((field) => (
                <div key={field.key} onClick={() => patchMap("formFields", field.key, !data.formFields[field.key])} className="flex items-center gap-[4px] text-left cursor-pointer">
                  <Toggle2 checked={!!data.formFields[field.key]} onChange={(v) => patchMap("formFields", field.key, v)} />
                  <span className="text-[9px] font-semibold text-[#172762]">{field.label}</span>
                </div>
              ))}
            </div>
            <div onClick={() => patchMap("formFields", "portfolio", !data.formFields.portfolio)} className="flex items-center gap-[4px] mt-[4px] cursor-pointer">
              <Toggle2 checked={!!data.formFields.portfolio} onChange={(v) => patchMap("formFields", "portfolio", v)} />
              <span className="text-[9px] font-semibold text-[#172762]">Portfolio / Work Samples <span className="text-[#506083]">(For specific roles)</span></span>
            </div>
          </div>

          <div className="flex justify-end mt-auto pt-[6px]">
            <button onClick={() => onNavigate?.("Documents & Application Form")} className="text-[9px] font-bold text-[#2563EB] border border-[#2563EB] rounded-[3px] px-[8px] py-[4px] flex items-center gap-[3px] hover:bg-[#EEF4FF] transition-colors">
              <Settings size={10} /> Configure Form Fields
            </button>
          </div>
        </div>
      </div>

      {/* Result Messages */}
      <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px] flex flex-col">
        <div className="flex items-center gap-[6px] mb-[10px]">
          <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
            <MessageSquare size={16} />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-[#172762]">Result Messages</h3>
            <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Set custom messages for candidate result screens.</p>
          </div>
        </div>

        <div className="space-y-[6px] flex-1">
          <div className="bg-[#E4F4E7] rounded-[4px] p-[8px] flex items-start justify-between border border-[#CDEBD4]">
            <div className="flex items-start gap-[6px]">
              <div className="w-[16px] h-[16px] rounded-full bg-[#148943] text-white flex items-center justify-center flex-shrink-0 mt-[1px]">
                <Check size={10} strokeWidth={3} />
              </div>
              <div>
                <h4 className="text-[9px] font-bold text-[#148943]">Eligible (Pass)</h4>
                <p className="text-[8px] font-semibold text-[#172762] mt-[1px]">Message shown to candidates with score ≥ {data.minScore}%.</p>
              </div>
            </div>
            <button onClick={() => onNavigate?.("Result Messages")} className="bg-white border border-[#CDEBD4] text-[#2563EB] px-[6px] py-[2px] rounded-[3px] text-[9px] font-bold hover:bg-[#F8FAFC]">Edit</button>
          </div>

          <div className="bg-[#FFF1D8] rounded-[4px] p-[8px] flex items-start justify-between border border-[#FDE0A6]">
            <div className="flex items-start gap-[6px]">
              <div className="w-[16px] h-[16px] rounded-full bg-[#E29515] text-white flex items-center justify-center flex-shrink-0 mt-[1px]">
                <AlertTriangle size={10} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-[9px] font-bold text-[#E29515]">Not Eligible (Fail)</h4>
                <p className="text-[8px] font-semibold text-[#172762] mt-[1px]">Message shown to candidates with score &lt; {data.minScore}%.</p>
              </div>
            </div>
            <button onClick={() => onNavigate?.("Result Messages")} className="bg-white border border-[#FDE0A6] text-[#2563EB] px-[6px] py-[2px] rounded-[3px] text-[9px] font-bold hover:bg-[#F8FAFC]">Edit</button>
          </div>

          <div className="bg-[#E8F1FF] rounded-[4px] p-[8px] flex items-start justify-between border border-[#D5E6FA]">
            <div className="flex items-start gap-[6px]">
              <div className="w-[16px] h-[16px] rounded-full bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0 mt-[1px]">
                <Info size={10} strokeWidth={3} />
              </div>
              <div>
                <h4 className="text-[9px] font-bold text-[#2563EB]">Incomplete Application</h4>
                <p className="text-[8px] font-semibold text-[#172762] mt-[1px]">Message for incomplete or abandoned application.</p>
              </div>
            </div>
            <button onClick={() => onNavigate?.("Result Messages")} className="bg-white border border-[#D5E6FA] text-[#2563EB] px-[6px] py-[2px] rounded-[3px] text-[9px] font-bold hover:bg-[#F8FAFC]">Edit</button>
          </div>
        </div>
      </div>

      {/* HR & Workflow Settings */}
      <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px] flex flex-col">
        <div className="flex items-center justify-between mb-[10px]">
          <div className="flex items-center gap-[6px]">
            <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
              <Users size={16} />
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-[#172762]">HR & Workflow Settings</h3>
              <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Manage HR recipients and application workflow.</p>
            </div>
          </div>
          <button onClick={() => onNavigate?.("HR & Workflow")} className="text-[8px] font-bold text-[#2563EB] flex items-center gap-[1px] hover:underline whitespace-nowrap"><Edit size={9} /> Full</button>
        </div>

        <div className="space-y-[10px] flex-1">
          <div>
            <label className="block text-[9px] font-bold text-[#172762] mb-[4px]">Default HR Recipients</label>
            <div className="border border-[#E1E6EC] rounded-[4px] p-[4px] flex flex-wrap gap-[3px] relative">
              {NOTIFY_RECIPIENT_OPTIONS.map((chip) => (
                <div key={chip} className="bg-[#E8F1FF] text-[#2563EB] text-[9px] font-bold px-[4px] py-[2px] rounded-[3px] flex items-center gap-[3px]">
                  {chip}
                  <button onClick={() => onNavigate?.("HR & Workflow")} className="hover:text-blue-800 text-[10px]" title="Manage in HR & Workflow">&times;</button>
                </div>
              ))}
              <button onClick={() => onNavigate?.("HR & Workflow")} className="text-[9px] font-bold text-[#148943] px-[4px]">+ Add</button>
            </div>
            <p className="mt-[3px] text-[8px] font-semibold text-[#506083]">Manage the full list in the HR &amp; Workflow tab.</p>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-[#172762] mb-[4px]">Application Workflow</label>
            <div className="space-y-[4px]">
              {[
                'Application Submitted (Auto)',
                'AI Analysis (Auto)',
                'Eligible -> Application Form (Auto)',
                'Sent to HR (Manual - by Website Team)',
                'HR Review (By HR)',
                'Shortlisted / Interview / Selected / Rejected (By HR)'
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-[6px]">
                  <div className={`w-[12px] h-[12px] rounded-full text-[8px] font-bold flex items-center justify-center flex-shrink-0 ${i < 4 ? 'bg-[#E4F4E7] text-[#148943]' : 'bg-[#FFF1D8] text-[#E29515]'}`}>
                    {i + 1}
                  </div>
                  <span className="text-[9px] font-semibold text-[#172762]">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px] flex flex-col relative">
        <div className="flex items-center justify-between mb-[10px]">
          <div className="flex items-center gap-[6px]">
            <div className="w-[30px] h-[30px] rounded-[4px] bg-[#FFF1D8] text-[#E29515] flex items-center justify-center border border-[#FDE0A6]">
              <Bell size={16} />
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-[#172762]">Notification Settings</h3>
              <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Manage email notifications for different stages.</p>
            </div>
          </div>
          <button onClick={() => onNavigate?.("Notifications")} className="text-[8px] font-bold text-[#2563EB] flex items-center gap-[1px] hover:underline whitespace-nowrap"><Edit size={9} /> Full</button>
        </div>

        <div className="space-y-[6px] flex-1">
          {NOTIFY_ROWS.map((item) => (
            <div key={item.key} onClick={() => patchMap("notify", item.key, !data.notify[item.key])} className="flex items-center gap-[4px] text-left w-full cursor-pointer">
              <Toggle2 checked={!!data.notify[item.key]} onChange={(v) => patchMap("notify", item.key, v)} />
              <span className="text-[9px] font-semibold text-[#172762]">{item.label}</span>
            </div>
          ))}

          <div className="pt-[4px]">
            <label className="block text-[9px] font-bold text-[#172762] mb-[4px]">Notification Recipients (Admin)</label>
            <div className="border border-[#E1E6EC] rounded-[4px] p-[4px] flex flex-wrap gap-[3px] relative">
              {data.adminRecipients.map((email) => (
                <div key={email} className="bg-[#E8F1FF] text-[#2563EB] text-[9px] font-bold px-[4px] py-[2px] rounded-[3px] flex items-center gap-[3px]">
                  {email}
                  <button onClick={() => patch({ adminRecipients: data.adminRecipients.filter((e) => e !== email) })} className="hover:text-blue-800 text-[10px]" title="Remove">&times;</button>
                </div>
              ))}
              <input
                type="text"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addRecipient(); }
                }}
                onBlur={addRecipient}
                placeholder="Add email & press Enter"
                className="outline-none text-[9px] min-w-[100px] flex-1 bg-transparent placeholder-[#94A3B8]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
