import { ApiError } from "@/utils/ApiError";

import type { PaginatedReviewsResult, PopulatedUser, ReviewData } from "./review.type";
import { HttpStatusCode } from "@/constant";
import logger from "@/logger/winston.logger";
import { BookModel } from "@/model/Book/book.model";
import { ReviewModel } from "@/model/review/review.model";
import type { NewReviewType } from "@/validators/review/review.validation";

class ReviewService {
  // Utility function to calculate and update average rating
  async calculateAndUpdateAvgRating(bookId: string): Promise<void> {
    const result = await ReviewModel.aggregate<{
      avgRating: number;
      count: number;
    }>([
      { $match: { book: bookId } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const { avgRating, count } = result[0] || { avgRating: 0, count: 0 };

    await BookModel.findByIdAndUpdate(bookId, {
      avgRating,
      totalReviews: count,
    });
  }

  // Add or update a review
  async addOrUpdateReview(bookId: string, userId: string, reviewData: NewReviewType) {
    const { rating, content } = reviewData;

    const review = await ReviewModel.findOneAndUpdate(
      { book: bookId, user: userId },
      { rating, content, book: bookId, user: userId },
      { upsert: true, new: true }
    );

    if (!review) {
      throw new ApiError(423, "Unable to process review submission");
    }

    // Update average rating if there are more than 10 reviews
    const reviewCount = await ReviewModel.countDocuments({ book: bookId });
    if (reviewCount > 10) {
      await this.calculateAndUpdateAvgRating(bookId);
    }

    logger.info(`Review successfully added for book ${bookId}`);
    return review;
  }

  // Delete a review
  async deleteUserReview(reviewId: string, userId: string): Promise<string> {
    const review = await ReviewModel.findOneAndDelete({
      _id: reviewId,
      user: userId,
    }).exec();

    if (!review) {
      throw new ApiError(
        HttpStatusCode.Forbidden,
        "You are not authorized to delete this review or the review does not exist"
      );
    }

    return review._id.toString();
  }

  // Get paginated public reviews for a book
  async getPublicReviews(
    bookId: string,
    pagination: { page: string; limit: string }
  ): Promise<PaginatedReviewsResult> {
    const { page = "1", limit = "10" } = pagination;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.max(Number(limit) || 10, 1);

    const [totalReviews, reviews] = await Promise.all([
      ReviewModel.countDocuments({ book: bookId }),
      ReviewModel.find({ book: bookId })
        .populate<{
          user: PopulatedUser;
        }>({ path: "user", select: "name avatar" })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
    ]);

    const totalPages = Math.ceil(totalReviews / limitNumber);
    const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;

    const reviewsData =
      reviews.length > 0
        ? reviews.map((r) => ({
            id: r._id.toString(),
            content: r.content,
            date: r.createdAt.toISOString().split("T")[0],
            rating: r.rating,
            user: {
              id: r.user._id.toString(),
              name: r.user.name,
              avatar: r.user.avatar,
            },
          }))
        : [];

    return {
      reviews: reviewsData,
      totalReviews,
      totalPages,
      currentPage: pageNumber.toString(),
      nextPage: nextPage?.toString() || null,
    };
  }

  // Get user's own review for a book
  async getUserOwnReview(bookId: string, userId: string): Promise<ReviewData> {
    const review = await ReviewModel.findOne({ book: bookId, user: userId });

    if (!review) {
      throw new ApiError(
        HttpStatusCode.Forbidden,
        "You are not authorized to view this review or the review does not exist"
      );
    }

    return {
      content: review.content,
      rating: review.rating,
    };
  }
}

export const reviewService = new ReviewService();
