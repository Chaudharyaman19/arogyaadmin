import { LandingSectionContent } from "./landingContent";
import { partnersHeroSection } from "./partners/partnersHero";
import { becomePartnerSection } from "./partners/becomePartner";

// Partner categories and logos are managed from the Exhibitor List page, so they have no section here.
export const defaultPartnersSections: LandingSectionContent[] = [
  partnersHeroSection,
  becomePartnerSection,
];