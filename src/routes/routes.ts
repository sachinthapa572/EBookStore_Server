import { Router } from "express";
import { authorRouter } from "./AuthorRouter/author.route";
import { bookRotuer } from "./Book/book.route";
import { reviewRouter } from "./Reviews/review.router";
import { authRouter } from "./AuthRoute/auth.route";
import quicker from "@/utils/quicker";
import { ROLES } from "@/enum/_index";
import roleGuard from "@/utils/roleGuard";
import { isAuth } from "@/middlewares/isAuth.middleware";

const routes = Router();

routes.use("/auth", authRouter);
routes.use("/author", authorRouter);
routes.use("/book", bookRotuer);
routes.use("/review", reviewRouter);

// health check
routes.get("/health", isAuth, (req, res) => {
  roleGuard(req, ROLES.ADMIN);
  const healthData = {
    application: quicker.getApplicationHealth(),
    system: quicker.getSystemHealth(),
    timestamp: new Date().toLocaleString(),
  };
  res.status(200).json({ message: "Server is running ok", data: healthData });
});

export default routes;
