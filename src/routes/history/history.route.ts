import { Router } from "express";

import { getBookHistory, updateBookHistory } from "@/controllers/history/history.controller";
import { isAuth, isPurchaseByTheUser } from "@/middlewares/isAuth.middleware";
import { paramValidator, validator } from "@/middlewares/validator.middlewares";
import { uuidGSchema } from "@/validators";
import { historyValidationSchema } from "@/validators/history/history.validation";

const historyRoute = Router().use(isAuth);

historyRoute.get("/:bookId", paramValidator(uuidGSchema("bookId")), getBookHistory);

historyRoute.post(
  "/",
  validator(historyValidationSchema),
  isPurchaseByTheUser,
  updateBookHistory
);

export default historyRoute;
