import { LandingSectionContent } from "./landingContent";
import { speakersHeroSection } from "./speakers/speakersHero";
import { speakersListSection } from "./speakers/speakersList";
import { speakerCategoriesSection } from "./speakers/speakerCategories";
import { callForSpeakersSection } from "./speakers/callForSpeakers";
import { pastSpeakersSection } from "./speakers/pastSpeakers";

export const defaultSpeakersSections: LandingSectionContent[] = [
  speakersHeroSection,
  speakersListSection,
  speakerCategoriesSection,
  callForSpeakersSection,
  pastSpeakersSection,
];