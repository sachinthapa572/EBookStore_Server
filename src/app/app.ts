import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express, Request } from "express";
import helmet from "helmet";
import path from "path";
import requestIp from "request-ip";

import { corsOptions, generateToken, limiter } from "@/constant";
import morganMiddleware from "@/logger/morgan.logger";
import { globalErrHandler, notFoundErr, refreshTokenMiddleware } from "@/middlewares";
import routes from "@/routes/routes";
import seedAuthorData from "@/seeds/author.seed";
import { getGeneratedCredentials, seedUsers } from "@/seeds/user.seeds";

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
app.use("/api/v1/csrf", (req: Request, res) => {
    const csrf = generateToken(req, res);
    res.json({ csrf });
});


// * Seeding
app.get("/api/v1/seed/generated-credentials", getGeneratedCredentials);
app.post("/api/v1/seed/user", seedUsers);
app.post("/api/v1/seed/author", seedAuthorData);

// Error middleware
app.use(notFoundErr);
app.use(globalErrHandler);

export { app };

