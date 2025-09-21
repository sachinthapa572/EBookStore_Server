import type { File } from "formidable";
import type { ObjectId } from "mongoose";

export type BookCreationData = {
  title: string;
  description: string;
  genre: string;
  language: string;
  fileInfo: {
    name: string;
    type: string;
    size: number;
  };
  price: {
    mrp: number;
    sale: number;
  };
  publicationName: string;
  publishedAt: Date;
  status: "published" | "unpublished";
};

export type BookUpdateData = {
  title?: string;
  description?: string;
  price?: {
    mrp: number;
    sale: number;
  };
  genre?: string;
  language?: string;
  publicationName?: string;
  publishedAt?: Date;
  slug: string;
  status?: "published" | "unpublished";
};

export type BookFiles = {
  cover?: File;
  book?: File;
};

export type FormattedBook = {
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

export type BookDetailsResponse = {
  id: ObjectId;
  title: string;
  genre: string;
  status: string;
  language: string;
  slug: string;
  description: string;
  publicationName: string;
  fileInfo: {
    id: string;
    size: string;
  };
  publishedAt: string;
  cover?: string;
  rating?: string;
  price: {
    mrp: string;
    sale: string;
  };
  author: {
    id: ObjectId;
    name: string;
    slug: string;
  };
};

export type PurchasedBook = {
  id: string;
  title: string;
  slug: string;
  cover: string;
  author: {
    name: string;
    slug: string;
  };
};

export type BookAccessData = {
  url: string;
  settings: BookSettings;
};

export type QueryFilters = {
  author?: string;
  title?: string;
  language?: string;
  genre?: string;
  publicationName?: string;
  publishedAt?: string;
  price?: string;
};

export type PaginationData = {
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  totalPages: number;
  skip: number;
};

export type BooksWithPagination = {
  books: FormattedBook[];
  pagination: PaginationData;
};

export type AggregationResult = {
  _id?: ObjectId;
  title: string;
  genre: string;
  price: {
    mrp: number;
    sale: number;
  };
  cover?: {
    url: string;
  };
  slug: string;
  avgRating?: number;
};

export type FeaturedBook = {
  title: string;
  slogan: string;
  subtitle: string;
  cover: string;
  slug: string;
};

export type BookSettings = {
  lastLocation: string;
  highlights: {
    selection: string;
    fill: string;
  }[];
};
