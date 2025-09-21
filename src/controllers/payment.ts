import type { RequestHandler } from "express";
import type Stripe from "stripe";

import { stripe } from "./checkout.controller";
import { appEnv } from "@/config/env";
import logger from "@/logger/winston.logger";
import { OrderModel } from "@/model/order/order.model";
import { UserModel } from "@/model/user/user.model";
import type { StripeCustomer, StripeFailedIntent, StripeSuccessIntent } from "@/types/stripe";

export const handlePayment: RequestHandler = async (req, _res) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    logger.warn("⚠️ No signature found in request");
    return;
  }

  let event: Stripe.Event;

  try {
    event = (await stripe.webhooks.constructEventAsync(
      req.body,
      sig,
      appEnv.STRIPE_WEBHOOK_SECRET
    )) as Stripe.Event;

    const succeed = event.type === "payment_intent.succeeded";
    const failed = event.type === "payment_intent.payment_failed";

    if (succeed || failed) {
      const stripeSession = event.data.object as unknown as
        | StripeSuccessIntent
        | StripeFailedIntent;
      const customerId = stripeSession.customer;

      const customer = (await stripe.customers.retrieve(
        customerId
      )) as unknown as StripeCustomer;

      const { orderId, type, userId } = customer.metadata;

      const order = await OrderModel.findByIdAndUpdate(
        orderId,
        {
          stripeCustomerId: customerId,
          paymentId: stripeSession.id,
          totalAmount: stripeSession.amount_received,
          paymentStatus: stripeSession.status,
          paymentErrorMessage: stripeSession.last_payment_error?.message,
        },
        { new: true }
      );

      if (!order) {
        logger.error("Order not found for update", { orderId });
        return;
      }

      const bookIds =
        order?.orderItems.map((item) => {
          return item.id.toString();
        }) || [];

      if (succeed && order) {
        // insert the each of the order in the user's books array
        await UserModel.findByIdAndUpdate(userId, {
          $push: { books: { $each: bookIds }, orders: { $each: [order._id] } },
        });

        // clear the cart then

        if (type === "checkout") {
          // await CartModel.findOneAndUpdate({ userId }, { items: [] });
        }
      }
    }
  } catch (err) {
    logger.error("⚠️  Webhook signature verification failed.", err);
    return;
  }

  logger.info(`✅  Webhook processed: ${event.id}`);
  return;
};
