import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express, type Request } from "express";
import helmet from "helmet";

import path from "node:path";
import { corsOptions, generateCsrfToken } from "@/constant";
import morganMiddleware from "@/logger/morgan.logger";
import { globalErrHandler, notFoundErr } from "@/middlewares/globalErrHandler.middleware";
import { isAuth, isValidReadingRequest } from "@/middlewares/isAuth.middleware";
import { refreshTokenMiddleware } from "@/middlewares/refreshToken.middleware";
import routes from "@/routes/routes";
import webhookRouter from "@/routes/webhook";

const app: Express = express();

// stripe webhook route
app.use("/webhook", webhookRouter);

// Global middlewares
app.use(
  morganMiddleware,
  cors(corsOptions),
  express.json({ limit: "16kb" }),
  express.urlencoded({ extended: true, limit: "16kb" }),
  cookieParser(),
  helmet(),
  refreshTokenMiddleware
);

// Serve static files
app.use("/public", express.static(path.join(path.resolve(__dirname, "../"), "../public")));
app.use(
  "/books",
  isAuth,
  isValidReadingRequest,
  express.static(path.join(path.resolve(__dirname, "../"), "../public"))
);

// Routes
app.use("/api/v1", routes);
app.use("/api/v1/csrf", (req: Request, res) => {
  const csrf = generateCsrfToken(req, res);
  res.json({ csrf });
});

// Error middleware
app.use(notFoundErr);
app.use(globalErrHandler);

export { app };
