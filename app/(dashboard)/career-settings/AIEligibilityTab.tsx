"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Brain, FileText, Users, Clock, CheckCircle2, ShieldCheck, Award, Briefcase, MessageSquare, AlertTriangle, UserCircle, Check, Settings, Info, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import { DEFAULT_AI, loadSection, saveSection, type AiSettingsData } from "@/lib/careersSettings";
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

const ToggleRow = ({ icon: Icon, iconColor, label, active, onChange }: any) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-[6px]">
      <Icon size={10} className={iconColor} />
      <span className="text-[9px] font-bold text-[#172762]">{label}</span>
    </div>
    <Toggle2 checked={active} onChange={onChange} />
  </div>
);

const SimpleToggleRow = ({ label, active, onChange }: any) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-[6px]">
      <Toggle2 checked={active} onChange={onChange} />
      <span className="text-[9px] font-bold text-[#172762]">{label}</span>
    </div>
  </div>
);

const CheckboxRow = ({ icon: Icon, iconColor, iconBg, title, desc, active, onChange }: any) => (
  <button type="button" onClick={() => onChange?.(!active)} className="flex items-start gap-[6px] w-full text-left">
    <div className={`w-[12px] h-[12px] mt-[2px] rounded-[3px] flex items-center justify-center flex-shrink-0 ${active ? 'bg-[#2563EB]' : 'border border-[#E0E5EB] bg-white'}`}>
      {active && <Check size={8} className="text-white" strokeWidth={3} />}
    </div>
    <div className="flex items-start gap-[6px]">
      <div className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={10} className={iconColor} />
      </div>
      <div>
        <h4 className="text-[9px] font-bold text-[#172762]">{title}</h4>
        <p className="text-[8px] font-semibold text-[#506083] leading-tight mt-[1px]">{desc}</p>
      </div>
    </div>
  </button>
);

