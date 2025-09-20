import { Router } from "express";

import { checkout } from "@/controllers/checkout";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { paramValidator } from "@/middlewares/validator.middlewares";
import { uuidGSchema } from "@/validators";

const checkoutRoute = Router();

checkoutRoute.get("/:cartId", isAuth, paramValidator(uuidGSchema("cartId")), checkout);

export default checkoutRoute;
