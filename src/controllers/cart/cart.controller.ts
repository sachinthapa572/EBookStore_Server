import type { RequestHandler } from "express";

import { ApiResponse } from "@/utils/ApiResponse";
import { asyncHandler, type CustomRequestHandler } from "@/utils/asyncHandler";

import { HttpStatusCode } from "@/constant";
import { cartService } from "@/services/cart/cart.service";
import type { NewCartItemType } from "@/validators/cart/cart.validation";

export const updateCart: CustomRequestHandler<NewCartItemType> = asyncHandler(
  async (req, res) => {
    const result = await cartService.updateCart(req.user._id, req.body);

    res
      .status(HttpStatusCode.OK)
      .json(new ApiResponse(HttpStatusCode.OK, result, "Cart updated successfully"));
  }
);

export const getCart: RequestHandler = asyncHandler(async (req, res) => {
  const cartResponse = await cartService.getUserCart(req.user._id);

  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        { cart: cartResponse },
        "Cart data fetched successfully"
      )
    );
});

export const clearCart: RequestHandler = asyncHandler(async (req, res) => {
  await cartService.clearUserCart(req.user._id);

  res
    .status(HttpStatusCode.OK)
    .json(new ApiResponse(HttpStatusCode.OK, {}, "Cart data cleared successfully"));
});
