import { Router } from "express";

import { getAuthorDetails, registerAuthor } from "@/controllers/author/author.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { validator } from "@/middlewares/validator.middlewares";
import { newAuthorSchema } from "@/validators/author/author.validation";

const authorRoute = Router();

authorRoute.post("/register", isAuth, validator(newAuthorSchema), registerAuthor);

authorRoute.get("/:id", getAuthorDetails);

export default authorRoute;
