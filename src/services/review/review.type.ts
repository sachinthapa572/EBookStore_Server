import type { ObjectId } from "mongoose";

export type PopulatedUser = {
  _id: ObjectId;
  name: string;
  avatar: { id: string; url: string };
};

export type FormattedReview = {
  id: string;
  content?: string;
  date: string;
  rating: number;
  user: {
    id: string;
    name: string;
    avatar: { id: string; url: string };
  };
};

export type PaginatedReviewsResult = {
  reviews: FormattedReview[];
  totalReviews: number;
  totalPages: number;
  currentPage: string;
  nextPage: string | null;
};

export type ReviewData = {
  content?: string;
  rating: number;
};
