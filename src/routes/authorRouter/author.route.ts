import { Router } from "express";

import { getAuthorDetails, registerAuthor } from "@/controllers";
import { isAuth, validater } from "@/middlewares";
import { newAuthorSchema } from "@/validators";

const authorRouter = Router();

authorRouter.post("/register", isAuth, validater(newAuthorSchema), registerAuthor);

authorRouter.get("/:slug", getAuthorDetails);

export { authorRouter };
