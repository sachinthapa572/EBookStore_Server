import { Router } from "express";

import {
  createNewBook,
  getAllAvailableBooksController,
  getAllPurchaseData,
  getBookPublicsDetails,
  updateBookDetails,
} from "@/controllers";
import { fileParser } from "@/middlewares/file.middelware";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { isAuthor } from "@/middlewares/isAuthor.middleware";
import { validater } from "@/middlewares/validator.middlewares";

import { newBookSchema, updateBookSchema } from "@/validators/book/book.validation";

const bookRotuer = Router();

// bookRotuer.use(isAuth, isAuthor);

const validation = [isAuth, isAuthor];

bookRotuer.post("/create", validation, fileParser, validater(newBookSchema), createNewBook);
bookRotuer.patch("/", validation, fileParser, validater(updateBookSchema), updateBookDetails);
bookRotuer.get("/all", getAllAvailableBooksController);
bookRotuer.get("/Purchaselibrary", validation, getAllPurchaseData);
bookRotuer.get("/bookdetail/:bookslug", validation, getBookPublicsDetails);

export { bookRotuer };
