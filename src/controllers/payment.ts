import type { RequestHandler } from "express";
import type Stripe from "stripe";

import { stripe } from "./checkout";
import { appEnv } from "@/config/env";
import logger from "@/logger/winston.logger";

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
  } catch (err) {
    logger.error("⚠️  Webhook signature verification failed.", err);
    return;
  }
  console.log("🚀 ~ handlePayment ~ event:", event);
};
