import { Router } from "express";

import {
  createNewBook,
  getAllAvailableBooksController,
  getAllPurchaseData,
  getBookPublicsDetails,
  updateBookDetails,
} from "@/controllers/book/book.controller";
import { fileParser } from "@/middlewares/file.middelware";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { isAuthor } from "@/middlewares/isAuthor.middleware";
import { paramValidator, validator } from "@/middlewares/validator.middlewares";
import { uuidGSchema } from "@/validators";
import { newBookSchema, updateBookSchema } from "@/validators/book/book.validation";

const booksRoute = Router();

booksRoute.get("/all", getAllAvailableBooksController);

// ! Authenticated routes
booksRoute.use(isAuth, isAuthor);
booksRoute.post("/create", fileParser, validator(newBookSchema), createNewBook);
booksRoute.patch("/", fileParser, validator(updateBookSchema), updateBookDetails);
booksRoute.get("/purchase-library", getAllPurchaseData);
booksRoute.get("/bookdetail/:id", paramValidator(uuidGSchema("id")), getBookPublicsDetails);

export default booksRoute;
