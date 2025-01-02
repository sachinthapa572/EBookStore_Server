import slugify from "slugify";

import BookModel, { BookDoc } from "@/model/Book/book.model";
import { CreateBookRequestHandler } from "@/types";
import ApiError from "@/utils/ApiError";
import { asyncHandler } from "@/utils/asyncHandler";
import {
  uploadBookTolocalDir,
  // @ts-ignore
  uploadCoverToCloudinary,
  uploadImageTolocalDir,
} from "@/utils/fileUpload";
import { formatFileSize } from "@/utils/helper";
import AuthorModel from "@/model/auth/author.model";
import ApiResponse from "@/utils/ApiResponse";
import logger from "@/logger/winston.logger";

const createNewBook: CreateBookRequestHandler = asyncHandler(async (req, res) => {
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

export { createNewBook };
