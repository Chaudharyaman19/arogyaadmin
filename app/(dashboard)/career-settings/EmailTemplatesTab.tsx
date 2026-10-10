"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Mail, Lightbulb, Plus, Edit, Search,
  Settings, Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, ChevronDown, Send, Trash2
} from "lucide-react";
import Swal from "sweetalert2";
import { DEFAULT_TEMPLATES, loadSection, saveSection, sendTestNotification, type EmailTemplate, type EmailTemplatesSettingsData } from "@/lib/careersSettings";
import type { RegisterTabActions } from "./page";

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange?: (next: boolean) => void; label?: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={!onChange}
    onClick={() => onChange?.(!checked)}
    className={`w-[24px] h-[14px] flex items-center rounded-full p-[2px] transition-colors duration-200 ease-in-out ${onChange ? "cursor-pointer" : "cursor-not-allowed opacity-60"} ${checked ? 'bg-[#148943]' : 'bg-[#E1E6EC]'}`}
  >
    <div className={`bg-white w-[10px] h-[10px] rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-[10px]' : 'translate-x-0'}`} />
  </button>
);

const VARIABLES = [
  { var: "{{candidate_name}}", desc: "Candidate's full name" },
  { var: "{{job_title}}", desc: "Job position title" },
  { var: "{{company_name}}", desc: "Arogya Bharat" },
  { var: "{{application_link}}", desc: "Link to application" },
  { var: "{{current_ctc}}", desc: "Current CTC (if provided)" },
  { var: "{{expected_ctc}}", desc: "Expected CTC (if provided)" },
  { var: "{{total_experience}}", desc: "Total work experience" },
  { var: "{{current_location}}", desc: "Current location" },
  { var: "{{interview_date}}", desc: "Interview date" },
  { var: "{{interview_time}}", desc: "Interview time" },
  { var: "{{interview_mode}}", desc: "Interview mode (Online/Office)" },
  { var: "{{hr_email}}", desc: "HR email address" },
];

