import { Router } from "express";
import authRouter from "./AuthRoute/auth.route";

const routes = Router();

routes.use("/auth", authRouter);

export default routes;
