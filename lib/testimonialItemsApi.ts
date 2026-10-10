import { api } from "./api";

// Home page testimonial cards — Testimonials (sidebar). Saved to backend-arogya; the website
// shows the Published ones (GET /api/testimonials/items). No photo = the website shows initials.

export type TestimonialStatus = "Published" | "Pending Review" | "Hidden";

export interface TestimonialItem {
  _id: string;
  name: string;
  designation: string;
  organization: string;
  feedback: string;
  rating: number;
  status: TestimonialStatus;
  image: string;
  imageAlt: string;
  /** initials badge colour when there is no photo */
  color: string;
  order: number;
  updatedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TestimonialItemInput = Pick<
  TestimonialItem,
  "name" | "designation" | "organization" | "feedback" | "status" | "image" | "imageAlt" | "color"
>;

export const testimonialItemsApi = {
  list: () => api.get<TestimonialItem[]>("/testimonial-items"),
  create: (input: TestimonialItemInput) => api.post<TestimonialItem>("/testimonial-items", input),
  update: (id: string, input: Partial<TestimonialItemInput>) => api.put<TestimonialItem>(`/testimonial-items/${id}`, input),
  remove: (id: string) => api.delete<null>(`/testimonial-items/${id}`),
  /** Uploads to Cloudinary (arogya_2026/home/testimonials/people) and returns the image URL */
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string; fileSize: string }>("/testimonial-items/upload", form);
  },
};
