import { LandingSectionContent } from "./landingContent";
import { paperHeroSection } from "./paperPresentation/paperHero";
import { importantDatesSection } from "./paperPresentation/importantDates";
import { topicsOfInterestSection } from "./paperPresentation/topicsOfInterest";
import { guidelinesSection } from "./paperPresentation/guidelines";
import { awardsRecognitionSection } from "./paperPresentation/awardsRecognition";
import { whyChoosePaperSection } from "./paperPresentation/whyChoosePaper";
import { needHelpPaperSection } from "./paperPresentation/needHelpPaper";

export const defaultPaperPresentationSections: LandingSectionContent[] = [
  paperHeroSection,
  importantDatesSection,
  topicsOfInterestSection,
  guidelinesSection,
  awardsRecognitionSection,
  whyChoosePaperSection,
  needHelpPaperSection,
];
