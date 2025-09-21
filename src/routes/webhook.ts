import express, { Router } from "express";

import { handlePayment } from "@/controllers/payment";

const webhookRouter = Router();

webhookRouter.post("/", express.raw({ type: "application/json" }), handlePayment);

export default webhookRouter;
