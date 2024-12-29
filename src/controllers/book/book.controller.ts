import slugify from "slugify";

import BookModel, { BookDoc } from "@/model/Book/book.model";
import { CreateBookRequestHandler } from "@/types";
import ApiError from "@/utils/ApiError";
import { asyncHandler } from "@/utils/asyncHandler";
import { uploadBookTolocalDir, uploadCoverToCloudinary } from "@/utils/fileUpload";
import { formatFileSize } from "@/utils/helper";
import AuthorModel from "@/model/auth/author.model";

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
    newBook.cover = await uploadCoverToCloudinary(cover, user.email);
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
    $push: { books: newBook._id },
  });

  await newBook.save();

  res.status(200).json({ message: "Book created successfully" });
});

export { createNewBook };
