import { LandingSectionContent } from "./landingContent";

export const defaultMsmeSections: LandingSectionContent[] = [];

export const defaultMsmeEligibilityCheckSections: LandingSectionContent[] = [];

export const defaultMsmeApplySections: LandingSectionContent[] = [];

export const defaultMsmeParticipationDetailsSections: LandingSectionContent[] = [];

export const defaultMsmeApplyPaymentSections: LandingSectionContent[] = [];

export const defaultExhibitorLoginSections: LandingSectionContent[] = [];

export const defaultBuyerLoginSections: LandingSectionContent[] = [];

export const defaultDelegatesLoginSections: LandingSectionContent[] = [];

// DELEGATE LOGIN PAGE SECTIONS (/login)
// Mirrors the live website login page: left info & event-highlights panel + right LoginForm.
export const defaultUserLoginSections: LandingSectionContent[] = [
  {
    key: "login-info-panel",
    name: "Login Page Info Panel",
    enabled: true,
    eyebrow: "18TH AROGYA SANGOSTIHI 2026",
    titlePrimary: "Delegates",
    titleSecondary: "Login Portal",
    description: "Access your verified delegate dashboard, view pass details & download official entry badge.",
    highlightsTitle: "EVENT HIGHLIGHTS",
    items: [
      { icon: "Calendar", title: "21 - 23 AUGUST 2026", subtitle: "Friday - Sunday" },
      { icon: "MapPin", title: "Pragati Maidan, New Delhi", subtitle: "" },
      { icon: "Globe", title: "www.ihwe.in", href: "https://www.ihwe.in" },
    ],
    ctaQuestion: "Haven't registered yet?",
    ctaDescription: "Register now to get your pass.",
    ctaButtonLabel: "Register Now",
    ctaButtonHref: "/register-now",
  },
  {
    key: "login-form",
    name: "Delegate Login Form",
    enabled: true,
    title: "Delegates Login",
    subtitle: "Login using your registered email or mobile number",
    quickLoginSubtitle: "Enter your assigned Delegate ID or Email to access your portal",
    tab1Label: "OTP Login",
    tab2Label: "Delegate ID / Quick Login",
    otpNote: "We will send a 6-digit verification code to your registered Email & WhatsApp.",
    dividerLabel: "OR",
    securityTitle: "Your security is our priority",
    securityNote: "We never share your details with anyone.",
    items: [
      {
        title: "Registered Email or Mobile Number",
        placeholder: "Enter your registered email or 10-digit mobile",
        buttonLabel: "Send Login OTP",
      },
      {
        title: "Enter 6-Digit OTP Code",
        placeholder: "1 2 3 4 5 6",
        buttonLabel: "Verify & Login",
      },
      {
        title: "Delegate ID / Registered Email or Mobile",
        placeholder: "e.g. AGY-2026-1002 or email address",
        buttonLabel: "View Delegate Profile",
      },
    ],
  },
];

