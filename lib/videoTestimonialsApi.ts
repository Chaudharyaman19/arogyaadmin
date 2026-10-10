import { api } from "./api";

// Video testimonials of the website home page — Video Testimonials (sidebar). Saved to
// backend-arogya; the website shows the Published ones (GET /api/testimonials/videos).

export type VideoSource = "YOUTUBE" | "UPLOAD" | "INSTAGRAM";
export type VideoStatus = "Published" | "Hidden";

export interface VideoTestimonial {
  _id: string;
  name: string;
  designation: string;
  organization: string;
  sourceType: VideoSource;
  videoUrl: string;
  thumbnail: string;
  status: VideoStatus;
  order: number;
  updatedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export type VideoTestimonialInput = Pick<
  VideoTestimonial,
  "name" | "designation" | "organization" | "sourceType" | "videoUrl" | "thumbnail" | "status"
>;

const uploadTo = (path: string) => (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.postForm<{ url: string; fileSize: string }>(path, form);
};

export const videoTestimonialsApi = {
  list: () => api.get<VideoTestimonial[]>("/video-testimonials"),
  create: (input: VideoTestimonialInput) => api.post<VideoTestimonial>("/video-testimonials", input),
  update: (id: string, input: Partial<VideoTestimonialInput>) => api.put<VideoTestimonial>(`/video-testimonials/${id}`, input),
  remove: (id: string) => api.delete<null>(`/video-testimonials/${id}`),
  /** Thumbnail image → Cloudinary (arogya_2026/home/testimonials/video-thumbnails) */
  uploadThumbnail: uploadTo("/video-testimonials/upload-thumbnail"),
  /** Video file (MP4 / WEBM / MOV, up to 50 MB) → Cloudinary (arogya_2026/home/testimonials/videos) */
  uploadVideo: uploadTo("/video-testimonials/upload-video"),
};

/** YouTube video id from watch / youtu.be / shorts / embed links */
export const youtubeId = (url = "") =>
  url.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?/]{11})/)?.[1] ?? "";

/** Picture for the list: uploaded thumbnail, else YouTube's own, else a frame of an uploaded video */
export const videoThumbnail = (v: Pick<VideoTestimonial, "thumbnail" | "sourceType" | "videoUrl">) => {
  if (v.thumbnail) return v.thumbnail;
  if (v.sourceType === "YOUTUBE" && youtubeId(v.videoUrl)) return `https://img.youtube.com/vi/${youtubeId(v.videoUrl)}/hqdefault.jpg`;
  if (v.sourceType === "UPLOAD" && v.videoUrl.includes("res.cloudinary.com")) return v.videoUrl.replace(/\.[a-z0-9]+$/i, ".jpg");
  return "";
};

/** URL to embed in the preview player */
export const videoEmbedUrl = (v: Pick<VideoTestimonial, "sourceType" | "videoUrl">) => {
  if (v.sourceType === "YOUTUBE") return youtubeId(v.videoUrl) ? `https://www.youtube.com/embed/${youtubeId(v.videoUrl)}` : "";
  if (v.sourceType === "INSTAGRAM") {
    const clean = v.videoUrl.split("?")[0];
    return `${clean.endsWith("/") ? clean : `${clean}/`}embed`;
  }
  return v.videoUrl;
};
