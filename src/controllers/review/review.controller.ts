import logger from "@/logger/winston.logger";
import ReviewModel from "@/model/review/review.model";
import { customReqHandler, newReviewType } from "@/types";
import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import { asyncHandler } from "@/utils/asyncHandler";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

// Utility function to calculate averages
const calculateAndUpdateAvgRating = async (bookId: string) => {
  const { avgRating, count } = await ReviewModel.aggregate<{
    avgRating: number;
    count: number;
  }>([
    { $match: { bookId } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]).then((result) => result[0] || { avgRating: 0, count: 0 });

  await ReviewModel.updateOne(
    { bookId },
    {
      avgRating,
      totalReviews: count,
    }
  );
};

// add the review
export const addReview: customReqHandler<newReviewType> = asyncHandler(async (req, res) => {
  const { body, user } = req;
  const { rating, content, bookId } = body;

  const review = await ReviewModel.findOneAndUpdate(
    { bookId, userId: user._id },
    { rating, content, bookId, userId: user._id },
    { upsert: true, new: true }
  );

  if (!review) {
    throw new ApiError(500, "Failed to add review");
  }

  // Update average rating if there are more than 10 reviews
  const reviewCount = await ReviewModel.countDocuments({ bookId });
  if (reviewCount > 10) {
    await calculateAndUpdateAvgRating(bookId);
  }

  logger.info(`Review successfully added for book ${bookId}`);
  res.status(201).json(new ApiResponse(201, review, "Review added successfully"));
});

export const deleteReview: RequestHandler = asyncHandler(async (req, res) => {
  const { body, user } = req;

  const review = await ReviewModel.findOneAndDelete({
    _id: body.id,
    userId: user._id,
  });

  if (!review) {
    throw new ApiError(404, "Review not found or user not authorized");
  }

  res.status(200).json(new ApiResponse(200, {}, "Review deleted successfully"));
});

export const getReview: RequestHandler = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { page = "1", limit = "10" } = req.query;

  if (!isValidObjectId(bookId)) {
    throw new ApiError(400, "Invalid book ID");
  }

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.max(Number(limit) || 10, 1);

  const [totalReviews, reviews] = await Promise.all([
    ReviewModel.countDocuments({ bookId }),
    ReviewModel.find({ bookId })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
  ]);

  const totalPages = Math.ceil(totalReviews / limitNumber);
  const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        totalReviews,
        totalPages,
        currentPage: pageNumber.toString(),
        nextPage: nextPage?.toString() || null,
      },
      reviews.length ? "Reviews found" : "No reviews available"
    )
  );
});
