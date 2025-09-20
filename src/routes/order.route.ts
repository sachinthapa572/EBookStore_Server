import { Router } from "express";

import {
  getOrderStatus,
  getOrderSuccessStatus,
  getOrders,
} from "@/controllers/order.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { paramValidator } from "@/middlewares/validator.middlewares";
import { uuidGSchema } from "@/validators";

const orderRoute = Router().use(isAuth);

orderRoute.get("/", getOrders);
orderRoute.get("/check-status/:bookId", paramValidator(uuidGSchema("bookId")), getOrderStatus);
orderRoute.post(
  "/success/:sessionId",
  paramValidator(uuidGSchema("sessionId")),
  getOrderSuccessStatus
);

export default orderRoute;
