import { api } from "@/lib/api";

// Career Settings → stored per section in backend /careers/admin/settings/:section.
export type SectionKey = "general" | "ai" | "documents" | "notifications" | "emailTemplates";

export interface GeneralSettingsData {
  moduleActive: boolean;
  pageTitle: string;
  slug: string;
  fromEmail: string;
  replyTo: string;
  autoAck: boolean;
  minScore: number;
  screeningAreas: Record<string, boolean>;
  docs: Record<string, boolean>;
  formFields: Record<string, boolean>;
  notify: Record<string, boolean>;
  adminRecipients: string[];
}

export interface AiSettingsData {
  minAcademic: number;
  minExperience: string;
  ageMin: string;
  ageMax: string;
  locationPref: string;
  cv: Record<string, boolean>;
  params: Record<string, boolean>;
  verify: Record<string, boolean>;
  weightage: Record<string, number>;
  autoAction: "proceed" | "autoForward" | "manual";
}

export interface DocumentRow {
  id: string;
  name: string;
  required: boolean;
  format: string;
  max: string;
}
export interface FieldRow {
  name: string;
  show: boolean;
  required: boolean;
}
export interface DocumentsSettingsData {
  documents: DocumentRow[];
  fields: FieldRow[];
  settings: Record<string, boolean>;
  confirmationTitle: string;
  confirmationMessage: string;
}

export interface NotificationTrigger {
  id: string;
  name: string;
  icon: string;
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  notify: string;
  template: string;
}
export interface NotificationsSettingsData {
  triggers: NotificationTrigger[];
  hrEmail: string;
  ccAdmin: string;
  notifyNewApplication: boolean;
  dailySummary: boolean;
  followUpDays: number;
  summaryTime: string;
  timezone: string;
  workingDaysOnly: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  trigger: string;
  icon: string;
  active: boolean;
  subject: string;
  body: string;
}
export interface EmailTemplatesSettingsData {
  templates: EmailTemplate[];
}

export const DEFAULT_GENERAL: GeneralSettingsData = {
  moduleActive: true,
  pageTitle: "Careers at Arogya Bharat",
  slug: "careers",
  fromEmail: "careers@arogyabharat.org",
  replyTo: "hr@arogyabharat.org",
  autoAck: true,
  minScore: 40,
  screeningAreas: { skills: true, experience: true, education: true, role: true, industry: true },
  docs: { resume: true, photo: true, eduCerts: false, expCerts: false, additional: false },
  formFields: { location: true, expectedCtc: true, totalExperience: true, currentCompany: true, willingToRelocate: true, portfolio: false },
  notify: {
    forwardToHr: true,
    ackCandidate: true,
    resultCandidate: true,
    hrStatusUpdates: true,
    dailySummary: false,
    weeklyReport: false,
  },
  adminRecipients: ["careers@arogyabharat.org"],
};

export const DEFAULT_AI: AiSettingsData = {
  minAcademic: 40,
  minExperience: "No Minimum",
  ageMin: "Minimum Age",
  ageMax: "Maximum Age",
  locationPref: "Any Location",
  cv: { analyse: true, skills: true, experience: true, education: true, gaps: false, summary: true },
  params: { skills: true, experience: true, education: true, roleRelevance: true, industryFit: true, communication: true, continuity: true },
  verify: { photo: true, resumeFormat: true, fileType: true, fakeDocs: true, keywords: true },
  weightage: { skills: 25, experience: 20, education: 15, role: 15, industry: 10, communication: 10, continuity: 5 },
  autoAction: "proceed",
};

export const DEFAULT_DOCUMENTS: DocumentsSettingsData = {
  documents: [
    { id: "resume", name: "Resume / CV", required: true, format: "PDF, DOC, DOCX", max: "5 MB" },
    { id: "photo", name: "Passport Size Photo", required: true, format: "JPG, PNG", max: "2 MB" },
    { id: "eduCerts", name: "Educational Certificates", required: false, format: "PDF, JPG, PNG", max: "5 MB" },
    { id: "expCerts", name: "Experience Certificates", required: false, format: "PDF, JPG, PNG", max: "5 MB" },
    { id: "idProof", name: "ID Proof (Aadhaar / PAN)", required: false, format: "PDF, JPG, PNG", max: "2 MB" },
    { id: "portfolio", name: "Portfolio / Work Samples", required: false, format: "PDF, JPG, PNG", max: "10 MB" },
    { id: "other", name: "Other Documents", required: false, format: "PDF, DOC, DOCX", max: "5 MB" },
  ],
  fields: [
    { name: "Full Name", show: true, required: true },
    { name: "Email Address", show: true, required: true },
    { name: "Mobile Number", show: true, required: true },
    { name: "Current Location", show: true, required: true },
    { name: "Current CTC", show: true, required: false },
    { name: "Expected CTC", show: true, required: false },
    { name: "Total Experience", show: true, required: true },
    { name: "Current Company", show: true, required: false },
    { name: "Notice Period", show: true, required: false },
    { name: "Willing to Relocate", show: true, required: false },
    { name: "LinkedIn Profile", show: true, required: false },
    { name: "Portfolio / Website", show: true, required: false },
  ],
  settings: {
    multiStep: true,
    progressBar: true,
    draftSave: true,
    terms: true,
    recaptcha: true,
    multipleApps: false,
    timeEstimate: true,
  },
  confirmationTitle: "Application Submitted Successfully!",
  confirmationMessage:
    "Thank you for applying. We have received your application and our team will review it. You will be notified about the next steps.",
};

