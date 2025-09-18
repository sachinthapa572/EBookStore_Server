import type { ObjectId } from "mongoose";

import type { BookDoc } from "@/model/Book/book.model";

export type AuthorData = {
  id: ObjectId;
  name: string;
  about: string;
  socialLinks?: string[];
};

export type AuthorRegistrationResult = {
  slug: string;
};

export type AuthorBooksData = {
  books: {
    id: string;
    title: string;
    slug: string;
    status: string;
  }[];
};

export type PopulatedAuthor = {
  _id: ObjectId;
  name: string;
  about: string;
  socialLinks?: string[];
  slug: string;
  books: BookDoc[];
};