const SliderRow = ({ icon: Icon, iconColor, iconBg, label, value, color, active, onChange }: any) => (
  <div className="flex items-center gap-[8px]">
    <div className="flex items-center gap-[6px] w-[100px]">
      <div className={`w-[18px] h-[18px] rounded-[4px] flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={10} className={iconColor} />
      </div>
      <span className="text-[9px] font-bold text-[#172762] truncate">{label}</span>
    </div>
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      onChange={(e) => onChange?.(Number(e.target.value))}
      className="flex-1 h-[4px] accent-[#2563EB] cursor-pointer"
    />
    <div className={`w-[26px] text-right text-[9px] font-bold ${active ? 'text-[#148943]' : 'text-[#506083]'}`}>
      {value}%
    </div>
  </div>
);

const RadioRow = ({ label, active, onChange }: any) => (
  <button type="button" onClick={() => onChange?.()} className="flex items-start gap-[6px] w-full text-left">
    <div className={`w-[12px] h-[12px] rounded-full mt-[1px] border-[3px] flex-shrink-0 ${active ? 'border-[#2563EB] bg-white' : 'border-[#E1E6EC] bg-white'}`}></div>
    <span className="text-[9px] font-bold text-[#172762]">{label}</span>
  </button>
);

const selectCls = "w-full border border-[#E1E6EC] rounded-[4px] px-[8px] py-[4px] text-[9px] font-semibold text-[#172762] appearance-none outline-none focus:border-[#148943] bg-white cursor-pointer";

export default function AIEligibilityTab({ registerActions }: { registerActions?: RegisterTabActions }) {
  const [data, setData] = useState<AiSettingsData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const dataRef = useRef<AiSettingsData | null>(null);
  dataRef.current = data;

  const load = useCallback(() => {
    setLoadError("");
    setData(null);
    loadSection<AiSettingsData>("ai")
      .then(setData)
      .catch((err) => setLoadError((err as Error)?.message || "Could not load AI settings"));
  }, []);

  useEffect(() => { load(); }, [load, reloadKey]);

  const patch = (p: Partial<AiSettingsData>) => setData((prev) => (prev ? { ...prev, ...p } : prev));
  const patchMap = (field: "cv" | "params" | "verify", key: string, value: boolean) =>
    setData((prev) => (prev ? { ...prev, [field]: { ...prev[field], [key]: value } } : prev));
  const setWeight = (key: string, value: number) =>
    setData((prev) => (prev ? { ...prev, weightage: { ...prev.weightage, [key]: value } } : prev));

  const save = async () => {
    const current = dataRef.current;
    if (!current || saving) return;
    setSaving(true);
    try {
      const saved = await saveSection<AiSettingsData>("ai", current);
      setData(saved);
      Swal.fire({ icon: "success", title: "AI settings saved", text: "Screening criteria are updated.", confirmButtonColor: "#148943" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Could not save", text: (err as Error)?.message || "Please try again.", confirmButtonColor: "#dc2626" });
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setData({ ...DEFAULT_AI, cv: { ...DEFAULT_AI.cv }, params: { ...DEFAULT_AI.params }, verify: { ...DEFAULT_AI.verify }, weightage: { ...DEFAULT_AI.weightage } });
    Swal.fire({ icon: "info", title: "Reset to defaults", text: "Defaults loaded. Click Save Settings to apply them.", confirmButtonColor: "#148943" });
  };

  useEffect(() => {
    if (!registerActions) return;
    return registerActions(() => ({ save, reset, saving }));
  });

  if (!data) {
    return (
      <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[14px] text-[10px] font-semibold text-[#506083]">
        {loadError ? <span className="text-[#DC2626]">{loadError} </span> : "Loading AI settings..."}
        <button onClick={() => setReloadKey((k) => k + 1)} className="ml-[8px] text-[#2563EB] font-bold hover:underline">Retry</button>
      </div>
    );
  }

  const totalWeight = Object.values(data.weightage).reduce((a, b) => a + b, 0);

  return (
    <>
      {/* Top Section: Banner & How it works */}
      <div className="flex items-stretch gap-[8px] mb-[6px]" style={{ height: '132.1px' }}>
        <div
          className="flex-1 bg-white rounded-[6px] border border-[#E1E6EC] overflow-hidden relative bg-no-repeat"
          style={{ backgroundImage: "url('/apli_f.png')", backgroundPosition: "right center", backgroundSize: "contain" }}
        >
          <div className="flex items-center gap-[10px] relative z-10 w-full h-full py-[4px] px-[10px] bg-gradient-to-r from-white via-white/90 to-transparent">
            <div className="flex items-center justify-center flex-shrink-0">
              <svg width="42" height="42" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="36" height="36" rx="10" fill="#E6F5EA" />
                <rect x="14" y="9" width="3" height="3" rx="0.5" fill="#00893B" />
                <rect x="23" y="9" width="3" height="3" rx="0.5" fill="#00893B" />
                <rect x="14" y="28" width="3" height="3" rx="0.5" fill="#00893B" />
                <rect x="23" y="28" width="3" height="3" rx="0.5" fill="#00893B" />
                <rect x="9" y="14" width="3" height="3" rx="0.5" fill="#00893B" />
                <rect x="9" y="23" width="3" height="3" rx="0.5" fill="#00893B" />
                <rect x="28" y="14" width="3" height="3" rx="0.5" fill="#00893B" />
                <rect x="28" y="23" width="3" height="3" rx="0.5" fill="#00893B" />
                <rect x="13" y="13" width="14" height="14" rx="3" fill="#00893B" />
                <text x="20" y="22.5" fill="white" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">AI</text>
              </svg>
            </div>
            <div className="flex-1 min-w-0 pr-[20px]">
              <h2 className="text-[13px] font-bold text-[#172762] mb-[1px]">AI Eligibility & Screening Settings</h2>
              <p className="text-[8px] font-semibold text-[#506083] whitespace-nowrap overflow-hidden text-ellipsis">Configure AI-based candidate screening criteria, minimum eligibility, and screening parameters.</p>
            </div>
          </div>
        </div>

        <div className="w-[280px] bg-[#F8FAFC] border border-[#E1E6EC] rounded-[6px] py-[6px] px-[8px] flex-shrink-0">
          <div className="flex items-center gap-[4px] mb-[4px]">
            <div className="w-[14px] h-[14px] rounded-full bg-[#2563EB] flex items-center justify-center text-white">
              <Info size={8} />
            </div>
            <h3 className="text-[9px] font-bold text-[#2563EB]">How it works?</h3>
          </div>
          <ol className="text-[7.5px] font-semibold text-[#506083] space-y-[1px] list-decimal list-inside">
            <li>Candidates fill the application form.</li>
            <li>AI checks eligibility based on your settings.</li>
            <li>Eligible candidates can proceed to complete the form.</li>
            <li>Ineligible candidates see a customized message.</li>
          </ol>
        </div>
      </div>

      {/* 3 Column Grid */}
      <div className="grid grid-cols-3 gap-[6px]">
        {/* Col 1 */}
        <div className="flex flex-col gap-[6px] h-full">
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px]">
            <div className="flex items-center gap-[6px] mb-[10px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <FileText size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Minimum Eligibility Criteria</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Set basic eligibility criteria to apply for any job position.</p>
              </div>
            </div>

            <div className="space-y-[8px]">
              <div>
                <label className="block text-[9px] font-bold text-[#172762] mb-[4px]">Minimum Academic Percentage (%) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="number" min={0} max={100} value={data.minAcademic} onChange={(e) => patch({ minAcademic: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} className="w-full border border-[#E1E6EC] rounded-[4px] px-[8px] py-[4px] text-[9px] font-bold text-[#172762] outline-none focus:border-[#148943]" />
                  <div className="absolute right-[8px] top-1/2 -translate-y-1/2 flex flex-col">
                    <button type="button" onClick={() => patch({ minAcademic: Math.min(100, data.minAcademic + 1) })} className="text-[#506083] hover:text-[#172762]"><ChevronDown size={8} className="rotate-180" /></button>
                    <button type="button" onClick={() => patch({ minAcademic: Math.max(0, data.minAcademic - 1) })} className="text-[#506083] hover:text-[#172762]"><ChevronDown size={8} /></button>
                  </div>
                </div>
                <p className="mt-[4px] text-[8px] font-semibold text-[#2563EB] bg-[#E8F1FF] px-[6px] py-[4px] rounded-[3px]">Candidates with {data.minAcademic}% or above can proceed to apply.</p>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-[#172762] mb-[4px]">Minimum Work Experience (Optional)</label>
                <div className="relative">
                  <select value={data.minExperience} onChange={(e) => patch({ minExperience: e.target.value })} className={selectCls}>
                    {["No Minimum", "1+ Years", "2+ Years", "3+ Years", "5+ Years"].map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={10} className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[#506083] pointer-events-none" />
                </div>
                <p className="mt-[2px] text-[8px] font-semibold text-[#506083]">Leave blank if experience is not mandatory.</p>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-[#172762] mb-[4px]">Age Limit (Optional)</label>
                <div className="grid grid-cols-2 gap-[6px]">
                  <div className="relative">
                    <select value={data.ageMin} onChange={(e) => patch({ ageMin: e.target.value })} className={selectCls}>
                      {["Minimum Age", "18 years", "21 years", "25 years", "30 years"].map((o) => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={10} className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[#506083] pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select value={data.ageMax} onChange={(e) => patch({ ageMax: e.target.value })} className={selectCls}>
                      {["Maximum Age", "35 years", "40 years", "45 years", "50 years", "55 years", "60 years"].map((o) => <option key={o}>{o}</option>)}
                    </select>
                    <ChevronDown size={10} className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[#506083] pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-[#172762] mb-[4px]">Location Preference (Optional)</label>
                <div className="relative">
                  <select value={data.locationPref} onChange={(e) => patch({ locationPref: e.target.value })} className={selectCls}>
                    {["Any Location", "Remote Only", "On-site Only", "Hybrid"].map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={10} className="absolute right-[8px] top-1/2 -translate-y-1/2 text-[#506083] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px] flex-1 flex flex-col">
            <div className="flex items-center gap-[6px] mb-[10px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <FileText size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">CV Analysis Settings</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Configure resume analysis options.</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between gap-[6px]">
              <ToggleRow icon={FileText} iconColor="text-[#E29515]" label="Analyse Uploaded CV (Resume)" active={data.cv.analyse} onChange={(v: boolean) => patchMap("cv", "analyse", v)} />
              <ToggleRow icon={Award} iconColor="text-[#2563EB]" label="Extract Key Skills" active={data.cv.skills} onChange={(v: boolean) => patchMap("cv", "skills", v)} />
              <ToggleRow icon={Briefcase} iconColor="text-[#148943]" label="Identify Work Experience" active={data.cv.experience} onChange={(v: boolean) => patchMap("cv", "experience", v)} />
              <ToggleRow icon={CheckCircle2} iconColor="text-[#E29515]" label="Check Education Details" active={data.cv.education} onChange={(v: boolean) => patchMap("cv", "education", v)} />
              <ToggleRow icon={AlertTriangle} iconColor="text-[#E29515]" label="Detect Career Gaps" active={data.cv.gaps} onChange={(v: boolean) => patchMap("cv", "gaps", v)} />
              <ToggleRow icon={MessageSquare} iconColor="text-[#7550EF]" label="Generate AI Summary" active={data.cv.summary} onChange={(v: boolean) => patchMap("cv", "summary", v)} />
            </div>
          </div>
        </div>

        {/* Col 2 */}
        <div className="flex flex-col gap-[6px] h-full">
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px]">
            <div className="flex items-center gap-[6px] mb-[10px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Brain size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">AI Screening Parameters</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Select key areas to be analysed in AI screening.</p>
              </div>
            </div>
            <div className="space-y-[8px]">
              <CheckboxRow icon={Award} iconColor="text-[#148943]" iconBg="bg-[#E4F4E7]" title="Skills Match" desc="Match candidate skills with job requirements" active={data.params.skills} onChange={(v: boolean) => patchMap("params", "skills", v)} />
              <CheckboxRow icon={Briefcase} iconColor="text-[#E29515]" iconBg="bg-[#FFF1D8]" title="Experience Match" desc="Analyse relevant work experience" active={data.params.experience} onChange={(v: boolean) => patchMap("params", "experience", v)} />
              <CheckboxRow icon={FileText} iconColor="text-[#7550EF]" iconBg="bg-[#F3E8FF]" title="Education Match" desc="Verify educational qualifications" active={data.params.education} onChange={(v: boolean) => patchMap("params", "education", v)} />
              <CheckboxRow icon={Users} iconColor="text-[#2563EB]" iconBg="bg-[#E8F1FF]" title="Role Relevance" desc="Assess overall profile relevance for the role" active={data.params.roleRelevance} onChange={(v: boolean) => patchMap("params", "roleRelevance", v)} />
              <CheckboxRow icon={CheckCircle2} iconColor="text-[#2563EB]" iconBg="bg-[#E8F1FF]" title="Industry Fit" desc="Check industry experience and domain knowledge" active={data.params.industryFit} onChange={(v: boolean) => patchMap("params", "industryFit", v)} />
              <CheckboxRow icon={MessageSquare} iconColor="text-[#159B88]" iconBg="bg-[#E1F6F0]" title="Communication Skills (CV Text)" desc="Analyse written communication from CV" active={data.params.communication} onChange={(v: boolean) => patchMap("params", "communication", v)} />
              <CheckboxRow icon={Clock} iconColor="text-[#7550EF]" iconBg="bg-[#F3E8FF]" title="Career Continuity" desc="Check career gaps and job stability" active={data.params.continuity} onChange={(v: boolean) => patchMap("params", "continuity", v)} />
            </div>
          </div>

          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px] flex-1 flex flex-col">
            <div className="flex items-center gap-[6px] mb-[10px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <UserCircle size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Photo & Document Verification</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Enable AI-based verification for uploaded documents.</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between gap-[6px]">
              <SimpleToggleRow label="Verify Photo (Face Detection)" active={data.verify.photo} onChange={(v: boolean) => patchMap("verify", "photo", v)} />
              <SimpleToggleRow label="Validate Resume Format" active={data.verify.resumeFormat} onChange={(v: boolean) => patchMap("verify", "resumeFormat", v)} />
              <SimpleToggleRow label="Check File Type (PDF, DOC, DOCX)" active={data.verify.fileType} onChange={(v: boolean) => patchMap("verify", "fileType", v)} />
              <SimpleToggleRow label="Detect Fake / Blurry Documents" active={data.verify.fakeDocs} onChange={(v: boolean) => patchMap("verify", "fakeDocs", v)} />
              <SimpleToggleRow label="Scan for Relevant Keywords" active={data.verify.keywords} onChange={(v: boolean) => patchMap("verify", "keywords", v)} />
            </div>
          </div>
        </div>

        {/* Col 3 */}
        <div className="flex flex-col gap-[6px] h-full">
          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px]">
            <div className="flex items-center gap-[6px] mb-[10px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Check size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">AI Score Weightage (Optional)</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">Set weightage for each parameter (Total 100%).</p>
              </div>
            </div>
            <div className="space-y-[10px]">
              <SliderRow icon={Award} iconColor="text-[#148943]" iconBg="bg-[#E4F4E7]" label="Skills Match" value={data.weightage.skills} active onChange={(v: number) => setWeight("skills", v)} />
              <SliderRow icon={Briefcase} iconColor="text-[#E29515]" iconBg="bg-[#FFF1D8]" label="Experience" value={data.weightage.experience} active onChange={(v: number) => setWeight("experience", v)} />
              <SliderRow icon={FileText} iconColor="text-[#7550EF]" iconBg="bg-[#F3E8FF]" label="Education" value={data.weightage.education} active onChange={(v: number) => setWeight("education", v)} />
              <SliderRow icon={Users} iconColor="text-[#E29515]" iconBg="bg-[#FFF1D8]" label="Role Relevance" value={data.weightage.role} active onChange={(v: number) => setWeight("role", v)} />
              <SliderRow icon={ShieldCheck} iconColor="text-[#D946EF]" iconBg="bg-[#FDF4FF]" label="Industry Fit" value={data.weightage.industry} active onChange={(v: number) => setWeight("industry", v)} />
              <SliderRow icon={MessageSquare} iconColor="text-[#0D9488]" iconBg="bg-[#F0FDFA]" label="Communication" value={data.weightage.communication} active onChange={(v: number) => setWeight("communication", v)} />
              <SliderRow icon={Clock} iconColor="text-[#64748B]" iconBg="bg-[#F1F5F9]" label="Continuity" value={data.weightage.continuity} active={false} onChange={(v: number) => setWeight("continuity", v)} />
            </div>
            <div className={`mt-[16px] flex items-center justify-between p-[8px] rounded-[4px] border ${totalWeight === 100 ? "bg-[#E6F8ED] border-[#CDEBD4]" : "bg-[#FFF1D8] border-[#FDE0A6]"}`}>
              <span className="text-[9px] font-bold text-[#172762]">Total Weightage</span>
              <span className={`text-[9px] font-bold ${totalWeight === 100 ? "text-[#148943]" : "text-[#E29515]"}`}>{totalWeight}%{totalWeight !== 100 && " (adjust to 100%)"}</span>
            </div>
          </div>

          <div className="bg-white rounded-[6px] border border-[#E1E6EC] p-[10px] flex-1 flex flex-col">
            <div className="flex items-center gap-[6px] mb-[10px]">
              <div className="w-[30px] h-[30px] rounded-[4px] bg-[#E8F1FF] text-[#2563EB] flex items-center justify-center border border-[#D5E6FA]">
                <Settings size={16} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-[#172762]">Auto Screening Action</h3>
                <p className="text-[8px] font-semibold text-[#506083] mt-[1px]">What should happen after AI screening?</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-between mb-[10px] gap-[6px]">
              <RadioRow label="Show result and allow eligible candidates to proceed" active={data.autoAction === "proceed"} onChange={() => patch({ autoAction: "proceed" })} />
              <RadioRow label="Auto-forward eligible candidates to HR" active={data.autoAction === "autoForward"} onChange={() => patch({ autoAction: "autoForward" })} />
              <RadioRow label="Manually review all candidates (No auto screening)" active={data.autoAction === "manual"} onChange={() => patch({ autoAction: "manual" })} />
            </div>
            <div className="bg-[#E8F1FF] border border-[#D5E6FA] rounded-[4px] p-[8px] flex gap-[6px] items-start">
              <div className="w-[12px] h-[12px] rounded-full bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0 mt-[1px]">
                <Info size={8} />
              </div>
              <p className="text-[8px] font-semibold text-[#2563EB] leading-tight">AI screening helps identify suitable candidates. Final selection is always done by HR.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
