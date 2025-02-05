import { Router } from "express";

import { addReview, getReview } from "@/controllers";
import { isAuth, isPurchaseByTheUser, validater } from "@/middlewares";
import { newReviewSchema } from "@/validators";

const reviewRouter = Router();

reviewRouter.post("/", isAuth, validater(newReviewSchema), isPurchaseByTheUser, addReview);

reviewRouter.get("/:bookid", getReview);

export { reviewRouter };
