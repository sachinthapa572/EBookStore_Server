import type { RequestHandler } from "express";
import slugify from "slugify";

import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { asyncHandler, type CustomRequestHandler } from "@/utils/asyncHandler";
import {
  deleteFileFromLocalDir,
  uploadBookTolocalDir,
  uploadImageTolocalDir,
} from "@/utils/fileUpload";
import { formatFileSize } from "@/utils/helper";

import type { BookDetails, QuerFilterOptions } from "./book.type";
import path from "node:path";
import { HttpStatusCode } from "@/constant";
import logger from "@/logger/winston.logger";
import { AuthorModel } from "@/model/author/author.model";
import { type BookDoc, BookModel } from "@/model/Book/book.model";
import { UserModel } from "@/model/user/user.model";
import type { PopulatedBook } from "@/types";
import type { NewBookType, UpdateBookType } from "@/validators/book/book.validation";

// Helper function to build query filters
const buildQueryFilters = (params: Record<string, string | undefined>) => {
  const query: Record<string, unknown> = {};

  const filterConfigs = [
    { field: "author", value: params.author, type: "direct" as const },
    { field: "title", value: params.title, type: "regex" as const },
    { field: "language", value: params.language, type: "array" as const },
    { field: "genre", value: params.genre, type: "array" as const },
    { field: "publicationName", value: params.publicationName, type: "array" as const },
  ];

  for (const config of filterConfigs) {
    if (config.value) {
      switch (config.type) {
        case "direct":
          query[config.field] = config.value;
          break;
        case "regex":
          query[config.field] = { $regex: config.value, $options: "i" };
          break;
        case "array":
          query[config.field] = { $in: config.value.split(",") };
          break;
        default:
          // This should never happen with our type constraints
          break;
      }
    }
  }

  return query;
};

const createNewBook: CustomRequestHandler<NewBookType> = asyncHandler(async (req, res) => {
  const { body, files, user } = req;
  const {
    title,
    description,
    price,
    fileInfo,
    genre,
    language,
    publicationName,
    publishedAt,
  } = body;
  const { cover, book } = files;

  // Validate book file
  if (!book || Array.isArray(book) || book.mimetype !== "application/epub+zip") {
    throw new ApiError(400, "Invalid book File");
  }
  if (user?.authorId) {
    // Create new book
    const newBook = new BookModel<BookDoc>({
      title,
      description,
      price,
      fileInfo: { id: "", size: formatFileSize(fileInfo.size) },
      genre,
      language,
      publicationName,
      publishedAt,
      author: user.authorId,
      slug: slugify(`${title} ${user.authorId}`, {
        lower: true,
        replacement: "-",
      }),
    });

    if (!Array.isArray(cover) && cover?.originalFilename) {
      // Upload cover image
      newBook.cover = await uploadImageTolocalDir(
        cover,
        newBook.slug,
        cover.originalFilename?.split(".")[1] || "jpg"
      );
    }

    // Upload book file
    const uniqueFileName = slugify(`${newBook._id}${newBook.title}.epub`, {
      lower: true,
      replacement: "-",
    });
    await uploadBookTolocalDir(book, uniqueFileName);
    newBook.fileInfo.id = uniqueFileName;

    // Update author's books
    await AuthorModel.findByIdAndUpdate(user.authorId, {
      $addToSet: { books: newBook._id },
    });

    // Save new book
    const books = (await newBook.save()).toObject();

    const newBookResponse = {
      ...books,
      fileInfo: {
        ...books.fileInfo,
        id: `http://localhost:3000/public/books/${books.fileInfo.id}`,
      },
    };
    logger.info(`Book "${newBookResponse.title}" created successfully`);
    res
      .status(201)
      .json(new ApiResponse(201, { newBookResponse }, "Book created successfully"));
  } else {
    throw new ApiError(
      HttpStatusCode.InternalServerError,
      "Something Went wrong , please try again later"
    );
  }
});

