import { normalizeLandingSection, type LandingSectionContent } from "./landingContent";

export type ContactSectionContent = LandingSectionContent;

export const defaultContactSections: ContactSectionContent[] = [
  {
    key: "contact-hero",
    name: "Contact Hero Banner & Quick Info",
    enabled: true,
    eyebrow: "CONTACT US",
    title: "Let's Connect\nWith You!",
    subtitle: "We're here to answer your questions and collaborate with you.",
    image: "https://res.cloudinary.com/dr8mld4i0/image/upload/v1788164944/arogya-sewa/hero-images/dignity-in-every-final-journey-bg.png",
    items: [
      {
        title: "Visit Us",
        description: "Pragati Maidan,\nNew Delhi - 110001, India",
        icon: "MapPin",
      },
      {
        title: "Email Us",
        description: "arogyasanghosthi@gmail.com\ninfo@arogyasanghosthi.com",
        icon: "Mail",
      },
      {
        title: "Call Us",
        description: "+91 98765 43210\n+91 11 1234 5678",
        icon: "Phone",
      },
      {
        title: "Office Hours",
        description: "Mon - Sat: 9:00 AM - 6:00 PM\nSunday: Closed",
        icon: "Clock",
      },
    ],
  },
  {
    key: "contact-form",
    name: "Contact Message Form & Why Contact Us",
    enabled: true,
    eyebrow: "REACH OUT TO US",
    title: "Send Us a Message",
    subtitle: "Talk to Expo Advisor",
    description: "Fill out the form below and our team will get back to you promptly.",
    buttonLabel: "Send Message",
    formTitle: "Send Us a Message",
    formTitleHighlight: "Send",
    formSubtitle: "We will get back to you soon!",
    formFields: [
      {
        key: "name",
        label: "Full Name",
        placeholder: " ",
        type: "text",
        required: true,
        maxLength: 100,
        icon: "User",
      },
      {
        key: "email",
        label: "Email Address",
        placeholder: " ",
        type: "email",
        required: true,
        maxLength: 254,
        icon: "Mail",
      },
      {
        key: "phone",
        label: "WhatsApp Number",
        placeholder: " ",
        type: "tel",
        required: true,
        maxLength: 15,
        icon: "Phone",
        otpEnabled: true,
        otpLabel: "Enter OTP",
        sendOtpLabel: "Send OTP",
        resendOtpLabel: "Resend OTP",
        verifyOtpLabel: "Verify",
        verifiedLabel: "Verified",
      },
      {
        key: "alternatePhone",
        label: "Alternate Number",
        placeholder: " ",
        type: "tel",
        required: false,
        maxLength: 15,
        icon: "Phone",
        optionalLabel: "(Optional)",
      },
      {
        key: "subject",
        label: "Subject",
        placeholder: " ",
        type: "text",
        required: true,
        maxLength: 200,
        icon: "Tag",
      },
      {
        key: "message",
        label: "Your Message",
        placeholder: " ",
        type: "textarea",
        required: true,
        maxLength: 5000,
        rows: 4,
        icon: "MessageSquare",
      },
    ],
    items: [
      {
        title: "General Inquiries",
        description: "Any questions? We're happy to help.",
        icon: "MessageCircle",
      },
      {
        title: "Partnerships & Sponsorships",
        description: "Let's build something meaningful together.",
        icon: "Handshake",
      },
      {
        title: "Speaker & Paper Queries",
        description: "Interested in speaking or presenting?",
        icon: "Mic",
      },
      {
        title: "Media & Press",
        description: "For media collaborations and interviews.",
        icon: "Camera",
      },
      {
        title: "Event Support",
        description: "Need help with registration or events?",
        icon: "Headphones",
      },
    ],
  },
  {
    key: "contact-bottom",
    name: "Map Location & Newsletter Subscription",
    enabled: true,
    eyebrow: "FIND US & SUBSCRIBE",
    title: "Find Us Here & Stay Updated!",
    subtitle: "Subscribe to our newsletter and never miss an update.",
    description: "Pragati Maidan,\nNew Delhi - 110001, India",
    buttonLabel: "Get Directions",
    secondaryButtonLabel: "Subscribe",
    mapCardTitle: "Find Us Here",
    mapCardAddress: "Pragati Maidan,\nNew Delhi - 110001, India",
    mapIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14010.597792706509!2d77.23467611599812!3d28.618606041009804!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce2d400000000%3A0xc6eb9b3e1503e7e3!2sPragati%20Maidan%2C%20New%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    newsletterTitle: "Stay Updated!",
    newsletterDescription: "Subscribe to our newsletter and never miss an update.",
    newsletterPlaceholder: "Enter your email address",
    newsletterButtonLabel: "Subscribe",
  },
];

export function mergeContactSections(sections?: ContactSectionContent[]): ContactSectionContent[] {
  if (!sections?.length) return defaultContactSections;
  const byKey = new Map(sections.map((s) => [s.key, s]));
  return defaultContactSections.map((fallback) => {
    const saved = byKey.get(fallback.key);
    if (!saved) return fallback;
    const items = saved.items !== undefined ? saved.items : fallback.items;
    const formFields = saved.formFields !== undefined ? saved.formFields : fallback.formFields;
    return normalizeLandingSection({ ...fallback, ...saved, items, formFields, enabled: saved.enabled !== false }, fallback);
  });
}