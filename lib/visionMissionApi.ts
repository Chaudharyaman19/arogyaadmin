import { api } from "./api";

// Website home "Our Vision / Our Mission / Chairman's Message" — Pages & CMS → Home.
// Saved to backend-arogya; the website reads it from GET /api/vision-mission.

export interface MissionBlock {
  _id?: string;
  heading: string;
  /** "\n" = line break on the website */
  body: string;
  image: string;
  imageAlt: string;
  isActive: boolean;
}

export interface ChairmanCard {
  heading: string;
  message: string;
  name: string;
  designation: string;
  image: string;
  imageAlt: string;
  leafImage: string;
  leafImageAlt: string;
}

export interface VisionMission {
  dividerImage: string;
  dividerImageAlt: string;
  visionHeading: string;
  visionText: string;
  visionIcon: string;
  visionIconAlt: string;
  visionImage: string;
  visionImageAlt: string;
  missionHeading: string;
  missionBlocks: MissionBlock[];
  chairman: ChairmanCard;
  updatedAt?: string;
  updatedBy?: string;
}

export const visionMissionApi = {
  /** null until vision & mission are saved for the first time */
  get: () => api.get<VisionMission | null>("/vision-mission"),
  save: (input: VisionMission) => api.put<VisionMission>("/vision-mission", input),
  /** Uploads to Cloudinary (arogya_2026/home/vision-mission) and returns the image URL */
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/vision-mission/upload", form);
  },
};