const SIGN_OFF = "\n\nBest regards,\nArogya Bharat Team";

const tpl = (id: string, name: string, trigger: string, icon: string, subject: string, body: string): EmailTemplate => ({
  id, name, trigger, icon, active: true, subject, body,
});

export const DEFAULT_TEMPLATES: EmailTemplate[] = [
  tpl("ack", "Submission Acknowledgement", "Sent after candidate submits application", "green-mail",
    "Thank you for your application | Arogya Bharat",
    `Dear {{candidate_name}},\n\nThank you for applying for the position of "{{job_title}}" at Arogya Bharat. We have received your application and our team will review it shortly.${SIGN_OFF}`),
  tpl("eligible", "Eligible - Next Steps", "Candidate eligible for the position", "teal-check",
    "Congratulations! You are eligible for the position at Arogya Bharat",
    `Dear {{candidate_name}},\n\nCongratulations! Based on your information, you appear to be eligible for the position of "{{job_title}}" at Arogya Bharat.\n\nPlease complete and submit the application form to proceed further.${SIGN_OFF}`),
  tpl("notEligible", "Not Eligible - Thank You", "Candidate not eligible", "red-alert",
    "Thank you for your interest in Arogya Bharat",
    `Dear {{candidate_name}},\n\nThank you for your interest in "{{job_title}}".\n\nBased on the information provided, you do not meet the eligibility criteria for this position at this time. We encourage you to explore other opportunities with us in the future.${SIGN_OFF}`),
  tpl("incomplete", "Incomplete Application", "Application not completed", "blue-info",
    "Your application is incomplete | Arogya Bharat",
    `Dear {{candidate_name}},\n\nYour application for "{{job_title}}" is incomplete. Please provide the missing details to submit your application.\n\nYou can continue from where you left off: {{application_link}}${SIGN_OFF}`),
  tpl("hrReview", "New Application for Review", "Application forwarded to HR", "blue-user",
    "New career application: {{job_title}}",
    `Dear HR Team,\n\nA new application for "{{job_title}}" has been submitted.\n\nCandidate: {{candidate_name}}\nExperience: {{total_experience}}\nExpected CTC: {{expected_ctc}}\n\nPlease review it in the careers admin panel.${SIGN_OFF}`),
  tpl("shortlisted", "Shortlisted - Next Steps", "HR shortlisted the candidate", "green-user",
    "You have been shortlisted for {{job_title}} | Arogya Bharat",
    `Dear {{candidate_name}},\n\nGreat news! Your application for "{{job_title}}" has been shortlisted by our HR team.\n\nWe will reach out soon with the next steps.${SIGN_OFF}`),
  tpl("interview", "Interview Invitation", "Invite shortlisted candidate for interview", "purple-calendar",
    "Interview Invitation - {{job_title}} | Arogya Bharat",
    `Dear {{candidate_name}},\n\nCongratulations! Your application for the position of "{{job_title}}" at Arogya Bharat has been shortlisted.\n\nWe would like to invite you for an interview.\n\nPlease find the details below:\n• Date: {{interview_date}}\n• Time: {{interview_time}}\n• Mode: {{interview_mode}}\n\nPlease confirm your availability by replying to this email.\n\nFor any queries, feel free to contact us.${SIGN_OFF}`),
  tpl("selected", "Selection & Offer Process", "Candidate selected for the position", "green-check",
    "Congratulations! You are selected for {{job_title}} | Arogya Bharat",
    `Dear {{candidate_name}},\n\nCongratulations! You have been selected for the position of "{{job_title}}" at Arogya Bharat.\n\nOur HR team will share the offer details and onboarding steps with you shortly.${SIGN_OFF}`),
  tpl("rejected", "Not Selected - Thank You", "Candidate not selected", "red-cross",
    "Update on your application | Arogya Bharat",
    `Dear {{candidate_name}},\n\nThank you for taking the time to interview for "{{job_title}}".\n\nAfter careful consideration, we have decided to move ahead with another candidate for this role. We will keep your profile on file for future opportunities.${SIGN_OFF}`),
  tpl("onHold", "Application On Hold", "Application kept on hold", "orange-pause",
    "Your application is on hold | Arogya Bharat",
    `Dear {{candidate_name}},\n\nYour application for "{{job_title}}" is currently on hold while we finalize requirements for this position. We will update you as soon as there is movement.${SIGN_OFF}`),
  tpl("joined", "Welcome to the Team", "Candidate has joined", "blue-check",
    "Welcome to Arogya Bharat, {{candidate_name}}!",
    `Dear {{candidate_name}},\n\nWelcome to the Arogya Bharat family! We are excited to have you on board for the role of "{{job_title}}".\n\nYour joining formalities will be shared by the HR team.${SIGN_OFF}`),
  tpl("followup", "Follow-up Reminder", "No response from candidate", "gray-clock",
    "Following up on your application | Arogya Bharat",
    `Dear {{candidate_name}},\n\nWe noticed there has been no response from your side regarding the "{{job_title}}" application. Please revert at your earliest so we can proceed further.${SIGN_OFF}`),
];

