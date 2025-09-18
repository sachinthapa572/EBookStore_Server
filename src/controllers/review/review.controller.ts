import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { asyncHandler, type CustomRequestHandler } from "@/utils/asyncHandler";

import { HttpStatusCode } from "@/constant";
import logger from "@/logger/winston.logger";
import { ReviewModel } from "@/model/review/review.model";
import type { UuidGType } from "@/validators";
import type { NewReviewType, PaginationType } from "@/validators/review/review.validation";

// Utility function to calculate averages
const calculateAndUpdateAvgRating = async (bookId: string) => {
  const { avgRating, count } = await ReviewModel.aggregate<{
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
  ]).then((result) => result[0] || { avgRating: 0, count: 0 });

  await ReviewModel.updateOne(
    { book: bookId },
    {
      avgRating,
      totalReviews: count,
    }
  );
};

// add the review
const addReview: CustomRequestHandler<NewReviewType, UuidGType<["bookId"]>> = asyncHandler(
  async (req, res) => {
    const { body, user } = req;
    const { rating, content } = body;
    const { bookId } = req.params;

    const review = await ReviewModel.findOneAndUpdate(
      { book: bookId, user: user._id },
      { rating, content, book: bookId, user: user._id },
      { upsert: true, new: true }
    );

    if (!review) {
      throw new ApiError(423, "Unable to process review submission");
    }

    // Update average rating if there are more than 10 reviews
    const reviewCount = await ReviewModel.countDocuments({ book: bookId });
    if (reviewCount > 10) {
      await calculateAndUpdateAvgRating(bookId);
    }

    logger.info(`Review successfully added for book ${bookId}`);
    res
      .status(HttpStatusCode.OK)
      .json(
        new ApiResponse(HttpStatusCode.OK, review, "Review has been successfully submitted")
      );
  }
);

const deleteReview: CustomRequestHandler<object, UuidGType<["id"]>> = asyncHandler(
  async (req, res) => {
    const { user } = req;
    const { id } = req.params;

    const review = await ReviewModel.findOneAndDelete({
      _id: id,
      user: user._id,
    });

    if (!review) {
      throw new ApiError(
        HttpStatusCode.Forbidden,
        "You are not authorized to delete this review or the review does not exist"
      );
    }

    res
      .status(HttpStatusCode.OK)
      .json(
        new ApiResponse(
          HttpStatusCode.OK,
          { reviewId: review._id },
          "Review has been successfully removed"
        )
      );
  }
);

const getReviews: CustomRequestHandler<
  object,
  UuidGType<["bookId"]>,
  PaginationType
> = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { page = "1", limit = "10" } = req.query;

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.max(Number(limit) || 10, 1);

  const [totalReviews, reviews] = await Promise.all([
    ReviewModel.countDocuments({ book: bookId }),
    ReviewModel.find({ book: bookId })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
  ]);

  const totalPages = Math.ceil(totalReviews / limitNumber);
  const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;

  res.status(HttpStatusCode.OK).json(
    new ApiResponse(
      HttpStatusCode.OK,
      {
        reviews,
        totalReviews,
        totalPages,
        currentPage: pageNumber.toString(),
        nextPage: nextPage?.toString() || null,
      },
      reviews.length
        ? `Successfully retrieved ${reviews.length} reviews`
        : "No reviews found for this book"
    )
  );
});

export { addReview, deleteReview, getReviews };
