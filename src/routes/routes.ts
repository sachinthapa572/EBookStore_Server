import { Router } from "express";
import authRouter from "./AuthRoute/auth.route";
import authorRouter from "./authorRouter/author.route";

const routes = Router();

routes.use("/auth", authRouter);
routes.use("/author", authorRouter);

export default routes;
