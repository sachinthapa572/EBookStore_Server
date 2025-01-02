import { HttpStatusCode } from "@/constant";
import AuthorModel from "@/model/auth/author.model";
import UserModel from "@/model/auth/user.model";
import { RequestAuthorHandler } from "@/types";
import ApiError from "@/utils/ApiError";
import ApiResponse from "@/utils/ApiResponse";
import { asyncHandler } from "@/utils/asyncHandler";
import { RequestHandler } from "express";
import slugify from "slugify";

const registerAuthor: RequestAuthorHandler = asyncHandler(async (req, res, _next) => {
  const { body, user } = req;
  if (!user.signedUp) {
    throw new ApiError(
      HttpStatusCode.Forbidden,
      "User must be signed Up before registring as the author "
    );
  }

  if (user.role === "author") {
    throw new ApiError(HttpStatusCode.Forbidden, "User is already an author ");
  }

  const newAuthor = new AuthorModel({
    name: body.name,
    about: body.about,
    userId: user._id,
    socialLinks: body.socialLinks,
  });

  const uniqueSlug = slugify(`${newAuthor.name}${newAuthor._id}`, {
    lower: true,
    replacement: "-",
  });

  newAuthor.slug = uniqueSlug;
  await newAuthor.save();

  await UserModel.findByIdAndUpdate(user._id, {
    role: "author",
    authorId: newAuthor._id,
  });

  res.status(200).json(
    new ApiResponse(
      201,
      {
        slug: newAuthor.slug,
      },
      "Thanks for the registring as an author "
    )
  );
});

export const getAuthorDetails: RequestHandler = asyncHandler(async (req, res) => {
  const authorslug = req.params.slug;

  if (!authorslug) {
    throw new ApiError(400, "Author slug is missing ");
  }

  const author = await AuthorModel.findOne({ slug: authorslug });
  if (!author) {
    throw new ApiError(404, "Author not Found ");
  }

  res.json(
    new ApiResponse(
      200,
      {
        id: author._id,
        name: author.name,
        about: author.about,
        socialLinks: author.socialLinks,
      },
      "Fetch user successfully "
    )
  );
});

export { registerAuthor };
