import { ApiResponse } from "@/utils/ApiResponse";
import { asyncHandler, type CustomRequestHandler } from "@/utils/asyncHandler";

import { HttpStatusCode } from "@/constant";
import { type BookDoc, BookModel } from "@/model/Book/book.model";
import type { AggregationResult } from "@/services/book/book.type";
import type { SearchBooksType } from "@/validators/book/book.validation";

type FormattedBooks = {
  id: string;
  title: string;
  genre: string;
  slug: string;
  cover?: string;
  rating?: string;
  price: {
    mrp: string;
    sale: string;
  };
};

const formatBook = (book: BookDoc | AggregationResult): FormattedBooks => {
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
};

export const searchBooks: CustomRequestHandler<object, object, SearchBooksType> = asyncHandler(
  async (req, res) => {
    const { title, pageSize, pageNumber } = req.query;

    // Handle pagination
    const pagination = {
      pageSize: Number.parseInt(pageSize?.toString() || "10", 10),
      pageNumber: Number.parseInt(pageNumber?.toString() || "1", 10),
    };

    // Apply pagination to results
    const skip = (pagination.pageNumber - 1) * pagination.pageSize;

    // Use Promise.all to fetch data and count in parallel for better performance
    const [results, totalCount] = await Promise.all([
      BookModel.find({
        title: { $regex: title, $options: "i" },
      })
        .skip(skip)
        .limit(pagination.pageSize),
      BookModel.countDocuments({
        title: { $regex: title, $options: "i" },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / pagination.pageSize);

    res.status(HttpStatusCode.OK).json(
      new ApiResponse(
        HttpStatusCode.OK,
        {
          results: results.map(formatBook),
          pagination: {
            pageSize: pagination.pageSize,
            pageNumber: pagination.pageNumber,
            totalCount,
            totalPages,
            skip,
          },
        },
        "Books fetched successfully"
      )
    );
  }
);
