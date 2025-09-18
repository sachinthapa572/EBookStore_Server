import { Router } from "express";

import { clearCart, getCart, updateCart } from "@/controllers/cart/cart.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { validator } from "@/middlewares/validator.middlewares";
import { cartItemsSchema } from "@/validators/cart/cart.validation";

const cartRoute = Router().use(isAuth);

cartRoute.post("/", validator(cartItemsSchema), updateCart);

cartRoute.get("/", getCart);
cartRoute.post("/clear", clearCart);

export default cartRoute;
