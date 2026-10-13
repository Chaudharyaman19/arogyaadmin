import { LandingSectionContent } from "./landingContent";
import { galleryHeroSection } from "./gallery/galleryHero";
import { galleryCountersSection } from "./gallery/galleryCounters";
import { galleryVideosSection } from "./gallery/galleryVideos";
import { galleryJoinUsSection } from "./gallery/galleryJoinUs";

// Years, categories and photos are managed from the Media Library page, so they have no section here.
export const defaultGallerySections: LandingSectionContent[] = [
  galleryHeroSection,
  galleryCountersSection,
  galleryVideosSection,
  galleryJoinUsSection,
];
