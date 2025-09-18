import { Router } from "express";

import { quicker } from "@/utils/quicker";
import { roleGuard } from "@/utils/roleGuard";

import authRoute from "./AuthRoute/auth.route";
import authorRoute from "./authorRouter/author.route";
import booksRoute from "./Book/book.route";
import historyRoute from "./history/history.route";
import reviewRoute from "./Reviews/review.router";
import { doubleCsrfProtection, HttpStatusCode } from "@/constant";
import { ROLES } from "@/enum/role.enum";
import { isAuth } from "@/middlewares/isAuth.middleware";

const routes = Router();

routes.use("/auth", authRoute);
routes.use("/author", authorRoute);
routes.use("/book", booksRoute);
routes.use("/review", reviewRoute);
routes.use("/history", historyRoute);

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
