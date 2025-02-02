import { HttpStatusCode } from "@/constant";
import AuthorModel from "@/model/auth/author.model";
import UserModel from "@/model/auth/user.model";
import { RequestAuthorHandler } from "@/types";
import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import { asyncHandler } from "@/utils/asyncHandler";
import { RequestHandler } from "express";
import slugify from "slugify";

const registerAuthor: RequestAuthorHandler = asyncHandler(async (req, res) => {
  const { body, user } = req;

  // Check if user is signed up
  if (!user.signedUp) {
    throw new ApiError(
      HttpStatusCode.Forbidden,
      "User must be signed up before registering as an author"
    );
  }

  // Check if user is already an author
  if (user.role === "author") {
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
  await UserModel.findByIdAndUpdate(user._id, { role: "author", authorId: newAuthor._id });

  res
    .status(201)
    .json(
      new ApiResponse(201, { slug: newAuthor.slug }, "Thanks for registering as an author")
    );
});

export const getAuthorDetails: RequestHandler = asyncHandler(async (req, res) => {
  const authorSlug = req.params.slug;

  // Check if author slug is provided
  if (!authorSlug) {
    throw new ApiError(HttpStatusCode.BadRequest, "Author slug is missing");
  }

  // Fetch the author
  const author = await AuthorModel.findOne({ slug: authorSlug });
  if (!author) {
    throw new ApiError(HttpStatusCode.NotFound, "Author not found");
  }

  // Return the author details
  res.json(
    new ApiResponse(
      HttpStatusCode.OK,
      {
        id: author._id,
        name: author.name,
        about: author.about,
        socialLinks: author.socialLinks,
      },
      "Fetch user successfully"
    )
  );
});

export { registerAuthor };
