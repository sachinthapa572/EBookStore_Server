import { Router } from "express";

import {
  addReview,
  deleteReview,
  getOwnReview,
  getPublicReviews,
} from "@/controllers/review/review.controller";
import { isAuth, isPurchaseByTheUser } from "@/middlewares/isAuth.middleware";
import {
  paramValidator,
  queryValidator,
  validator,
} from "@/middlewares/validator.middlewares";
import { uuidGSchema } from "@/validators";
import { newReviewSchema, paginationSchema } from "@/validators/review/review.validation";

const reviewRoute = Router();

reviewRoute.get(
  "list/:bookId",
  paramValidator(uuidGSchema("bookId")),
  queryValidator(paginationSchema),
  getPublicReviews
);

// ! Authenticated routes
reviewRoute.use(isAuth);

reviewRoute.get("/:bookId", paramValidator(uuidGSchema("bookId")), getOwnReview);
reviewRoute.post(
  "/:bookId",
  paramValidator(uuidGSchema("bookId")),
  validator(newReviewSchema),
  isPurchaseByTheUser,
  addReview
);

reviewRoute.delete("/:id", paramValidator(uuidGSchema("id")), deleteReview);

export default reviewRoute;
