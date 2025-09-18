import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { asyncHandler, type CustomRequestHandler } from "@/utils/asyncHandler";

import { HttpStatusCode } from "@/constant";
import { authorService } from "@/services/author/author.service";
import type { UuidGType } from "@/validators";
import type { NewAuthorType } from "@/validators/author/author.validation";

const registerAuthor: CustomRequestHandler<NewAuthorType> = asyncHandler(async (req, res) => {
  const { body, user } = req;

  const result = await authorService.registerAuthor(user._id, user.role, user.signedUp, body);

  res
    .status(HttpStatusCode.Created)
    .json(
      new ApiResponse(
        HttpStatusCode.Created,
        result,
        "Author registration completed successfully. You can now publish your books."
      )
    );
});

const getAuthorDetails: CustomRequestHandler<object, UuidGType<["id"]>> = asyncHandler(
  async (req, res) => {
    const authorSlug = req.params.id;

    const authorData = await authorService.getAuthorDetails(authorSlug);

    res
      .status(HttpStatusCode.OK)
      .json(
        new ApiResponse(HttpStatusCode.OK, authorData, "Author details retrieved successfully")
      );
  }
);

const updateAuthorInfo: CustomRequestHandler<NewAuthorType> = asyncHandler(
  async (req, res) => {
    const { body, user } = req;

    if (!user.authorId) {
      throw new ApiError(HttpStatusCode.BadRequest, "Author ID is required");
    }

    await authorService.updateAuthorInfo(user.authorId, body);

    res
      .status(HttpStatusCode.OK)
      .json(new ApiResponse(HttpStatusCode.OK, null, "Author details updated successfully"));
  }
);

export const getBooksDetails: CustomRequestHandler<
  object,
  UuidGType<["authorId"]>
> = asyncHandler(async (req, res) => {
  const { authorId } = req.params;

  const booksData = await authorService.getAuthorBooks(authorId);

  res
    .status(HttpStatusCode.OK)
    .json(
      new ApiResponse(HttpStatusCode.OK, booksData, "Author details fetched successfully")
    );
});

export { getAuthorDetails, registerAuthor, updateAuthorInfo };
