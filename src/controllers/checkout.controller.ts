import Stripe from "stripe";

import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { asyncHandler, type CustomRequestHandler } from "@/utils/asyncHandler";
import logger from "@/utils/logger";

import { appEnv } from "@/config/env";
import { HttpStatusCode } from "@/constant";
import type { BookDoc } from "@/model/Book/book.model";
import CartModel from "@/model/cart/cart.model";
import { OrderModel } from "@/model/order/order.model";
import type { UuidGType } from "@/validators";

export const stripe = new Stripe(appEnv.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

export const checkout: CustomRequestHandler<object, UuidGType<["cartId"]>> = asyncHandler(
  async (req, res) => {
    const { cartId } = req.params;

    const cart = await CartModel.findById({
      _id: cartId,
      user: req.user._id,
    }).populate<{
      items: { product: BookDoc; quantity: number }[];
    }>({
      path: "items.product",
    });

    if (!cart) {
      throw new ApiError(HttpStatusCode.NotFound, "Cart not found");
    }

    const newOrder = await OrderModel.create({
      userId: req.user._id,
      orderItems: cart.items.map(({ product, quantity }) => {
        return {
          id: product._id,
          price: product.price.sale,
          qty: quantity,
          totalPrice: product.price.sale * quantity,
        };
      }),
    });

    let customer: Stripe.Customer;
    try {
      customer = await stripe.customers.create({
        name: req.user.username,
        email: req.user.email,
        metadata: {
          userId: req.user._id.toString(),
          orderId: newOrder._id.toString(),
          type: "checkout",
        },
      });
    } catch (e) {
      if (e instanceof Stripe.errors.StripeError) {
        logger.error(`Stripe error: ${req.user._id}`, e);
        throw new ApiError(HttpStatusCode.InternalServerError, e.message);
      }
      throw new ApiError(
        HttpStatusCode.InternalServerError,
        "Failed to create Stripe customer"
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: appEnv.PAYMENT_SUCCESS_URL,
      cancel_url: appEnv.PAYMENT_CANCEL_URL,
      line_items: cart.items.map(({ product, quantity }) => {
        // const images = product.cover ? { images: [sanitizeUrl(product.cover.url)] } : {};
        return {
          quantity,
          price_data: {
            currency: "usd",
            unit_amount: product.price.sale,
            product_data: {
              name: product.title,
              //   ...images,
            },
          },
        };
      }),
      customer: customer.id,
    });

    if (session.url) {
      res
        .status(HttpStatusCode.OK)
        .json(
          new ApiResponse(HttpStatusCode.OK, { url: session.url }, "Checkout session created")
        );
    } else {
      throw new ApiError(
        HttpStatusCode.InternalServerError,
        "Failed to create checkout session"
      );
    }
  }
);

export const sanitizeUrl = (url: string) => {
  return url.replace(/ /g, "%20");
};
