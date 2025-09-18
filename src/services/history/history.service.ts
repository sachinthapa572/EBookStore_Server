import { ApiError } from "@/utils/ApiError";

import type {
  BookHistoryData,
  HighlightData,
  HistoryDocument,
  HistoryUpdateData,
} from "./history.type";
import { HttpStatusCode } from "@/constant";
import { BookHistoryModel } from "@/model/BookHistory/bookHistory.model";
import type { NewHistoryType } from "@/validators/history/history.validation";

class HistoryService {
  // Update or create book history
  async updateBookHistory(userId: string, historyData: NewHistoryType): Promise<void> {
    const { bookId, ...updateData } = historyData;

    const history =
      (await BookHistoryModel.findOne({
        book: bookId,
        reader: userId,
      })) ?? this.createNewHistory(userId, bookId, updateData);

    this.updateExistingHistory(history, updateData);

    await history.save();
  }

  private updateExistingHistory(history: HistoryDocument, data: HistoryUpdateData): void {
    const { lastLocation, notes, highlights, remove } = data;

    if (lastLocation) {
      history.lastLocation = lastLocation;
      history.lastReadAt = new Date();
    }
    this.handleNotes(history, notes);
    this.handleHighlights(history, highlights, remove);
  }

  private createNewHistory(
    userId: string,
    bookId: string,
    data: HistoryUpdateData
  ): HistoryDocument {
    const { lastLocation, notes, highlights } = data;
    return new BookHistoryModel({
      reader: userId,
      book: bookId,
      lastLocation,
      lastReadAt: new Date(),
      highlights: highlights ?? [],
      notes: notes ? [{ note: notes.content, createdAt: new Date() }] : [],
    });
  }

  private handleNotes(history: HistoryDocument, notes?: NewHistoryType["notes"]): void {
    if (notes) {
      if (notes.remove) {
        history.notes = history.notes.filter((item) => item.note !== notes.content);
      } else {
        history.notes.push({ note: notes.content, createdAt: new Date() });
      }
    }
  }

  private handleHighlights(
    history: HistoryDocument,
    highlights?: HighlightData[],
    remove?: boolean
  ): void {
    if (highlights?.length) {
      if (remove) {
        const selectionsToRemove = new Set(highlights.map((h) => h.selection));
        history.highlights = history.highlights.filter(
          (item) => !selectionsToRemove.has(item.selection)
        );
      } else {
        history.highlights.push(...highlights);
      }
    }
  }

  // Get book history for a user
  async getBookHistory(bookId: string, userId: string): Promise<BookHistoryData> {
    const bookHistory = await BookHistoryModel.findOne({
      book: bookId,
      reader: userId,
    });

    if (!bookHistory) {
      throw new ApiError(HttpStatusCode.NotFound, "Book history not found");
    }

    return {
      lastLocation: bookHistory.lastLocation,
      highlights: bookHistory.highlights.map((h) => ({
        fill: h.fill,
        selection: h.selection,
      })),
      notes: bookHistory.notes,
    };
  }
}

export const historyService = new HistoryService();
