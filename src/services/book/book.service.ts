import type { ObjectId } from "mongoose";
import slugify from "slugify";

import { ApiError } from "@/utils/ApiError";
import {
  deleteFileFromLocalDir,
  uploadBookTolocalDir,
  uploadImageTolocalDir,
} from "@/utils/fileUpload";
import { formatFileSize } from "@/utils/helper";

import type {
  AggregationResult,
  BookAccessData,
  BookCreationData,
  BookDetailsResponse,
  BookFiles,
  BooksWithPagination,
  BookUpdateData,
  FormattedBook,
  PurchasedBook,
  QueryFilters,
} from "./book.type";
import fs from "node:fs";
import path from "node:path";
import { appEnv } from "@/config/env";
import { HttpStatusCode } from "@/constant";
import logger from "@/logger/winston.logger";
import { AuthorModel } from "@/model/author/author.model";
import { type BookDoc, BookModel } from "@/model/Book/book.model";
import { BookHistoryModel } from "@/model/BookHistory/bookHistory.model";
import { UserModel } from "@/model/user/user.model";
import type { PopulatedBook } from "@/types";

export type BookCreationResult = {
  [key: string]: unknown;
  title: string;
  fileInfo: {
    id: string;
    size: string;
  };
};

export type BookUpdateResult = {
  [key: string]: unknown;
  title: string;
  fileInfo: {
    id: string;
    size: string;
  };
};

