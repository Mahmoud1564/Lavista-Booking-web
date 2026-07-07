import { useQuery } from "@tanstack/react-query";
import {
  fetchAboutImages,
  fetchExperiences,
  fetchFaq,
  fetchReviews,
  fetchWebsiteContent,
} from "./booking-api";

export function useExperiencesContent() {
  return useQuery({ queryKey: ["experiences"], queryFn: fetchExperiences, staleTime: 60_000 });
}
export function useFaqContent() {
  return useQuery({ queryKey: ["faq"], queryFn: fetchFaq, staleTime: 60_000 });
}
export function useReviewsContent() {
  return useQuery({ queryKey: ["reviews"], queryFn: fetchReviews, staleTime: 60_000 });
}
export function useWebsiteContent() {
  return useQuery({ queryKey: ["website_content"], queryFn: fetchWebsiteContent, staleTime: 60_000 });
}
export function useAboutImages() {
  return useQuery({ queryKey: ["about_images"], queryFn: fetchAboutImages, staleTime: 60_000 });
}
