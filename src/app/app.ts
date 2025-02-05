import express, { Express } from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import requestIp from "request-ip";
import cors from "cors";
import path from "path";

import routes from "@/routes/routes";
import { globalErrHandler, notFoundErr, refreshTokenMiddleware } from "@/middlewares";
import { corsOptions, limiter } from "@/constant";
import morganMiddleware from "@/logger/morgan.logger";

const app: Express = express();

// Global middlewares
app.use(
  morganMiddleware,
  cors(corsOptions),
  requestIp.mw(),
  limiter,
  express.json({ limit: "16kb" }),
  express.urlencoded({ extended: true, limit: "16kb" }),
  cookieParser(),
  helmet(),
  refreshTokenMiddleware
);

// Serve static files
app.use("/public", express.static(path.join(path.resolve(__dirname, "../"), "../public")));

// Routes
app.use("/api/v1", routes);

// Error middleware
app.use(notFoundErr, globalErrHandler);

export { app };
