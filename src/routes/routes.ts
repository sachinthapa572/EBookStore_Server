import { Router } from "express";

import { authorRouter, authRouter, bookRotuer, reviewRouter } from "./";
import { quicker, roleGuard } from "@/utils";
import { ROLES } from "@/enum";
import { isAuth } from "@/middlewares";

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
