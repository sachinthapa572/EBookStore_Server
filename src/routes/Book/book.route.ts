import { Router } from "express";

import {
  createNewBook,
  deleteBook,
  generateBookAccessUrl,
  getAllAvailableBooksController,
  getAllPurchasedBooks,
  getBookPublicsByGenere,
  getBookPublicsDetails,
  getBookRecommendation,
  getFeaturedBooks,
  updateBookDetails,
} from "@/controllers/book/book.controller";
import { searchBooks } from "@/controllers/search.controller";
import { fileParser } from "@/middlewares/file.middelware";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { isAuthor } from "@/middlewares/isAuthor.middleware";
import {
  paramValidator,
  queryValidator,
  validator,
} from "@/middlewares/validator.middlewares";
import { uuidGSchema } from "@/validators";
import {
  newBookSchema,
  searchBooksSchema,
  updateBookSchema,
} from "@/validators/book/book.validation";

const booksRoute = Router();

booksRoute.get("/all", getAllAvailableBooksController);
booksRoute.get("/featured", getFeaturedBooks);

// get the recommendation of the book

booksRoute.get(
  "/recommendation/:bookId",
  isAuth,
  paramValidator(uuidGSchema("bookId")),
  getBookRecommendation
);

// ! Authenticated routes
booksRoute.use(isAuth, isAuthor);

booksRoute.post("/create", fileParser, validator(newBookSchema), createNewBook);

booksRoute.patch("/", fileParser, validator(updateBookSchema), updateBookDetails);

booksRoute.get("/bookdetail/:id", paramValidator(uuidGSchema("id")), getBookPublicsDetails);

// get all the purchased book by the user

booksRoute.get("/list", getAllPurchasedBooks);

// get the details of the book

booksRoute.get("/details/:slug", paramValidator(uuidGSchema("slug")), getBookPublicsDetails);

// get the book by the genera

booksRoute.get(
  "/by-genere/:genere",
  paramValidator(uuidGSchema("genere")),
  getBookPublicsByGenere
);

// get the access to the book
booksRoute.get("/access/:slug", paramValidator(uuidGSchema("slug")), generateBookAccessUrl);

// delete the book

booksRoute.delete("/:bookId", paramValidator(uuidGSchema("bookId")), isAuthor, deleteBook);

booksRoute.get("/search/books", queryValidator(searchBooksSchema), searchBooks);

export default booksRoute;