class BookService {
  // Helper function to build query filters
  private buildQueryFilters(params: QueryFilters) {
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
            break;
        }
      }
    }

    return query;
  }

  // Helper function to format book data
  private formatBook(
    book:
      | BookDoc
      | {
          _id?: ObjectId;
          title: string;
          slug: string;
          genre: string;
          price: { mrp: number; sale: number };
          cover?: { url: string };
          avgRating?: number;
        }
  ): FormattedBook {
    const { _id, title, slug, genre, price, cover, avgRating } = book;

    return {
      id: _id?.toString() || "",
      title,
      slug,
      genre,
      price: {
        mrp: (price.mrp / 100).toFixed(2),
        sale: (price.sale / 100).toFixed(2),
      },
      cover: cover?.url,
      rating: avgRating?.toFixed(1),
    };
  }

  // Create a new book
  async createBook(
    authorId: ObjectId,
    bookData: BookCreationData,
    files: BookFiles
  ): Promise<BookCreationResult> {
    const {
      title,
      description,
      genre,
      language,
      fileInfo,
      price,
      publicationName,
      publishedAt,
      status,
    } = bookData;
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
      status: status as "published" | "unpublished",
      copySold: 0,
      author: authorId,
      slug: slugify(`${title} ${authorId}`, {
        lower: true,
        replacement: "-",
      }),
    });

    if (!Array.isArray(cover) && cover?.originalFilename) {
      // Upload cover image
      newBook.cover = uploadImageTolocalDir(
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
    await AuthorModel.findByIdAndUpdate(authorId, {
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
    return newBookResponse;
  }

  // Update book details
  async updateBook(
    authorId: ObjectId,
    updateData: BookUpdateData,
    files: BookFiles
  ): Promise<BookUpdateResult> {
    const { title, description, price, genre, language, publicationName, publishedAt, slug } =
      updateData;
    const { cover, book: newBookFile } = files;

    // Find the book
    const book = await BookModel.findOne({ slug, author: authorId });
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
    return newBookResponse;
  }

  // Get user's purchased books
  async getPurchasedBooks(userId: ObjectId): Promise<PurchasedBook[]> {
    const purchasedBooks = await UserModel.findById(userId).populate<{
      books: PopulatedBook[];
    }>({
      path: "books",
      select: "author title cover slug",
      populate: { path: "author", select: "slug name" },
    });

    return (
      purchasedBooks?.books.map((book) => ({
        id: book._id,
        title: book.title,
        slug: book.slug,
        cover: book.cover.url,
        author: { name: book.author.slug, slug: book.author.name },
      })) || []
    );
  }

  // Get book public details
  async getBookPublicDetails(slug: string): Promise<BookDetailsResponse> {
    const bookDetails = await BookModel.findOne({ slug }).populate<{
      author: {
        _id: ObjectId;
        name: string;
        slug: string;
      };
    }>({
      path: "author",
      select: "name slug",
    });

    if (!bookDetails) {
      throw new ApiError(HttpStatusCode.NotFound, "Book not found");
    }

    return {
      id: bookDetails._id,
      title: bookDetails.title,
      genre: bookDetails.genre,
      status: bookDetails.status,
      language: bookDetails.language,
      slug: bookDetails.slug,
      description: bookDetails.description,
      publicationName: bookDetails.publicationName,
      fileInfo: bookDetails.fileInfo,
      publishedAt: bookDetails.publishedAt.toISOString().split("T")[0],
      cover: bookDetails.cover?.url,
      rating: bookDetails.avgRating?.toFixed(1),
      price: {
        mrp: (bookDetails.price.mrp / 100).toFixed(2),
        sale: (bookDetails.price.sale / 100).toFixed(2),
      },
      author: {
        id: bookDetails.author._id,
        name: bookDetails.author.name,
        slug: bookDetails.author.slug,
      },
    };
  }

  // Get all available books with filtering and pagination
  async getAllAvailableBooks(
    filters: QueryFilters,
    pagination: { pageSize: number; pageNumber: number }
  ): Promise<BooksWithPagination> {
    const { publishedAt, price, ...otherFilters } = filters;
    const skip = (pagination.pageNumber - 1) * pagination.pageSize;

    // Build the query object using helper function
    const query = this.buildQueryFilters(otherFilters);

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

    return {
      books: books.map((book) => this.formatBook(book)),
      pagination: {
        pageSize: pagination.pageSize,
        pageNumber: pagination.pageNumber,
        totalCount,
        totalPages,
        skip,
      },
    };
  }

  // Get books by genre
  async getBooksByGenre(genre: string): Promise<FormattedBook[]> {
    const books = await BookModel.find({
      genre,
      status: { $ne: "unpublished" },
    }).limit(5);

    return books.map((book) => this.formatBook(book));
  }

  // Generate book access URL
  async generateBookAccessUrl(slug: string, userId: ObjectId): Promise<BookAccessData> {
    const book = await BookModel.findOne({ slug });
    if (!book) {
      throw new ApiError(
        HttpStatusCode.NotFound,
        "Book not found. Please verify the book identifier."
      );
    }

    const user = await UserModel.findOne({ _id: userId, books: book._id });
    if (!user) {
      throw new ApiError(
        HttpStatusCode.Forbidden,
        "Access denied. This action requires prior purchase of the book"
      );
    }

    const history = await BookHistoryModel.findOne({
      reader: userId,
      book: book._id,
    });

    const settings = {
      lastLocation: "",
      highlights: [] as { selection: string; fill: string }[],
    };

    if (history) {
      settings.highlights = history.highlights.map((h) => ({
        fill: h.fill,
        selection: h.selection,
      }));
      settings.lastLocation = history.lastLocation;
    }

    return {
      url: `${appEnv.SERVER_URL}${book.fileInfo.id}`,
      settings,
    };
  }

  // Get book recommendations based on genre
  async getBookRecommendations(bookId: string): Promise<FormattedBook[]> {
    const book = await BookModel.findById(bookId);
    if (!book) {
      throw new ApiError(HttpStatusCode.NotFound, "Book not found");
    }

    const recommendedBooks = await BookModel.aggregate<AggregationResult>([
      {
        $match: {
          genre: book.genre,
          _id: { $ne: book._id },
          status: { $ne: "unpublished" },
        },
      },
      {
        $lookup: {
          localField: "_id",
          from: "reviews",
          foreignField: "book",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
        },
      },
      {
        $sort: { averageRating: -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          genre: 1,
          price: {
            mrp: 1,
            sale: 1,
          },
          cover: {
            url: 1,
          },
          averageRating: 1,
        },
      },
    ]);

    return recommendedBooks.map((recommendedBook) => this.formatBook(recommendedBook));
  }

  // Delete a book
  async deleteBook(bookId: string, authorId: ObjectId): Promise<void> {
    const deleteMethodAddedDate = 1_722_704_247_287;

    const book = await BookModel.findOne({ _id: bookId, author: authorId });
    if (!book) {
      throw new ApiError(HttpStatusCode.NotFound, "Book not found");
    }

    const bookCreationTime = book.id.getTimestamp().getTime();
    if (bookCreationTime >= deleteMethodAddedDate) {
      throw new ApiError(
        HttpStatusCode.Forbidden,
        "Deletion method not available for this book"
      );
    }

    if (book.copySold >= 1) {
      throw new ApiError(
        HttpStatusCode.Forbidden,
        "Deletion not allowed for books with copied sales"
      );
    }

    // Remove old book file (epub) from storage
    const uploadPath = path.resolve(__dirname, "../../../public/books");
    const oldFilePath = path.join(uploadPath, book.fileInfo.id);
    const imageUploadPath = path.resolve(__dirname, "../../../public/photos");
    const oldImagePath = path.join(imageUploadPath, book.cover?.id || "");

    // Attempt to delete book file
    if (book.fileInfo) {
      try {
        await fs.promises.unlink(oldFilePath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          logger.error(`Failed to delete book file ${oldFilePath}:`, error);
          throw error;
        }
      }
    }

    // Attempt to delete cover image
    if (book.cover) {
      try {
        await fs.promises.unlink(oldImagePath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          logger.error(`Failed to delete cover image ${oldImagePath}:`, error);
          throw error;
        }
      }
    }

    const session = await BookModel.startSession();

    try {
      await session.withTransaction(async () => {
        // Delete the book document
        await BookModel.findByIdAndDelete(book._id, { session });

        // Atomically remove the book from author's books array
        await AuthorModel.findByIdAndUpdate(
          authorId,
          { $pull: { books: book._id } },
          { session }
        );
      });

      logger.info(`Book "${book.title}" deleted successfully`);
    } finally {
      await session.endSession();
    }
  }
}

export const bookService = new BookService();
