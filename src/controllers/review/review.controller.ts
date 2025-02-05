import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

import { ReviewModel } from "@/model";
import { customReqHandler, newReviewType } from "@/types";
import { ApiError, ApiResponse, asyncHandler } from "@/utils";
import logger from "@/utils/logger";

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
  ]).then((result: any) => result[0] || { avgRating: 0, count: 0 });

  await ReviewModel.updateOne(
    { bookId },
    {
      avgRating,
      totalReviews: count,
    }
  );
};

// add the review
const addReview: customReqHandler<newReviewType> = asyncHandler(async (req, res) => {
  const { body, user } = req;
  const { rating, content, bookId } = body;

  const review = await ReviewModel.findOneAndUpdate(
    { bookId, userId: user._id },
    { rating, content, bookId, userId: user._id },
    { upsert: true, new: true }
  );

  if (!review) {
    throw new ApiError(423, "Unable to process review submission");
  }

  // Update average rating if there are more than 10 reviews
  const reviewCount = await ReviewModel.countDocuments({ bookId });
  if (reviewCount > 10) {
    await calculateAndUpdateAvgRating(bookId);
  }

  logger.info(`Review successfully added for book ${bookId}`);
  res.status(201).json(new ApiResponse(201, review, "Review has been successfully submitted"));
});

const deleteReview: RequestHandler = asyncHandler(async (req, res) => {
  const { body, user } = req;

  const review = await ReviewModel.findOneAndDelete({
    _id: body.id,
    userId: user._id,
  });

  if (!review) {
    throw new ApiError(
      403,
      "You are not authorized to delete this review or the review does not exist"
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, { reviewId: body.id }, "Review has been successfully removed"));
});

const getReview: RequestHandler = asyncHandler(async (req, res) => {
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
      reviews.length
        ? `Successfully retrieved ${reviews.length} reviews`
        : "No reviews found for this book"
    )
  );
});

export { addReview, deleteReview, getReview };
