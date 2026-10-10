import { api } from "./api";

// Website settings saved to backend-arogya (the website reads them from GET /api/settings).

export interface TopbarContact {
  emails: string[];
  phones: string[];
  /** true while nothing is saved yet and the website shows its built-in contact details */
  isDefault?: boolean;
}

export interface FooterStat {
  icon: string;
  number: number;
  label: string;
  image: string;
  imageAlt: string;
}

export interface FooterHighlight {
  iconType: string;
  title: string;
  desc: string;
  image: string;
  imageAlt: string;
}

export interface FooterLink {
  name: string;
  path: string;
}

export interface FooterExtras {
  dividerImage: string;
  dividerImageAlt: string;
  connectTitle: string;
  appTitle: string;
  appText: string;
  googlePlayUrl: string;
  appStoreUrl: string;
  organizedByTitle: string;
  organizedByLogo: string;
  organizedByLogoAlt: string;
  organizedByLink: string;
  newsletterTitle: string;
  newsletterText: string;
  newsletterIcon: string;
  newsletterIconAlt: string;
  brochureTitle: string;
  brochureButtonLabel: string;
  brochureUrl: string;
  brochureIcon: string;
  brochureIconAlt: string;
  buildingImage: string;
  buildingImageAlt: string;
  leafImage: string;
  leafImageAlt: string;
  bottomImage: string;
  bottomImageAlt: string;
  brandName: string;
  editionText: string;
  copyrightText: string;
  designedByText: string;
  policyLinks: { label: string; href: string }[];
}

export interface FooterSocial {
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
  youtube: string;
}

/** The whole website footer (Pages & CMS → Footer). "\n" in texts = line break. */
export interface FooterContent {
  logo: string;
  logoAlt: string;
  aboutText: string;
  aboutHighlighted: string;
  stats: FooterStat[];
  quickLinksTitle: string;
  quickLinks: FooterLink[];
  highlightsTitle: string;
  highlights: FooterHighlight[];
  getInTouchTitle: string;
  phones: string[];
  emails: string[];
  website: string;
  address: string;
  helplineTitle: string;
  helplinePhone: string;
  helplineTiming: string;
  social: FooterSocial;
  extras: FooterExtras;
  updatedAt?: string;
  updatedBy?: string;
}

export const siteSettingsApi = {
  topbarContact: () => api.get<TopbarContact>("/site-settings/topbar-contact"),
  updateTopbarContact: (input: { emails: string[]; phones: string[] }) =>
    api.put<TopbarContact>("/site-settings/topbar-contact", input),

  footer: () => api.get<FooterContent>("/site-settings/footer"),
  saveFooter: (input: Omit<FooterContent, "updatedAt" | "updatedBy">) => api.put<FooterContent>("/site-settings/footer", input),
  /** Uploads to Cloudinary (arogya_2026/footer) and returns the image URL */
  uploadFooterImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/site-settings/footer/upload", form);
  },

  /** Brochure PDF (max 10 MB) → Cloudinary; the website serves it at /brochure */
  uploadFooterBrochure: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileName: string; fileSize: string }>("/site-settings/footer/upload-brochure", form);
  },
};
