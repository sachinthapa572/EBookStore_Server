import { getAuthorDetails, registerAuthor } from "@/controllers";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { validater } from "@/middlewares/validator.middlewares";
import { newAuthorSchema } from "@/validators/author/author.validation";
import { Router } from "express";

const authorRouter = Router();

authorRouter.post("/register", isAuth, validater(newAuthorSchema), registerAuthor);

authorRouter.get("/:slug", getAuthorDetails);

export { authorRouter };