const updateBookDetails: CustomRequestHandler<UpdateBookType> = asyncHandler(
  async (req, res) => {
    const { body, files, user } = req;
    const { title, description, price, genre, language, publicationName, publishedAt, slug } =
      body;
    const { cover, book: newBookFile } = files;

    // Find the book
    const book = await BookModel.findOne({ slug, author: user.authorId });
    if (!book) {
      throw new ApiError(404, "Book not found");
    }

    // Update book details
    if (title && title !== book.title) {
      book.slug = slugify(`${title} ${book._id}`, {
        lower: true,
        replacement: "-",
      });
    }
    Object.assign(book, {
      title,
      description,
      language,
      publicationName,
      genre,
      publishedAt,
      price,
    });

    // Update cover image
    if (cover && !Array.isArray(cover) && cover.mimetype?.startsWith("image")) {
      const oldBookFilePath = book.cover
        ? path.resolve(__dirname, "../../../public/photos", book.cover.id)
        : "";
      deleteFileFromLocalDir(oldBookFilePath);
      book.cover = await uploadImageTolocalDir(
        cover,
        book.slug,
        cover.originalFilename?.split(".")[1] || "jpg"
      );
    }

    // Update book file
    if (
      newBookFile &&
      !Array.isArray(newBookFile) &&
      newBookFile.mimetype === "application/epub+zip"
    ) {
      const oldBookFilePath = path.resolve(
        __dirname,
        "../../../public/books",
        book.fileInfo.id
      );
      deleteFileFromLocalDir(oldBookFilePath);
      const uniqueFileName = slugify(`${book._id}${book.title}.epub`, {
        lower: true,
        replacement: "-",
      });
      await uploadBookTolocalDir(newBookFile, uniqueFileName);
      book.fileInfo.id = uniqueFileName;
      book.fileInfo.size = formatFileSize(newBookFile.size);
    }

    // Save updated book
    const updatedBook = await book.save();
    const bookObject = updatedBook.toObject();
    const newBookResponse = {
      ...bookObject,
      fileInfo: {
        ...bookObject.fileInfo,
        id: `http://localhost:3000/public/books/${bookObject.fileInfo.id}`,
      },
    };
    logger.info(`Book "${newBookResponse.title}" updated successfully`);
    res
      .status(200)
      .json(new ApiResponse(200, { newBookResponse }, "Book updated successfully"));
  }
);

const getAllPurchaseData: RequestHandler = asyncHandler(async (req, res) => {
  const purchasedBooks = await UserModel.findById(req.user._id).populate<{
    books: PopulatedBook[];
  }>({
    path: "books",
    select: "author title cover slug",
    populate: { path: "author", select: "slug name" },
  });

  const formattedBooks = purchasedBooks?.books.map((book) => ({
    id: book._id,
    title: book.title,
    slug: book.slug,
    cover: book.cover.url,
    author: { name: book.author.slug, slug: book.author.name },
  }));

  res
    .status(200)
    .json(
      new ApiResponse(200, formattedBooks || [], "Successfully retrieved purchased books")
    );
});

const getBookPublicsDetails: RequestHandler<{
  id: string;
}> = asyncHandler(async (req, res) => {
  const bookDetails = await BookModel.findById(req.params.id)
    .populate({
      path: "author",
      select: "name slug _id",
    })
    .lean<BookDetails>();

  if (!bookDetails) {
    throw new ApiError(404, "Book not found");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        bookDetails,
      },
      "Book details retrieved successfully"
    )
  );
});

const getAllAvailableBooksController: RequestHandler<
  object,
  object,
  object,
  Partial<QuerFilterOptions>
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
  const skip = (pagination.pageNumber - 1) * pagination.pageSize;

  // Build the query object using helper function
  const query = buildQueryFilters({ author, title, language, genre, publicationName });

  if (publishedAt) {
    const date = new Date(publishedAt);
    if (!Number.isNaN(date.getTime())) {
      query.publishedAt = date;
    }
  }

  if (price) {
    const [minPrice, maxPrice] = price.split("-").map(Number);
    if (!(Number.isNaN(minPrice) || Number.isNaN(maxPrice))) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    }
  }

  // Fetch data from database
  const [books, totalCount] = await Promise.all([
    BookModel.find(query).skip(skip).limit(pagination.pageSize),
    BookModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pagination.pageSize);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        books,
        pagination: {
          pageSize: pagination.pageSize,
          pageNumber: pagination.pageNumber,
          totalCount,
          totalPages,
          skip,
        },
      },
      "Books retrieved successfully"
    )
  );
});

export {
  createNewBook,
  getAllAvailableBooksController,
  getAllPurchaseData,
  getBookPublicsDetails,
  updateBookDetails,
};
