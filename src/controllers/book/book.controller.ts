import type { RequestHandler } from "express";

import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { asyncHandler, type CustomRequestHandler } from "@/utils/asyncHandler";

import { HttpStatusCode } from "@/constant";
import { bookService } from "@/services/book/book.service";
import type { UuidGType } from "@/validators";
import type { NewBookType, UpdateBookType } from "@/validators/book/book.validation";

const createNewBook: CustomRequestHandler<NewBookType> = asyncHandler(async (req, res) => {
  const { body, files, user } = req;
  const { cover, book } = files;

  if (!user?.authorId) {
    throw new ApiError(
      HttpStatusCode.InternalServerError,
      "Something went wrong, please try again later"
    );
  }

  const newBookResponse = await bookService.createBook(user.authorId, body, {
    cover: Array.isArray(cover) ? undefined : cover,
    book: Array.isArray(book) ? undefined : book,
  });

  res.status(201).json(new ApiResponse(201, { newBookResponse }, "Book created successfully"));
});

const updateBookDetails: CustomRequestHandler<UpdateBookType> = asyncHandler(
  async (req, res) => {
    const { body, files, user } = req;
    const { cover, book: newBookFile } = files;

    if (!user?.authorId) {
      throw new ApiError(HttpStatusCode.BadRequest, "Author ID is required");
    }

    const newBookResponse = await bookService.updateBook(user.authorId, body, {
      cover: Array.isArray(cover) ? undefined : cover,
      book: Array.isArray(newBookFile) ? undefined : newBookFile,
    });

    res
      .status(200)
      .json(new ApiResponse(200, { newBookResponse }, "Book updated successfully"));
  }
);

const getAllPurchasedBooks: RequestHandler = asyncHandler(async (req, res) => {
  const formattedBooks = await bookService.getPurchasedBooks(req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, formattedBooks, "Successfully retrieved purchased books"));
});

const getBookPublicsDetails: CustomRequestHandler<object, UuidGType<["slug"]>> = asyncHandler(
  async (req, res) => {
    const BookData = await bookService.getBookPublicDetails(req.params.slug);

    res
      .status(HttpStatusCode.OK)
      .json(
        new ApiResponse(
          HttpStatusCode.OK,
          { book: BookData },
          "Book details retrieved successfully"
        )
      );
  }
);

const getAllAvailableBooksController: RequestHandler<
  object,
  object,
  object,
  Partial<{
    author?: string;
    title?: string;
    language?: string;
    genre?: string;
    publicationName?: string;
    publishedAt?: string;
    price?: string;
    pageSize?: string;
    pageNumber?: string;
  }>
> = asyncHandler(async (req, res) => {
  const {
    author,
    title,
    language,
    genre,
    publicationName,
    publishedAt,
    price,
    pageSize,
    pageNumber,
  } = req.query;

  // Handle pagination
  const pagination = {
    pageSize: Number.parseInt(pageSize?.toString() || "10", 10),
    pageNumber: Number.parseInt(pageNumber?.toString() || "1", 10),
  };

  const result = await bookService.getAllAvailableBooks(
    { author, title, language, genre, publicationName, publishedAt, price },
    pagination
  );

  res.status(200).json(new ApiResponse(200, result, "Books retrieved successfully"));
});

const getBookPublicsByGenere: RequestHandler = asyncHandler(async (req, res) => {
  const books = await bookService.getBooksByGenre(req.params.genre);

  res
    .status(200)
    .json(new ApiResponse(HttpStatusCode.OK, { books }, "Books retrieved successfully"));
});

const generateBookAccessUrl: CustomRequestHandler<object, UuidGType<["slug"]>> = asyncHandler(
  async (req, res) => {
    const { slug } = req.params;

    const result = await bookService.generateBookAccessUrl(slug, req.user._id);

    res.status(200).json(new ApiResponse(200, result, "Book details fetched successfully"));
  }
);

export const getBookRecommendation: CustomRequestHandler<
  object,
  UuidGType<["bookId"]>
> = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const result = await bookService.getBookRecommendations(bookId);

  res
    .status(HttpStatusCode.OK)
    .json(new ApiResponse(HttpStatusCode.OK, result, "Books retrieved successfully"));
});

export const getFeaturedBooks: RequestHandler = asyncHandler((_req, res) => {
  const books = [
    {
      title: "Murder on the Orient Express",
      slogan: "Unravel the mystery, ride the Orient Express!",
      subtitle: "A thrilling journey through intrigue and deception.",
      cover:
        "https://ebook-public-data.s3.amazonaws.com/669e469bf094674648c4cac8-murder-on-the-orient-express.png",
      slug: "murder-on-the-orient-express-669e469bf094674648c4cac8",
    },
    {
      title: "To Kill a Mockingbird",
      slogan: "Discover courage in a small town.",
      subtitle: "A timeless tale of justice and compassion.",
      cover:
        "https://ebook-public-data.s3.amazonaws.com/669e469bf094674648c4cac9-to-kill-a-mockingbird.png",
      slug: "to-kill-a-mockingbird-669e469bf094674648c4cac9",
    },
    {
      title: "The Girl with the Dragon Tattoo",
      slogan: "Uncover secrets with the girl and her tattoo.",
      subtitle: "A gripping thriller of mystery and revenge.",
      cover:
        "https://ebook-public-data.s3.amazonaws.com/669e469bf094674648c4cad3-the-girl-with-the-dragon-tattoo.png",
      slug: "the-girl-with-the-dragon-tattoo-669e469bf094674648c4cad3",
    },
    {
      title: "The Hunger Games",
      slogan: "Survive the games, ignite the rebellion.",
      subtitle: "An epic adventure of survival and resilience.",
      cover:
        "https://ebook-public-data.s3.amazonaws.com/669e469bf094674648c4cad4-the-hunger-games.png",
      slug: "the-hunger-games-669e469bf094674648c4cad4",
    },
  ];

  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(
        HttpStatusCode.OK,
        { featuredBooks: books },
        "Featured books retrieved successfully"
      )
    );
});

export const deleteBook: CustomRequestHandler<object, UuidGType<["bookId"]>> = asyncHandler(
  async (req, res) => {
    const { bookId } = req.params;
    const { user } = req;

    if (!user?.authorId) {
      throw new ApiError(HttpStatusCode.BadRequest, "Author ID is required");
    }

    await bookService.deleteBook(bookId, user.authorId);

    res
      .status(HttpStatusCode.OK)
      .json(new ApiResponse(HttpStatusCode.OK, null, "Book deleted successfully"));
  }
);

export {
  createNewBook,
  getAllAvailableBooksController,
  getAllPurchasedBooks,
  getBookPublicsDetails,
  updateBookDetails,
  getBookPublicsByGenere,
  generateBookAccessUrl,
};
