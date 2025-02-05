import { Router } from "express";

import {
  createNewBook,
  getAllAvailableBooksController,
  getAllPurchaseData,
  getBookPublicsDetails,
  updateBookDetails,
} from "@/controllers";
import { fileParser, isAuth, isAuthor, validater } from "@/middlewares";
import { newBookSchema, updateBookSchema } from "@/validators";

const bookRotuer = Router();

// bookRotuer.use(isAuth, isAuthor);

const validation = [isAuth, isAuthor];

bookRotuer.post("/create", validation, fileParser, validater(newBookSchema), createNewBook);
bookRotuer.patch("/", validation, fileParser, validater(updateBookSchema), updateBookDetails);
bookRotuer.get("/all", getAllAvailableBooksController);
bookRotuer.get("/Purchaselibrary", validation, getAllPurchaseData);
bookRotuer.get("/bookdetail/:bookslug", validation, getBookPublicsDetails);

export { bookRotuer };
