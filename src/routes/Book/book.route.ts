import { createNewBook, updateBookDetails } from "@/controllers";
import { fileParser } from "@/middlewares/file.middelware";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { isAuthor } from "@/middlewares/isAuthor.middleware";
import { validater } from "@/middlewares/validator.middlewares";
import { newBookSchema, updateBookSchema } from "@/validators/book/book.validation";
import { Router } from "express";

const bookRotuer = Router();

bookRotuer.use(isAuth, isAuthor);

bookRotuer.post("/create", fileParser, validater(newBookSchema), createNewBook);
bookRotuer.patch("/", fileParser, validater(updateBookSchema), updateBookDetails);

export { bookRotuer };
