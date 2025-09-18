import { ApiResponse } from "@/utils/ApiResponse";
import { asyncHandler, type CustomRequestHandler } from "@/utils/asyncHandler";

import { HttpStatusCode } from "@/constant";
import { reviewService } from "@/services/review/review.service";
import type { UuidGType } from "@/validators";
import type { NewReviewType, PaginationType } from "@/validators/review/review.validation";

// add the review
const addReview: CustomRequestHandler<NewReviewType, UuidGType<["bookId"]>> = asyncHandler(
  async (req, res) => {
    const { body, user } = req;
    const { bookId } = req.params;

    const review = await reviewService.addOrUpdateReview(bookId, user._id, body);

    res
      .status(HttpStatusCode.OK)
      .json(
        new ApiResponse(HttpStatusCode.OK, review, "Review has been successfully submitted")
      );
  }
);

const deleteReview: CustomRequestHandler<object, UuidGType<["id"]>> = asyncHandler(
  async (req, res) => {
    const reviewId = await reviewService.deleteUserReview(req.params.id, req.user._id);

    res
      .status(HttpStatusCode.OK)
      .json(
        new ApiResponse(
          HttpStatusCode.OK,
          { reviewId },
          "Review has been successfully removed"
        )
      );
  }
);

const getPublicReviews: CustomRequestHandler<
  object,
  UuidGType<["bookId"]>,
  PaginationType
> = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { page = "1", limit = "10" } = req.query;

  const result = await reviewService.getPublicReviews(bookId, { page, limit });

  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        result,
        result.reviews.length
          ? `Successfully retrieved ${result.reviews.length} reviews`
          : "No reviews found for this book"
      )
    );
});

const getOwnReview: CustomRequestHandler<object, UuidGType<["bookId"]>> = asyncHandler(
  async (req, res) => {
    const { bookId } = req.params;

    const reviewData = await reviewService.getUserOwnReview(bookId, req.user._id);

    res
      .status(HttpStatusCode.OK)
      .json(new ApiResponse(HttpStatusCode.OK, reviewData, "Review retrieved successfully"));
  }
);

export { addReview, deleteReview, getPublicReviews, getOwnReview };