export default function EmailTemplatesTab({ registerActions }: { registerActions?: RegisterTabActions }) {
  const [data, setData] = useState<EmailTemplatesSettingsData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedId, setSelectedId] = useState("interview");
  const [testTo, setTestTo] = useState("");
  const dataRef = useRef<EmailTemplatesSettingsData | null>(null);
  dataRef.current = data;
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  const load = useCallback(() => {
    setLoadError("");
    setData(null);
    loadSection<EmailTemplatesSettingsData>("emailTemplates")
      .then(setData)
      .catch((err) => setLoadError((err as Error)?.message || "Could not load templates"));
  }, []);

  useEffect(() => { load(); }, [load, reloadKey]);

  const patchTemplate = (id: string, p: Partial<EmailTemplate>) =>
    setData((prev) => (prev ? { ...prev, templates: prev.templates.map((t) => (t.id === id ? { ...t, ...p } : t)) } : prev));

  const selected = data?.templates.find((t) => t.id === selectedId) || data?.templates[0];

  const save = async () => {
    const current = dataRef.current;
    if (!current || saving) return;
    setSaving(true);
    try {
      const saved = await saveSection<EmailTemplatesSettingsData>("emailTemplates", current);
      setData(saved);
      Swal.fire({ icon: "success", title: "Templates saved", text: "Email templates are updated.", confirmButtonColor: "#148943" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Could not save", text: (err as Error)?.message || "Please try again.", confirmButtonColor: "#dc2626" });
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setData({ templates: JSON.parse(JSON.stringify(DEFAULT_TEMPLATES)) });
    setSelectedId("interview");
    Swal.fire({ icon: "info", title: "Reset to defaults", text: "Default templates loaded. Click Save Settings to apply them.", confirmButtonColor: "#148943" });
  };

  useEffect(() => {
    if (!registerActions) return;
    return registerActions(() => ({ save, reset, saving }));
  });

  const addTemplate = () => {
    const id = `custom-${Date.now()}`;
    const next: EmailTemplate = {
      id,
      name: "New Template",
      trigger: "Custom template",
      icon: "blue-info",
      active: true,
      subject: "New message | Arogya Bharat",
      body: "Dear {{candidate_name}},\n\nWrite your message here.\n\nBest regards,\nArogya Bharat Team",
    };
    setData((prev) => (prev ? { ...prev, templates: [...prev.templates, next] } : prev));
    setSelectedId(id);
  };

  const removeTemplate = (id: string) => {
    const tpl = data?.templates.find((t) => t.id === id);
    Swal.fire({
      icon: "warning",
      title: "Delete template?",
      text: `"${tpl?.name}" will be removed.`,
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    }).then((res) => {
      if (!res.isConfirmed) return;
      setData((prev) => {
        if (!prev) return prev;
        const templates = prev.templates.filter((t) => t.id !== id);
        if (selectedId === id && templates[0]) setSelectedId(templates[0].id);
        return { ...prev, templates };
      });
    });
  };

  const insertVariable = (variable: string) => {
    const el = bodyRef.current;
    if (!el || !selected) {
      setData((prev) => (prev ? { ...prev, templates: prev.templates.map((t) => (t.id === selected?.id ? { ...t, body: t.body + variable } : t)) } : prev));
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const body = selected.body.slice(0, start) + variable + selected.body.slice(end);
    patchTemplate(selected.id, { body });
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + variable.length;
    });
  };

  const runTest = async () => {
    if (sendingTest || !selected) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testTo.trim())) {
      Swal.fire({ icon: "warning", title: "Enter a valid email", text: "Add the email address to send the test to.", confirmButtonColor: "#dc2626" });
      return;
    }
    setSendingTest(true);
    try {
      const res = await sendTestNotification({ to: testTo.trim(), subject: selected.subject, body: selected.body, channel: "Email", templateName: selected.name });
      Swal.fire({ icon: "success", title: "Test email sent", text: res?.message || "Check the inbox.", confirmButtonColor: "#148943" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Could not send test", text: (err as Error)?.message || "Please try again.", confirmButtonColor: "#dc2626" });
    } finally {
      setSendingTest(false);
    }
  };

  if (!data) {
    return (
      <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[14px] text-[10px] font-semibold text-[#506083]">
        {loadError ? <span className="text-[#DC2626]">{loadError} </span> : "Loading email templates..."}
        <button onClick={() => setReloadKey((k) => k + 1)} className="ml-[8px] text-[#2563EB] font-bold hover:underline">Retry</button>
      </div>
    );
  }

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
                <Mail size={20} />
              </div>
            </div>
            <div className="flex-1 min-w-0 pr-[20px]">
              <h2 className="text-[13px] font-bold text-[#172762] mb-[1px]">Email Templates</h2>
              <p className="text-[8px] font-semibold text-[#506083] whitespace-nowrap overflow-hidden text-ellipsis">Create and manage email templates for different stages of the application process.<br />Use variables to personalize emails.</p>
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
            <li>Use variables like {"{{candidate_name}}"}</li>
            <li>Keep email content short and clear</li>
            <li>Maintain professional and friendly tone</li>
            <li>Test emails before going live</li>
          </ul>
        </div>
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-[6px]">
        {/* Left Column */}
        <div className="flex flex-col gap-[6px]">
          {/* Email Template List */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px] flex-1">
            <div className="flex items-center justify-between mb-[6px]">
              <div className="flex items-center gap-[6px]">
                <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                  <FileTextIcon />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-[#172762]">Email Template List</h3>
                  <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Manage all email templates used in the career application workflow.</p>
                </div>
              </div>
              <button onClick={addTemplate} className="bg-[#148943] text-white px-[10px] py-[4px] rounded-[4px] text-[9px] font-bold flex items-center gap-[4px] shadow-sm hover:bg-[#117639] transition-colors">
                <Plus size={10} /> Add New Template
              </button>
            </div>

            <div className="grid grid-cols-[20px_1.5fr_1.8fr_60px_60px_70px] gap-[8px] items-center mb-[4px] px-[4px] pb-[4px] border-b border-[#E1E6EC]">
              <div className="text-[9px] font-bold text-[#172762]">#</div>
              <div className="text-[9px] font-bold text-[#172762]">Template Name</div>
              <div className="text-[9px] font-bold text-[#172762]">Trigger / Purpose</div>
              <div className="text-[9px] font-bold text-[#172762]">Channel</div>
              <div className="text-[9px] font-bold text-[#172762] text-center">Status</div>
              <div className="text-[9px] font-bold text-[#172762] text-center">Actions</div>
            </div>

            <div className="space-y-[1px] max-h-[260px] overflow-y-auto">
              {data.templates.map((row, i) => (
                <div
                  key={row.id}
                  onClick={() => setSelectedId(row.id)}
                  className={`grid grid-cols-[20px_1.5fr_1.8fr_60px_60px_70px] gap-[8px] items-center py-[3px] px-[4px] rounded-[4px] transition-colors border-b border-[#F1F5F9] last:border-0 cursor-pointer ${selectedId === row.id ? "bg-[#EEF4FF]" : "hover:bg-[#F8FAFC]"}`}
                >
                  <div className="text-[9px] font-semibold text-[#506083]">{i + 1}</div>
                  <div className="flex items-center gap-[6px] overflow-hidden">
                    <RowIcon type={row.icon} />
                    <span className="text-[9px] font-bold text-[#172762] truncate">{row.name}</span>
                  </div>
                  <div className="text-[8.5px] font-semibold text-[#506083] truncate">{row.trigger}</div>
                  <div className="flex items-center gap-[4px] text-[8.5px] font-semibold text-[#172762]">
                    <Mail size={10} className="text-[#2563EB]" /> Email
                  </div>
                  <div className="flex justify-center items-center gap-[4px]">
                    <Toggle checked={row.active} label={`${row.name} active`} onChange={(v) => patchTemplate(row.id, { active: v })} />
                    <span className={`text-[8.5px] font-semibold ${row.active ? "text-[#148943]" : "text-[#94A3B8]"}`}>{row.active ? "Active" : "Off"}</span>
                  </div>
                  <div className="flex justify-center items-center gap-[4px]" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setSelectedId(row.id)} className="text-[8px] font-bold text-[#2563EB] border border-[#D5E6FA] rounded-[4px] px-[6px] py-[2px] bg-white hover:bg-[#EEF4FF] transition-colors">Edit</button>
                    <button onClick={() => removeTemplate(row.id)} title="Delete template" className="text-[#94A3B8] hover:text-[#DC2626] transition-colors"><Trash2 size={11} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Variables */}
          <div className="bg-[#F8FAFC] rounded-[6px] border border-[#E1E6EC] p-[8px]">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <VariableIcon />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Available Variables</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Click a variable to insert it into the editor.</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-[6px]">
              {VARIABLES.map((v, i) => (
                <button key={i} onClick={() => insertVariable(v.var)} className="bg-white border border-[#D5E6FA] rounded-[4px] p-[6px] shadow-sm flex flex-col justify-center text-left hover:bg-[#EEF4FF] transition-colors">
                  <span className="text-[9px] font-bold text-[#172762] mb-[2px]">{v.var}</span>
                  <span className="text-[8px] font-semibold text-[#506083] leading-tight">{v.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-[6px]">
          {/* Template Editor */}
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[8px] flex-1 flex flex-col">
            <div className="flex items-center gap-[6px] mb-[8px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Settings size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Template Editor</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Create or edit email template content.</p>
              </div>
            </div>

            {selected && (
              <>
                <div className="flex items-center gap-[8px] mb-[8px]">
                  <label className="text-[9px] font-bold text-[#172762] w-[80px]">Select Template</label>
                  <div className="relative flex-1">
                    <select value={selected.id} onChange={(e) => setSelectedId(e.target.value)} className="w-full border border-[#E1E6EC] rounded-[4px] px-[8px] py-[4px] text-[9px] font-semibold text-[#172762] appearance-none outline-none bg-white cursor-pointer focus:border-[#148943]">
                      {data.templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <ChevronDown size={10} className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[#506083] pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-[8px] mb-[8px]">
                  <label className="text-[9px] font-bold text-[#172762] w-[80px]">Name</label>
                  <input
                    type="text"
                    value={selected.name}
                    onChange={(e) => patchTemplate(selected.id, { name: e.target.value })}
                    className="flex-1 border border-[#E1E6EC] rounded-[4px] px-[8px] py-[4px] text-[9px] font-semibold text-[#172762] outline-none focus:border-[#148943]"
                  />
                </div>

                <div className="flex items-center gap-[8px] mb-[8px]">
                  <label className="text-[9px] font-bold text-[#172762] w-[80px]">Subject <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={selected.subject}
                    onChange={(e) => patchTemplate(selected.id, { subject: e.target.value })}
                    className="flex-1 border border-[#E1E6EC] rounded-[4px] px-[8px] py-[4px] text-[9px] font-semibold text-[#172762] outline-none focus:border-[#148943]"
                  />
                </div>

                <div className="border border-[#E1E6EC] rounded-[4px] flex-1 flex flex-col overflow-hidden min-h-[180px]">
                  <div className="bg-[#F8FAFC] border-b border-[#E1E6EC] p-[4px] flex items-center justify-between">
                    <div className="flex items-center gap-[2px] text-[#94A3B8]">
                      <span className="p-[4px]" title="Plain-text editing"><Bold size={12} /></span>
                      <span className="p-[4px]"><Italic size={12} /></span>
                      <span className="p-[4px]"><Underline size={12} /></span>
                      <div className="w-[1px] h-[12px] bg-[#CBD5E1] mx-[2px]"></div>
                      <span className="p-[4px]"><List size={12} /></span>
                      <span className="p-[4px]"><ListOrdered size={12} /></span>
                      <div className="w-[1px] h-[12px] bg-[#CBD5E1] mx-[2px]"></div>
                      <span className="p-[4px]"><LinkIcon size={12} /></span>
                    </div>
                    <div className="relative group">
                      <span className="flex items-center gap-[4px] text-[8.5px] font-bold text-[#2563EB] cursor-pointer hover:underline">
                        Insert Variable <ChevronDown size={10} />
                      </span>
                      <div className="hidden group-hover:grid group-focus-within:grid absolute right-0 top-[18px] z-20 grid-cols-2 gap-[2px] w-[280px] bg-white border border-[#E1E6EC] rounded-[4px] p-[4px] shadow-lg max-h-[180px] overflow-y-auto">
                        {VARIABLES.map((v) => (
                          <button key={v.var} onClick={() => insertVariable(v.var)} className="text-left px-[6px] py-[3px] rounded-[3px] hover:bg-[#EEF4FF] text-[8.5px] font-bold text-[#172762]">{v.var}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <textarea
                    ref={bodyRef}
                    value={selected.body}
                    onChange={(e) => patchTemplate(selected.id, { body: e.target.value })}
                    className="flex-1 p-[8px] text-[9.5px] font-medium text-[#172762] outline-none resize-none leading-[1.6] min-h-[160px]"
                  />
                </div>
              </>
            )}
          </div>

          {/* Send Test Email */}
          <div className="bg-[#F8FAFC] rounded-[6px] border border-[#E1E6EC] p-[8px]">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <div className="w-[24px] h-[24px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Send size={12} className="ml-[-2px] mt-[1px] -rotate-45" />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Send Test Email</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Send a test email to verify the template.</p>
              </div>
            </div>

            <div className="flex items-center gap-[8px]">
              <span className="text-[9px] font-bold text-[#172762]">Send Test To</span>
              <div className="flex-1 flex gap-[4px]">
                <input
                  type="text"
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1 border border-[#E1E6EC] rounded-[4px] px-[8px] py-[4px] text-[9px] font-semibold placeholder-[#94A3B8] outline-none focus:border-[#148943]"
                />
                <button
                  onClick={runTest}
                  disabled={sendingTest}
                  className="flex items-center gap-[4px] bg-white border border-[#D5E6FA] text-[#2563EB] px-[10px] py-[4px] rounded-[4px] text-[9px] font-bold hover:bg-[#EEF4FF] transition-colors shadow-sm whitespace-nowrap disabled:opacity-50"
                >
                  <Send size={10} className="-mt-[1px] -rotate-45" /> {sendingTest ? "Sending..." : "Send Test Email"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const FileTextIcon = () => (
  <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.33333 1.33334H2.66667C1.93029 1.33334 1.33333 1.9303 1.33333 2.66668V13.3333C1.33333 14.0697 1.93029 14.6667 2.66667 14.6667H11.3333C12.0697 14.6667 12.6667 14.0697 12.6667 13.3333V4.66668L9.33333 1.33334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.33333 1.33334V4.66668H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const VariableIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4M14 6h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4" />
    <path d="M12 10v4" />
  </svg>
);

const RowIcon = ({ type }: { type: string }) => {
  const getIcon = () => {
    switch (type) {
      case "green-mail": return { bg: "bg-[#E4F4E7]", color: "text-[#148943]", icon: <Mail size={12} /> };
      case "teal-check": return { bg: "bg-[#E0F2FE]", color: "text-[#0284C7]", icon: <Edit size={12} /> };
      case "red-alert": return { bg: "bg-[#FEE2E2]", color: "text-[#DC2626]", icon: <Search size={12} /> };
      case "blue-info": return { bg: "bg-[#E0F2FE]", color: "text-[#2563EB]", icon: <Mail size={12} /> };
      case "purple-calendar": return { bg: "bg-[#F3E8FF]", color: "text-[#9333EA]", icon: <Mail size={12} /> };
      case "green-check": return { bg: "bg-[#DCFCE7]", color: "text-[#16A34A]", icon: <Mail size={12} /> };
      case "red-cross": return { bg: "bg-[#FEE2E2]", color: "text-[#DC2626]", icon: <Mail size={12} /> };
      case "orange-pause": return { bg: "bg-[#FFEDD5]", color: "text-[#EA580C]", icon: <Mail size={12} /> };
      case "blue-check": return { bg: "bg-[#DBEAFE]", color: "text-[#2563EB]", icon: <Mail size={12} /> };
      default: return { bg: "bg-[#F1F5F9]", color: "text-[#64748B]", icon: <Mail size={12} /> };
    }
  };
  const config = getIcon();
  return (
    <div className={`w-[20px] h-[20px] rounded-[4px] flex items-center justify-center flex-shrink-0 ${config.bg} ${config.color}`}>
      {config.icon}
    </div>
  );
};
