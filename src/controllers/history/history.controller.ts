import { ApiResponse } from "@/utils/ApiResponse";
import { asyncHandler, type CustomRequestHandler } from "@/utils/asyncHandler";

import { HttpStatusCode } from "@/constant";
import { historyService } from "@/services/history/history.service";
import type { UuidGType } from "@/validators";
import type { NewHistoryType } from "@/validators/history/history.validation";

export const updateBookHistory: CustomRequestHandler<NewHistoryType> = asyncHandler(
  async (req, res) => {
    await historyService.updateBookHistory(req.user.id, req.body);

    res
      .status(HttpStatusCode.OK)
      .json(new ApiResponse(HttpStatusCode.OK, null, "History updated"));
  }
);

export const getBookHistory: CustomRequestHandler<
  object,
  UuidGType<["bookId"]>
> = asyncHandler(async (req, res) => {
  const bookHistoryData = await historyService.getBookHistory(req.params.bookId, req.user.id);

  res
    .status(HttpStatusCode.OK)
    .json(new ApiResponse(HttpStatusCode.OK, bookHistoryData, "History retrieved"));
});
