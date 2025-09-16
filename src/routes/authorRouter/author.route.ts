import { Router } from "express";

import { getAuthorDetails, registerAuthor } from "@/controllers/author/author.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { paramValidator, validator } from "@/middlewares/validator.middlewares";
import { uuidGSchema } from "@/validators";
import { newAuthorSchema } from "@/validators/author/author.validation";

const authorRouter = Router();

authorRouter.post("/register", isAuth, validator(newAuthorSchema), registerAuthor);

authorRouter.get("/:id", paramValidator(uuidGSchema("id")), getAuthorDetails);

export { authorRouter };
