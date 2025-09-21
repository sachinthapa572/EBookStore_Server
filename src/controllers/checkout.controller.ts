import Stripe from "stripe";

import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { asyncHandler, type CustomRequestHandler } from "@/utils/asyncHandler";
import logger from "@/utils/logger";

import { appEnv } from "@/config/env";
import { HttpStatusCode } from "@/constant";
import { type BookDoc, BookModel } from "@/model/Book/book.model";
import CartModel from "@/model/cart/cart.model";
import { OrderModel } from "@/model/order/order.model";
import type { UuidGType } from "@/validators";

export const stripe = new Stripe(appEnv.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

type StripeLineItems = Stripe.Checkout.SessionCreateParams.LineItem[];

type Toptions = {
  customer: Stripe.CustomerCreateParams;
  line_items: StripeLineItems;
};

const generateStripeCheckoutSession = async (options: Toptions) => {
  const customer = await stripe.customers.create(options.customer);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    success_url: process.env.PAYMENT_SUCCESS_URL,
    cancel_url: process.env.PAYMENT_CANCEL_URL,
    line_items: options.line_items,
    customer: customer.id,
  });

  return session;
};

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

    const hasInvalidItems = cart.items.some(
      (cartItem) => cartItem.product.status === "unpublished"
    );

    if (hasInvalidItems) {
      throw new ApiError(
        HttpStatusCode.Forbidden,
        "One or more items in your cart are no longer available for purchase."
      );
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

    try {
      const customer = {
        name: req.user.username,
        email: req.user.email,
        metadata: {
          userId: req.user._id.toString(),
          orderId: newOrder._id.toString(),
          type: "checkout",
        },
      };

      const line_items = cart.items.map(({ product, quantity }) => {
        // const images = product.cover ? { images: [sanitizeUrl(product.cover.url)] } : {};
        return {
          quantity,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(product.price.sale * 100),
            product_data: {
              name: product.title,
              //   ...images,
            },
          },
        };
      });

      const session = await generateStripeCheckoutSession({ customer, line_items });

      if (session.url) {
        res
          .status(HttpStatusCode.OK)
          .json(
            new ApiResponse(
              HttpStatusCode.OK,
              { url: session.url },
              "Checkout session created"
            )
          );
      } else {
        throw new ApiError(
          HttpStatusCode.InternalServerError,
          "Failed to create checkout session"
        );
      }
    } catch (e) {
      if (e instanceof Stripe.errors.StripeError) {
        logger.error(`Stripe error: ${req.user._id}`, e);
        throw new ApiError(HttpStatusCode.InternalServerError, "Stripe service error");
      }
      throw new ApiError(
        HttpStatusCode.InternalServerError,
        "Failed to create Stripe customer"
      );
    }
  }
);

export const sanitizeUrl = (url: string) => {
  return url.replace(/ /g, "%20");
};

export const instantCheckout: CustomRequestHandler<{
  productId: string;
}> = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const product = await BookModel.findById(productId);

  if (!product) {
    throw new ApiError(HttpStatusCode.NotFound, "Product not found!");
  }

  if (product.status === "unpublished") {
    throw new ApiError(HttpStatusCode.Forbidden, "Sorry this book is no longer for sale!");
  }

  const newOrder = await OrderModel.create({
    userId: req.user._id,
    orderItems: [
      {
        id: product._id,
        price: product.price.sale,
        qty: 1,
        totalPrice: product.price.sale,
      },
    ],
  });

  const customer = {
    name: req.user.username,
    email: req.user.email,
    metadata: {
      userId: req.user._id.toString(),
      type: "instant-checkout",
      orderId: newOrder._id.toString(),
    },
  };

  const images = product.cover ? { images: [sanitizeUrl(product.cover.url)] } : {};

  const line_items: StripeLineItems = [
    {
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(product.price.sale * 100),
        product_data: {
          name: product.title,
          ...images,
        },
      },
    },
  ];

  try {
    const session = await generateStripeCheckoutSession({ customer, line_items });

    if (session.url) {
      res
        .status(HttpStatusCode.OK)
        .json(
          new ApiResponse(
            HttpStatusCode.OK,
            { checkoutUrl: session.url },
            "Checkout session created"
          )
        );
    } else {
      throw new ApiError(
        HttpStatusCode.InternalServerError,
        "Failed to create checkout session"
      );
    }
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      logger.error(`Stripe error during instant checkout: ${req.user._id}`, error);
      throw new ApiError(HttpStatusCode.InternalServerError, "Stripe service error");
    }

    logger.error(`Error during instant checkout: ${req.user._id}`, error);
    throw new ApiError(
      HttpStatusCode.InternalServerError,
      "Failed to create checkout session"
    );
  }
});
