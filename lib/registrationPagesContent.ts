import { LandingSectionContent } from "./landingContent";

// 1. BOOK A STALL PAGE SECTIONS
export const defaultBookAStandSections: LandingSectionContent[] = [];

// 2. VISITOR REGISTRATION PAGE SECTIONS
export const defaultVisitorRegistrationSections: LandingSectionContent[] = [];

// 3. BUYER REGISTRATION PAGE SECTIONS
export const defaultBuyerRegistrationSections: LandingSectionContent[] = [];

// 3A. REGISTER NOW PAGE SECTIONS (/register-now) — each one is edited by its own
// backend-wired editor (components/cms/editor/RegisterNowEditors.tsx)
export const defaultRegisterNowSections: LandingSectionContent[] = [
  { key: "register-hero", name: "Register Now Hero Banner", enabled: true },
  { key: "register-stats", name: "Stats Band (Counters)", enabled: true },
  { key: "register-cards", name: "Registration Cards (Single & Group)", enabled: true },
  { key: "register-event-details", name: "Event Details Card", enabled: true },
  { key: "register-why-attend", name: "Why Attend Card", enabled: true },
  { key: "register-need-help", name: "Need Help Card", enabled: true },
];

// 3A-2. SINGLE & GROUP REGISTRATION PAGES (/new-single-registration, /new-group-registration).
// Both pages share the Register Now hero, the delegate passes and "Your Registration Includes".
export const defaultSingleRegistrationSections: LandingSectionContent[] = [
  { key: "reg-shared-hero", name: "Hero Banner & Stats (same as Register Now)", enabled: true },
  { key: "reg-shared-fees", name: "Registration Fees & Passes", enabled: true },
  { key: "registration-includes", name: "Your Registration Includes", enabled: true },
];

export const defaultGroupRegistrationSections: LandingSectionContent[] = [
  { key: "reg-shared-hero", name: "Hero Banner & Stats (same as Register Now)", enabled: true },
  { key: "reg-shared-fees", name: "Registration Fees & Passes", enabled: true },
  { key: "registration-includes-common", name: "Your Registration Includes (common with Single Registration)", enabled: true },
];

