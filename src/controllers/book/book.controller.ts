import path from "path";
import slugify from "slugify";

import { AuthorModel, BookDoc, BookModel, UserModel } from "@/model";
import { customReqHandler, newBookBody, PopulatedBook, updateBookType } from "@/types";
import {
  ApiError,
  ApiResponse,
  asyncHandler,
  deleteFileFromLocalDir,
  formatFileSize,
  uploadBookTolocalDir,
  uploadImageTolocalDir,
} from "@/utils";
import logger from "@/utils/logger";
import { RequestHandler } from "express";
import { BookDetails, QuerFilterOptions } from "./BookControlle.type";

const createNewBook: customReqHandler<newBookBody> = asyncHandler(async (req, res) => {
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

  console.log(user.authorId, "user author id");

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
    author: user.authorId!,
    slug: slugify(`${title} ${user.authorId}`, { lower: true, replacement: "-" }),
  });

  // Upload cover image
  if (cover && !Array.isArray(cover)) {
    newBook.cover = await uploadImageTolocalDir(
      cover,
      newBook.slug,
      cover.originalFilename?.split(".")[1]!
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
  await AuthorModel.findByIdAndUpdate(user.authorId, { $addToSet: { books: newBook._id } });

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
  res.status(201).json(new ApiResponse(201, { newBookResponse }, "Book created successfully"));
});

const updateBookDetails: customReqHandler<updateBookType> = asyncHandler(async (req, res) => {
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
    book.slug = slugify(`${title} ${book._id}`, { lower: true, replacement: "-" });
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
      ? path.resolve(__dirname, `../../../public/photos`, book.cover.id)
      : "";
    deleteFileFromLocalDir(oldBookFilePath);
    book.cover = await uploadImageTolocalDir(
      cover,
      book.slug,
      cover.originalFilename?.split(".")[1]!
    );
  }

  // Update book file
  if (
    newBookFile &&
    !Array.isArray(newBookFile) &&
    newBookFile.mimetype === "application/epub+zip"
  ) {
    const oldBookFilePath = path.resolve(__dirname, `../../../public/books`, book.fileInfo.id);
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
  res.status(200).json(new ApiResponse(200, { newBookResponse }, "Book updated successfully"));
});

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
  {},
  {},
  {},
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
    pageSize: parseInt(pageSize?.toString() || "10"),
    pageNumber: parseInt(pageNumber?.toString() || "1"),
  };
  const skip = (pagination.pageNumber - 1) * pagination.pageSize;

  // Build the query object dynamically
  const query: Record<string, any> = {};

  if (author) query.author = author;
  if (title) query.title = { $regex: title, $options: "i" };
  if (language) query.language = { $in: language.split(",") };
  if (genre) query.genre = { $in: genre.split(",") };
  if (publicationName) query.publicationName = { $in: publicationName.split(",") };

  if (publishedAt) {
    const date = new Date(publishedAt);
    if (!isNaN(date.getTime())) {
      query.publishedAt = date;
    }
  }

  if (price) {
    const [minPrice, maxPrice] = price.split("-").map(Number);
    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
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
