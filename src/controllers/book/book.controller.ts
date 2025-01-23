import slugify from "slugify";

import BookModel, { BookDoc } from "@/model/Book/book.model";
import { customReqHandler, newBookBody, updateBookType } from "@/types";
import ApiError from "@/utils/ApiError";
import { asyncHandler } from "@/utils/asyncHandler";
import {
  deleteFileFromLocalDir,
  // @ts-ignore
  removefromCloudinary,
  uploadBookTolocalDir,
  // @ts-ignore
  uploadCoverToCloudinary,
  uploadImageTolocalDir,
} from "@/utils/fileUpload";
import { formatFileSize } from "@/utils/helper";
import AuthorModel from "@/model/auth/author.model";
import ApiResponse from "@/utils/ApiResponse";
import logger from "@/logger/winston.logger";
import path from "path";

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

  // upload the cover image to cloudinary
  const { cover, book } = files;

  const newBook = new BookModel<BookDoc>({
    title,
    description,
    price,
    fileInfo: {
      id: "",
      size: formatFileSize(fileInfo.size),
    },
    genre,
    language,
    publicationName,
    publishedAt,
    author: user.authorId!,
    slug: "",
  });

  newBook.slug = slugify(`${newBook.title} ${newBook._id}`, {
    lower: true,
    replacement: "-",
  });

  if (cover && !Array.isArray(cover)) {
    // newBook.cover = await uploadCoverToCloudinary(cover, user.email);
    // console.log("existence", ;
    newBook.cover = await uploadImageTolocalDir(
      cover,
      newBook.slug,
      cover.originalFilename?.split(".")[1]!
    );
  }

  if (!book || Array.isArray(book) || book.mimetype !== "application/epub+zip") {
    throw new ApiError(400, "Invalid book File");
  }

  // use core node feature to upload the book to the server rather than formidable
  const uniqueFileName = slugify(`${newBook._id}${newBook.title}.epub`, {
    lower: true,
    replacement: "-",
  });

  await uploadBookTolocalDir(book, uniqueFileName);
  newBook.fileInfo.id = uniqueFileName;

  await AuthorModel.findByIdAndUpdate(user.authorId, {
    $addToSet: { books: newBook._id },
  });
  const Book = await newBook.save();
  const bookObject = Book.toObject();
  const NewBook = {
    ...bookObject,
    fileInfo: {
      ...bookObject.fileInfo,
      id: `http://localhost:3000/public/books/${bookObject.fileInfo.id}`,
    },
  };
  logger.info(`New Book created successfully ${NewBook.title}`);
  res.status(201).json(new ApiResponse(200, { NewBook }, "New Book created successfully"));
});

const updateBookDetails: customReqHandler<updateBookType> = asyncHandler(async (req, res) => {
  const { body, files, user } = req;
  const {
    title,
    description,
    price,
    // fileInfo,
    genre,
    language,
    publicationName,
    publishedAt,
    slug,
  } = body;

  const { cover, book: newBookFile } = files;

  const book = await BookModel.findOne({
    slug,
    author: user.authorId,
  });

  if (!book) {
    throw new ApiError(404, "Book not found");
  }

  if (title && title !== book.title) {
    const slug = slugify(`${title} ${book._id}`, {
      lower: true,
      replacement: "-",
    });
    book.slug = slug;
  }

  Object.assign(book, {
    title: title || book.title,
    description: description || book.description,
    language: language || book.language,
    publicationName: publicationName || book.publicationName,
    genre: genre || book.genre,
    publishedAt: publishedAt || book.publishedAt,
    price: price || book.price,
  });

  if (cover && !Array.isArray(cover) && cover.mimetype?.startsWith("image")) {
    // for cloudinary
    // if (book.cover?.id) {
    //   removefromCloudinary(book.cover.id);
    // }
    // book.cover = await uploadCoverToCloudinary(cover, user.email);

    const uplodPath = path.resolve(__dirname, `../../../public/photos`);
    const oldBookFilePath = book.cover ? path.resolve(uplodPath, book.cover.id) : "";

    deleteFileFromLocalDir(oldBookFilePath);

    book.cover = await uploadImageTolocalDir(
      cover,
      book.slug,
      cover.originalFilename?.split(".")[1]!
    );
  }

  if (
    newBookFile &&
    !Array.isArray(newBookFile) &&
    newBookFile.mimetype === "application/epub+zip"
  ) {
    // remove the old book file
    const uplodPath = path.resolve(__dirname, `../../../public/books`);
    const oldBookFilePath = path.resolve(uplodPath, book.fileInfo.id);

    deleteFileFromLocalDir(oldBookFilePath);

    console.log("book Title", book.title);
    const uniqueFileName = slugify(`${book._id}${book.title}.epub`, {
      lower: true,
      replacement: "-",
    });
    await uploadBookTolocalDir(newBookFile, uniqueFileName);
    book.fileInfo.id = uniqueFileName;
    book.fileInfo.size = formatFileSize(newBookFile.size);
  }

  const Book = await book.save();
  const bookObject = Book.toObject();
  const NewBook = {
    ...bookObject,
    fileInfo: {
      ...bookObject.fileInfo,
      id: `http://localhost:3000/public/books/${bookObject.fileInfo.id}`,
    },
  };
  logger.info(`Book Updated successfully ${NewBook.title}`);
  res.status(201).json(new ApiResponse(200, { NewBook }, "Book Updated successfully"));
});

// delete book controller
// check if the book is already purchased by a user then dont allow to delete the boook

export { createNewBook, updateBookDetails };
