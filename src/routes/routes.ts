import { Router } from "express";

import { quicker } from "@/utils/quicker";
import { roleGuard } from "@/utils/roleGuard";

import { authRouter } from "./AuthRoute/auth.route";
import { authorRouter } from "./authorRouter/author.route";
import booksRoute from "./Book/book.route";
import { reviewRouter } from "./Reviews/review.router";
import { doubleCsrfProtection, HttpStatusCode } from "@/constant";
import { ROLES } from "@/enum/role.enum";
import { isAuth } from "@/middlewares/isAuth.middleware";

const routes = Router();

routes.use("/auth", authRouter);
routes.use("/author", authorRouter);
routes.use("/book", booksRoute);
routes.use("/review", reviewRouter);

// health check
routes.get("/health", isAuth, doubleCsrfProtection, (req, res) => {
  roleGuard(req, ROLES.ADMIN);
  const healthData = {
    application: quicker.getApplicationHealth(),
    system: quicker.getSystemHealth(),
    timestamp: new Date().toLocaleString(),
  };
  res
    .status(HttpStatusCode.InternalServerError)
    .json({ message: "Server is running ok", data: healthData });
});

export default routes;
