import { Router } from "express";

import {
  checkBookOwnership,
  getOrderSuccessStatus,
  getOrders,
} from "@/controllers/order.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { paramValidator } from "@/middlewares/validator.middlewares";
import { uuidGSchema } from "@/validators";

const orderRoute = Router().use(isAuth);

orderRoute.get("/", getOrders);
orderRoute.get(
  "/check-status/:bookId",
  paramValidator(uuidGSchema("bookId")),
  checkBookOwnership
);
orderRoute.post(
  "/success/:sessionId",
  paramValidator(uuidGSchema("sessionId")),
  getOrderSuccessStatus
);

export default orderRoute;
