import { LandingSectionContent } from "../landingContent";

export const callForSpeakersSection: LandingSectionContent = {
  key: "call-for-speakers",
  name: "Call for Speakers & Registration CTA",
  enabled: true,
  heading: "BE A PART OF INSIGHTFUL SESSIONS",
  subtitle: "Join meaningful discussions at Arogya Sangoshthi 2026",
  description:
    "Register now and secure your seat for India's Premier Integrated Healthcare Conference uniting Modern Medicine, AYUSH, Technology and Traditional Wisdom for a healthier tomorrow.",
  buttonLabel: "REGISTER NOW",
  buttonHref: "/register-now",
  secondaryButtonLabel: "DELEGATE REGISTRATION",
  secondaryButtonHref: "/delegate-registration",
  items: [
    {
      title: "Keynote Sessions",
      desc: "Global thought leaders share their vision",
      icon: "Mic",
    },
    {
      title: "Panel Discussions",
      desc: "Diverse perspectives on critical healthcare topics",
      icon: "Users",
    },
    {
      title: "Workshops",
      desc: "Hands-on learning from experts",
      icon: "Wrench",
    },
    {
      title: "Networking",
      desc: "Connect. Collaborate. Create impact.",
      icon: "Handshake",
    },
    {
      title: "Innovation Showcase",
      desc: "Discover breakthrough ideas & solutions",
      icon: "Lightbulb",
    },
  ],
};