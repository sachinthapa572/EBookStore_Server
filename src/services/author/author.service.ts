import type { Request } from "express";
import type { ObjectId } from "mongoose";
import slugify from "slugify";

import { ApiError } from "@/utils/ApiError";
import { formatUserProfile } from "@/utils/helper";

import { HttpStatusCode } from "@/constant";
import { ROLES } from "@/enum/role.enum";
import { AuthorModel } from "@/model/author/author.model";
import type { BookDoc } from "@/model/Book/book.model";
import { UserModel } from "@/model/user/user.model";
import type { NewAuthorType } from "@/validators/author/author.validation";

export type AuthorData = {
  id: string;
  name: string;
  about: string;
  socialLinks?: string[];
};

export type AuthorRegistrationResult = {
  user: Request["user"];
};

export type AuthorBooksData = {
  books: {
    id: string;
    title: string;
    slug: string;
    status: string;
    genre: string;
    price: {
      mrp: string;
      sale: string;
    };
    cover?: string;
    rating?: string;
  }[];
};

class AuthorService {
  // Register a new author
  async registerAuthor(
    userId: ObjectId,
    userRole: string,
    isSignedUp: boolean,
    authorData: NewAuthorType
  ): Promise<AuthorRegistrationResult> {
    // Check if user is signed up
    if (!isSignedUp) {
      throw new ApiError(
        HttpStatusCode.Forbidden,
        "User must be signed up before registering as an author"
      );
    }

    // Check if user is already an author
    if (userRole === ROLES.AUTHOR) {
      throw new ApiError(HttpStatusCode.Forbidden, "User is already an author");
    }

    // Create a new author
    const newAuthor = new AuthorModel({
      name: authorData.name,
      about: authorData.about,
      userId,
      socialLinks: authorData.socialLinks,
    });

    // Generate a unique slug
    newAuthor.slug = slugify(`${newAuthor.name}${newAuthor._id}`, {
      lower: true,
      replacement: "-",
    });

    // Save the new author
    await newAuthor.save();

    // Update the user's role and authorId
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        role: ROLES.AUTHOR,
        authorId: newAuthor._id,
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new ApiError(
        HttpStatusCode.InternalServerError,
        "Failed to update user with author information"
      );
    }

    let userResult: Request["user"];
    userResult = formatUserProfile(updatedUser);

    return { user: userResult };
  }

  // Get author details by slug
  async getAuthorDetails(authorId: string): Promise<AuthorData> {
    // Fetch the author
    const author = await AuthorModel.findById(authorId).populate<{ books: BookDoc[] }>(
      "books"
    );
    if (!author) {
      throw new ApiError(
        HttpStatusCode.NotFound,
        "Author profile not found. Please verify the author identifier."
      );
    }

    return {
      id: author._id.toString(),
      name: author.name,
      about: author.about,
      socialLinks: author.socialLinks,
    };
  }

  // Update author information
  async updateAuthorInfo(authorId: ObjectId, updateData: NewAuthorType): Promise<void> {
    await AuthorModel.findByIdAndUpdate(authorId, {
      name: updateData.name,
      about: updateData.about,
      socialLinks: updateData.socialLinks,
    });
  }

  // Get author's books
  async getAuthorBooks(authorId: string): Promise<AuthorBooksData> {
    const author = await AuthorModel.findById(authorId).populate<{
      books: BookDoc[];
    }>("books");

    if (!author) {
      throw new ApiError(HttpStatusCode.NotFound, "Author not found");
    }

    return {
      books: author.books.map((book) => ({
        id: book._id?.toString() || "",
        title: book.title,
        slug: book.slug,
        status: book.status,
        genre: book.genre,
        price: {
          mrp: (book.price.mrp / 100).toFixed(2),
          sale: (book.price.sale / 100).toFixed(2),
        },
        cover: book.cover?.url,
        rating: book.avgRating?.toFixed(1),
      })),
    };
  }
}

export const authorService = new AuthorService();
