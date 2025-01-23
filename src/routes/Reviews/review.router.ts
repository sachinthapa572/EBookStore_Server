import { addReview, getReview } from "@/controllers";
import { isAuth, isPurchaseByTheUser } from "@/middlewares/isAuth.middleware";
import { validater } from "@/middlewares/validator.middlewares";
import { newReviewSchema } from "@/validators/review/review.validation";
import { Router } from "express";

const reviewRouter = Router();

reviewRouter.post("/", isAuth, validater(newReviewSchema), isPurchaseByTheUser, addReview);

reviewRouter.get("/:bookid", getReview);

export { reviewRouter };
