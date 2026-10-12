import { LandingSectionContent } from "../landingContent";

export const galleryVideosSection: LandingSectionContent = {
  key: "gallery-videos",
  name: "Video Highlights",
  enabled: true,
  heading: "VIDEO HIGHLIGHTS",
  shareTitle: "Share Your Moments",
  shareDescription:
    "Were you part of Arogya Sanghoshti? Share your photos!",
  shareButton: "Upload Your Photos",
  items: [
    {
      title: "Inauguration Highlights",
      videoUrl: "https://www.youtube.com/watch?v=fqAFs6KPwbM",
      thumbnail: "https://img.youtube.com/vi/fqAFs6KPwbM/mqdefault.jpg",
      sourceType: "YOUTUBE",
    },
    {
      title: "Scientific Sessions",
      videoUrl: "https://www.youtube.com/watch?v=3Ybp5BzK8fc",
      thumbnail: "https://img.youtube.com/vi/3Ybp5BzK8fc/mqdefault.jpg",
      sourceType: "YOUTUBE",
    },
    {
      title: "Exhibition (Expo)",
      videoUrl: "",
      thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
      sourceType: "YOUTUBE",
    },
    {
      title: "Cultural Programs",
      videoUrl: "",
      thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop",
      sourceType: "YOUTUBE",
    },
  ],
};
