import slugify from "slugify";
import BookModel, { BookDoc } from "@/model/Book/book.model";
import { customReqHandler, newBookBody, PopulatedBook, updateBookType } from "@/types";
import ApiError from "@/utils/ApiError";
import { asyncHandler } from "@/utils/asyncHandler";
import {
  deleteFileFromLocalDir,
  uploadImageTolocalDir,
  uploadBookTolocalDir,
} from "@/utils/fileUpload";
import { formatFileSize } from "@/utils/helper";
import AuthorModel from "@/model/author/author.model";
import ApiResponse from "@/utils/ApiResponse";
import logger from "@/logger/winston.logger";
import path from "path";
import { RequestHandler } from "express";
import UserModel from "@/model/user/user.model";

interface QueryType {
  author?: string;
  title?: { $regex: string; $options: string };
  language?: { $in: string[] };
  genre?: { $in: string[] };
  publicationName?: { $in: string[] };
  publishedAt?: Date;
  price?: { $gte: number; $lte: number };
}

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
  const books = await newBook.save();
  const bookObject = books.toObject();
  const newBookResponse = {
    ...bookObject,
    fileInfo: {
      ...bookObject.fileInfo,
      id: `http://localhost:3000/public/books/${bookObject.fileInfo.id}`,
    },
  };
  logger.info(`New Book created successfully ${newBookResponse.title}`);
  res
    .status(201)
    .json(new ApiResponse(200, { newBookResponse }, "New Book created successfully"));
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
  logger.info(`Book Updated successfully ${newBookResponse.title}`);
  res.status(201).json(new ApiResponse(200, { newBookResponse }, "Book Updated successfully"));
});

const getAllPurchaseData: RequestHandler = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const purchasedBooks = await UserModel.findOne({ _id }).populate<{ books: PopulatedBook[] }>(
    {
      path: "books",
      select: "author title cover slug",
      populate: { path: "author", select: "slug name" },
    }
  );

  const formattedBooks = purchasedBooks?.books.map((book) => ({
    id: book._id,
    title: book.title,
    slug: book.slug,
    cover: book.cover.url,
    author: { name: book.author.slug, slug: book.author.name },
  }));

  res.status(200).json(new ApiResponse(200, formattedBooks || [], "Fetched Books"));
});

const getBookPublicsDetails: RequestHandler = asyncHandler(async (req, res) => {
  const bookDetails = await BookModel.findOne({ _id: req.params?.bookslug }).populate<{
    author: PopulatedBook["author"];
  }>({ path: "author", select: "name slug" });

  if (!bookDetails) {
    throw new ApiError(400, "Book Not found ");
  }

  const { _id, title, cover, author, slug, description, language, publicationName } =
    bookDetails;
  res.status(200).json(
    new ApiResponse(200, {
      id: _id,
      title,
      cover: cover?.url,
      author: { name: author.name, slug: author.slug },
      slug,
      description,
      language,
      publicationName,
    })
  );
});

const getAllAvailableBooksController = asyncHandler(async (req, res) => {

  const filter = {
    author: req.query.author as string | undefined,
    title: req.query.title ? (req.query.title as string) : undefined,
    language: req.query.language ? (req.query.language as string)?.split(",") : undefined,
    genre: req.query.genre ? (req.query.genre as string)?.split(",") : undefined,
    publicationName: req.query.publicationName
      ? (req.query.publicationName as string)?.split(",")
      : undefined,
    publishedAt: req.query.publishedAt as Date | undefined,
    price: req.query.price ? (req.query.price as string) : undefined,
  };

  const pagination = {
    pageSize: parseInt(req.query.pageSize as string) || 10,
    pageNumber: parseInt(req.query.pageNumber as string) || 1,
  };
  const query: QueryType = {
    ...(filter.author && { author: filter.author }),
    ...(filter.title && { title: { $regex: filter.title, $options: "i" } }),
    ...(filter.language && { language: { $in: filter.language } }),
    ...(filter.genre && { genre: { $in: filter.genre } }),
    ...(filter.publicationName && { publicationName: { $in: filter.publicationName } }),
    ...(filter.publishedAt && { publishedAt: filter.publishedAt }),
    ...(filter.price && {
      price: {
        $gte: parseInt(filter.price.split("-")[0]),
        $lte: parseInt(filter.price.split("-")[1]),
      },
    }),
  };

  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [books, totalCount] = await Promise.all([
    await BookModel.find(query).skip(skip).limit(pageSize),
    BookModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        books,
        pagination: {
          pageSize,
          pageNumber,
          totalCount,
          totalPages,
          skip,
        },
      },
      "Fetched Books"
    )
  );
 
});

export {
  createNewBook,
  updateBookDetails,
  getAllPurchaseData,
  getBookPublicsDetails,
  getAllAvailableBooksController,
};
