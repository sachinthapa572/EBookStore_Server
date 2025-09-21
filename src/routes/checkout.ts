import { Router } from "express";

import { checkout, instantCheckout } from "@/controllers/checkout.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { paramValidator, validator } from "@/middlewares/validator.middlewares";
import { uuidGSchema } from "@/validators";
import { instantCheckoutSchema } from "@/validators/checkout/checkout.validation";

const checkoutRoute = Router();

checkoutRoute.get("/:cartId", isAuth, paramValidator(uuidGSchema("cartId")), checkout);
checkoutRoute.post("/instant", isAuth, validator(instantCheckoutSchema), instantCheckout);

export default checkoutRoute;
