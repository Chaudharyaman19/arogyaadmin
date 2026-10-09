import { LandingSectionContent } from "../landingContent";

export const globalVoicesSection: LandingSectionContent = {
  key: "global-voices",
  name: "Global Voices",
  enabled: true,
  heading: "GLOBAL VOICES OF",
  subheading: "Healthcare Innovation",
  description:
    "Learn from the world's leading minds shaping the future of healthcare.",
  ctaLabel: "VIEW FULL SPEAKER LIST",
  ctaHref: "/speakers",
  items: [
    { number: "42+", label: "Expert Speakers" },
    { number: "5", label: "Keynote Addresses" },
    { number: "7+", label: "Countries" },
  ],
  features: [
    {
      title: "World-Class Speakers",
      text: "Thought leaders from across the\nglobe under one roof.",
      image: "",
    },
    {
      title: "Diverse Expertise",
      text: "Covering Modern Medicine, AYUSH,\nPharma, Tech & more.",
      image: "",
    },
    {
      title: "Actionable Insights",
      text: "Real-world solutions for a\nhealthier tomorrow.",
      image: "",
    },
    {
      title: "Unmatched Networking",
      text: "Connect, collaborate and create\nlasting impact.",
      image: "",
    },
  ],
};
