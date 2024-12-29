import { Router } from "express";
import authRouter from "./AuthRoute/auth.route";
import authorRouter from "./authorRouter/author.route";
import bookRotuer from "./Book/book.route";

const routes = Router();

routes.use("/auth", authRouter);
routes.use("/author", authorRouter);
routes.use("/book", bookRotuer);

// health check
routes.get("/health", (_req, res) => {
  res.status(200).json({ message: "Server is running" });
});

export default routes;