const NOTIFY_OPTIONS = ["Candidate", "HR Team", "Admin"];

export const DEFAULT_NOTIFICATIONS: NotificationsSettingsData = {
  triggers: [
    { id: "submitted", name: "Application Submitted\n(Thank You)", icon: "green-send", email: true, sms: true, whatsapp: true, notify: "Candidate", template: "Submission Acknowledgement" },
    { id: "aiPass", name: "AI Result - Eligible (Pass)", icon: "purple-check", email: true, sms: true, whatsapp: true, notify: "Candidate", template: "Eligible - Next Steps" },
    { id: "aiFail", name: "AI Result - Not Eligible (Fail)", icon: "red-alert", email: true, sms: false, whatsapp: true, notify: "Candidate", template: "Not Eligible - Thank You" },
    { id: "forwarded", name: "Application Forwarded to HR", icon: "blue-user", email: true, sms: false, whatsapp: false, notify: "HR Team", template: "New Application for Review" },
    { id: "shortlisted", name: "HR Status - Shortlisted", icon: "green-user", email: true, sms: true, whatsapp: true, notify: "Candidate", template: "Shortlisted - Next Steps" },
    { id: "interview", name: "HR Status - Interview", icon: "purple-calendar", email: true, sms: true, whatsapp: true, notify: "Candidate", template: "Interview Invitation" },
    { id: "selected", name: "HR Status - Selected", icon: "green-check", email: true, sms: true, whatsapp: true, notify: "Candidate", template: "Selection & Offer Process" },
    { id: "rejected", name: "HR Status - Rejected", icon: "red-cross", email: true, sms: false, whatsapp: true, notify: "Candidate", template: "Not Selected - Thank You" },
    { id: "onHold", name: "HR Status - On Hold", icon: "orange-pause", email: true, sms: false, whatsapp: true, notify: "Candidate", template: "Application On Hold" },
    { id: "joined", name: "HR Status - Joined", icon: "blue-check", email: true, sms: true, whatsapp: true, notify: "Candidate", template: "Welcome to the Team" },
    { id: "followup", name: "No Response (Auto Follow-up)", icon: "gray-clock", email: true, sms: false, whatsapp: false, notify: "Candidate", template: "Follow-up Reminder" },
  ],
  hrEmail: "hr@arogyabharat.org",
  ccAdmin: "info@arogyabharat.org",
  notifyNewApplication: true,
  dailySummary: true,
  followUpDays: 7,
  summaryTime: "10:00 AM",
  timezone: "(GMT+05:30) India Standard Time",
  workingDaysOnly: true,
};

export const SECTION_DEFAULTS: Record<SectionKey, unknown> = {
  general: DEFAULT_GENERAL,
  ai: DEFAULT_AI,
  documents: DEFAULT_DOCUMENTS,
  notifications: DEFAULT_NOTIFICATIONS,
  emailTemplates: { templates: DEFAULT_TEMPLATES },
};

export const NOTIFY_RECIPIENT_OPTIONS = NOTIFY_OPTIONS;

// Deep-merge stored payload over defaults (arrays replace, objects merge).
export function mergeDefaults<T>(defaults: T, stored: unknown): T {
  if (Array.isArray(defaults)) return (Array.isArray(stored) && stored.length > 0 ? stored : defaults) as T;
  if (defaults && typeof defaults === "object") {
    const out: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };
    if (stored && typeof stored === "object" && !Array.isArray(stored)) {
      for (const [k, v] of Object.entries(stored as Record<string, unknown>)) {
        out[k] = k in out ? mergeDefaults((defaults as Record<string, unknown>)[k], v) : v;
      }
    }
    return out as T;
  }
  return (stored === undefined || stored === null ? defaults : (stored as T));
}

export const loadSection = <T,>(section: SectionKey) =>
  api.get<unknown>(`/careers/admin/settings/${section}?_=${Date.now()}`).then((data) => mergeDefaults<T>(SECTION_DEFAULTS[section] as T, data));

export const saveSection = <T,>(section: SectionKey, data: T) => api.put<T>(`/careers/admin/settings/${section}`, data);

export const sendTestNotification = (payload: { to: string; subject: string; body: string; channel?: string; templateName?: string }) =>
  api.post<{ message: string }>("/careers/admin/notifications/test", payload);

export function liveCareersUrl(): string {
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const isLocal = host === "localhost" || host === "127.0.0.1";
  return isLocal ? "http://localhost:3001/careers" : "https://arogyabharat.org/careers";
}
