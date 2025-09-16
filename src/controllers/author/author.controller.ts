import type { RequestHandler } from "express";
import slugify from "slugify";

import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { asyncHandler, type CustomRequestHandler } from "@/utils/asyncHandler";

import { HttpStatusCode } from "@/constant";
import { ROLES } from "@/enum/role.enum";
import { AuthorModel } from "@/model/author/author.model";
import { UserModel } from "@/model/user/user.model";
import type { NewAuthorType } from "@/validators/author/author.validation";

const registerAuthor: CustomRequestHandler<NewAuthorType> = asyncHandler(async (req, res) => {
  const { body, user } = req;

  // Check if user is signed up
  if (!user.signedUp) {
    throw new ApiError(
      HttpStatusCode.Forbidden,
      "User must be signed up before registering as an author"
    );
  }

  // Check if user is already an author
  if (user.role === ROLES.AUTHOR) {
    throw new ApiError(HttpStatusCode.Forbidden, "User is already an author");
  }

  // Create a new author
  const newAuthor = new AuthorModel({
    name: body.name,
    about: body.about,
    userId: user._id,
    socialLinks: body.socialLinks,
  });

  // Generate a unique slug
  newAuthor.slug = slugify(`${newAuthor.name}${newAuthor._id}`, {
    lower: true,
    replacement: "-",
  });

  // Save the new author
  await newAuthor.save();

  // Update the user's role and authorId
  await UserModel.findByIdAndUpdate(user._id, {
    role: ROLES.AUTHOR,
    authorId: newAuthor._id,
  });

  res
    .status(HttpStatusCode.Created)
    .json(
      new ApiResponse(
        HttpStatusCode.Created,
        { slug: newAuthor.slug },
        "Author registration completed successfully. You can now publish your books."
      )
    );
});

const getAuthorDetails: RequestHandler = asyncHandler(async (req, res) => {
  const authorSlug = req.params.slug;

  // Check if author slug is provided
  if (!authorSlug) {
    throw new ApiError(
      HttpStatusCode.BadRequest,
      "Author identifier is required. Please provide a valid author slug."
    );
  }

  // Fetch the author
  const author = await AuthorModel.findOne({ slug: authorSlug });
  if (!author) {
    throw new ApiError(
      HttpStatusCode.NotFound,
      "Author profile not found. Please verify the author identifier."
    );
  }

  // Return the author details
  res.status(HttpStatusCode.OK).json(
    new ApiResponse(
      HttpStatusCode.OK,
      {
        id: author._id,
        name: author.name,
        about: author.about,
        socialLinks: author.socialLinks,
      },
      "Author details retrieved successfully"
    )
  );
});

export { getAuthorDetails, registerAuthor };
