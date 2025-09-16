import { Router } from "express";

import { addReview, deleteReview, getReview } from "@/controllers/review/review.controller";
import { isAuth, isPurchaseByTheUser } from "@/middlewares/isAuth.middleware";
import {
  paramValidator,
  queryValidator,
  validator,
} from "@/middlewares/validator.middlewares";
import { uuidGSchema } from "@/validators";
import { newReviewSchema, paginationSchema } from "@/validators/review/review.validation";

const reviewRouter = Router();

reviewRouter.get(
  "/:bookid",
  paramValidator(uuidGSchema("bookid")),
  queryValidator(paginationSchema),
  getReview
);

// ! Authenticated routes

reviewRouter.use(isAuth);
reviewRouter.post(
  "/:bookId",
  paramValidator(uuidGSchema("bookId")),
  validator(newReviewSchema),
  isPurchaseByTheUser,
  addReview
);

reviewRouter.delete("/:id", paramValidator(uuidGSchema("id")), deleteReview);

export { reviewRouter };
