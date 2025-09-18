import { Router } from "express";

import {
  getAuthorDetails,
  getBooksDetails,
  registerAuthor,
  updateAuthorInfo,
} from "@/controllers/author/author.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { isAuthor } from "@/middlewares/isAuthor.middleware";
import { paramValidator, validator } from "@/middlewares/validator.middlewares";
import { uuidGSchema } from "@/validators";
import { newAuthorSchema } from "@/validators/author/author.validation";

const authorRoute = Router();

authorRoute.post("/register", isAuth, validator(newAuthorSchema), registerAuthor);

authorRoute.patch("/", isAuth, isAuthor, validator(newAuthorSchema), updateAuthorInfo);

authorRoute.get(
  "/books/:authorId",
  paramValidator(uuidGSchema("authorId")),
  isAuth,
  getBooksDetails
);

authorRoute.get("/:id", getAuthorDetails);

export default authorRoute;
