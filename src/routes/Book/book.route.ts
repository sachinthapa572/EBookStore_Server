import { Router } from "express";

import {
  createNewBook,
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

bookRotuer.use(isAuth, isAuthor);

bookRotuer.post("/create", fileParser, validater(newBookSchema), createNewBook);
bookRotuer.patch("/", fileParser, validater(updateBookSchema), updateBookDetails);
bookRotuer.get("/Purchaselibrary", getAllPurchaseData);
bookRotuer.get("/bookdetail/:bookslug", getBookPublicsDetails);

export { bookRotuer };