// 3B. DELEGATE REGISTRATION PAGE SECTIONS (/delegate-registration)
// Mirrors the live website sections rendered by DelegateRegistrationClient:
// DelegateHero > RegistrationStepper > DelegateInfoSections (+ RegistrationFees) > DelegateCommittees > DelegateFooter
export const defaultDelegateRegistrationSections: LandingSectionContent[] = [
  {
    key: "delegate-hero",
    name: "Delegate Registration Hero",
    enabled: true,
    tagline: "Uniting Innovation, Wellness & Sustainability for a Better Tomorrow",
    buttonLabel: "REGISTER NOW",
    buttonHref: "#registration-fees",
    secondaryButtonLabel: "BECOME A SPEAKER",
    secondaryButtonHref: "/speakers",
    items: [
      { icon: "Users", value: "15,000+", label: "Expected Delegates" },
      { icon: "Store", value: "500+", label: "Exhibitors" },
      { icon: "Globe", value: "50+", label: "Countries" },
      { icon: "Mic", value: "200+", label: "Speakers" },
      { icon: "Calendar", value: "3", label: "Days of Innovation" },
    ],
  },
  {
    key: "day-themes",
    name: "3-Day Themes & Agenda",
    enabled: true,
    title: "3 DAYS. 3 POWERFUL THEMES. ENDLESS POSSIBILITIES.",
    items: [
      {
        badge: "DAY 1",
        date: "21 AUGUST 2026",
        title: "INNOVATE",
        subtitle: "Driving Healthcare Through Innovation",
        topics: [
          "Medical Innovation & Research",
          "Digital Health & AI",
          "Startups & Emerging Technologies",
          "Future of Healthcare Delivery",
        ],
      },
      {
        badge: "DAY 2",
        date: "22 AUGUST 2026",
        title: "COLLABORATE",
        subtitle: "Building Partnerships for a Healthier World",
        topics: [
          "Industry Collaboration",
          "Global Health Partnerships",
          "Public-Private Synergy",
          "Community Engagement",
        ],
      },
      {
        badge: "DAY 3",
        date: "23 AUGUST 2026",
        title: "SUSTAIN",
        subtitle: "Sustainable Solutions for Long-Term Impact",
        topics: [
          "Sustainable Healthcare Systems",
          "Wellness, Nutrition & Lifestyle",
          "Environmental Health",
          "Policy & Governance for Tomorrow",
        ],
      },
    ],
  },
  {
    key: "registration-fees",
    name: "Registration Fees & Passes",
    enabled: true,
    title: "DELEGATE REGISTRATION",
    subtitle: "18th Integrated Arogya Sanghosthi",
    date: "21 - 23 AUGUST 2026",
    location: "PRAGATI MAIDAN, NEW DELHI",
    dividerLabel: "REGISTRATION FEES",
    includesLabel: "Includes",
    buttonLabel: "Register Now",
    buttonHref: "/register-now",
    items: [
      {
        title: "DELEGATE PASS",
        price: "₹1,500",
        badge: "",
        features: ["Full-day Access", "Lunch & Refreshments", "Conference Kit"],
      },
      {
        title: "DELEGATE PASS",
        price: "₹3,000",
        badge: "★ MOST POPULAR ★",
        features: ["All 3 Days Access", "Lunch & Refreshments", "Premium Conference Kit"],
      },
      {
        title: "PAPER PRESENTATION",
        price: "₹2,500",
        badge: "",
        features: ["Presentation Slot", "Delegate Access included", "Publication Opportunity"],
      },
      {
        title: "POSTER PRESENTATION",
        price: "₹2,500",
        badge: "",
        features: ["Poster Display Area", "Delegate Access included", "Special Recognition"],
      },
    ],
    bandItems: [
      { title: "CERTIFICATE OF PARTICIPATION" },
      { title: "NETWORK WITH EXPERTS" },
      { title: "ACCESS TO INTERNATIONAL HEALTH & WELLNESS EXPO" },
      { title: "KNOWLEDGE SESSIONS & PANEL DISCUSSIONS" },
      { title: "LUNCH INCLUDED (AS PER CATEGORY)" },
    ],
  },
  {
    key: "conference-themes",
    name: "Conference Themes",
    enabled: true,
    title: "CONFERENCE THEMES",
    items: [
      { title: "Preventive & Integrative Healthcare" },
      { title: "Medical Innovation & Research" },
      { title: "Wellness, Nutrition & Lifestyle" },
      { title: "Healthcare Policy & Governance" },
      { title: "Digital Health & Technology" },
      { title: "AYUSH & Traditional Wisdom" },
    ],
  },
  {
    key: "why-attend",
    name: "Why Attend IHWE 2026",
    enabled: true,
    title: "WHY ATTEND IHWE 2026?",
    items: [
      { title: "Connect with Global Leaders" },
      { title: "Gain Insights on Emerging Trends" },
      { title: "Build Strategic Collaborations" },
      { title: "Influence Policy & Practice" },
      { title: "Shape the Future of Healthcare" },
    ],
  },
  {
    key: "eminent-speakers",
    name: "Eminent Speakers & Leaders",
    enabled: true,
    title: "MEET OUR EMINENT SPEAKERS & LEADERS",
    buttonLabel: "VIEW ALL SPEAKERS",
    buttonHref: "/speakers",
    note: "Speaker cards load live from the Eminent Speakers feed.",
  },
  {
    key: "paper-presentation-call",
    name: "Paper Presentation Call",
    enabled: true,
    title: "PAPER PRESENTATION",
    subtitle: "Present Your Research. Influence the Future.",
    buttonLabel: "SUBMIT YOUR ABSTRACT NOW",
    buttonHref: "/paper-presentation",
    note: "Last Date: 30th June 2026",
    items: [
      { title: "Open to Doctors, Researchers, Academicians & Students" },
      { title: "Best Paper Awards in Multiple Categories" },
      { title: "Publication Opportunities in Indexed Journals" },
      { title: "Increase Visibility & Academic Impact" },
    ],
    steps: [
      { title: "Submit", text: "Your Abstract" },
      { title: "Review", text: "By Expert Panel" },
      { title: "Present", text: "At Conference" },
      { title: "Get Recognized", text: "& Published" },
    ],
  },
  {
    key: "organising-committee",
    name: "Organising Committee",
    enabled: true,
    title: "ORGANISING COMMITTEE",
    secondaryTitle: "ADVISORY BOARD",
    supportTitle: "ORGANISING MEMBERS",
    supportDescription: "A Dedicated Team of Healthcare Professionals Working Together to Deliver an Impactful Experience",
    buttonLabel: "VIEW FULL COMMITTEE",
    note: "Committee members load live from the Organising Committee feed.",
    items: [
      { title: "Dr. Anurag Aggarwal" },
      { title: "Dr. G. N. Singh" },
      { title: "Dr. Bhushan Patwardhan" },
      { title: "Dr. Abhay Bang" },
      { title: "Dr. Rama Joshi" },
      { title: "And Many More" },
    ],
  },
  {
    key: "register-cta-banner",
    name: "Registration CTA Banner",
    enabled: true,
    title: "BE A PART OF THE CHANGE. SHAPE THE FUTURE OF HEALTHCARE.",
    buttonLabel: "REGISTER NOW",
    buttonHref: "#registration-fees",
  },
  {
    key: "delegate-contact-bar",
    name: "Delegate Contact Bar",
    enabled: true,
    title: "Have Questions?",
    subtitle: "We're here to help!",
    phoneNumber: "+91-9654900525",
    contactEmail: "info@ihwe.in",
    websiteUrl: "www.ihwe.in",
    socialsLabel: "Follow Us",
  },
];

// 4. TERMS & CONDITIONS PAGE SECTIONS
export const defaultTermsAndConditionsSections: LandingSectionContent[] = [];

// 5. PRIVACY POLICY PAGE SECTIONS
export const defaultPrivacyPolicySections: LandingSectionContent[] = [];

// 6. REFUND POLICY PAGE SECTIONS
export const defaultRefundPolicySections: LandingSectionContent[] = [];
