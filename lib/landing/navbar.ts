import { LandingSectionContent } from "../landingContent";

export const navbarSection: LandingSectionContent = {
  key: "navbar",
  name: "Header Navigation",
  enabled: true,
  title: "Arogya Sangoshthi",
  logoImage: "",
  buttonLabel: "Register Now",
  buttonHref: "/register-now",
  secondaryButtonLabel: "Delegate Registration",
  secondaryButtonHref: "/delegate-registration",
  items: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Speakers", href: "/speakers" },
    { label: "Paper Presentation", href: "/paper-presentation" },
    { label: "Partners", href: "/partners" },
    { label: "Gallery", href: "/gallery" },
    { label: "Blogs", href: "/blogs" },
    { label: "Contact Us", href: "/contact" },
  ],
};