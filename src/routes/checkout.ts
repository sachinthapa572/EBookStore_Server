import { Router } from "express";

import { checkout, instantCheckout } from "@/controllers/checkout.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { paramValidator } from "@/middlewares/validator.middlewares";
import { uuidGSchema } from "@/validators";

const checkoutRoute = Router();

checkoutRoute.get("/:cartId", isAuth, paramValidator(uuidGSchema("cartId")), checkout);
checkoutRoute.post("/instant", isAuth, instantCheckout);

export default checkoutRoute;
