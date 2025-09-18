import type { HydratedDocument, ObjectId } from "mongoose";

import type { NewHistoryType } from "@/validators/history/history.validation";

export type HighlightData = {
  fill: string;
  selection: string;
};

export type BookHistoryData = {
  lastLocation: string;
  highlights: HighlightData[];
  notes: { note: string; createdAt: Date }[];
};

export type HistoryUpdateData = {
  lastLocation?: string;
  notes?: NewHistoryType["notes"];
  highlights?: NewHistoryType["highlights"];
  remove?: boolean;
};

type BookHistoryDoc = {
  book: ObjectId;
  reader: ObjectId;
  lastLocation: string;
  lastReadAt: Date;
  highlights: { selection: string; fill: string }[];
  notes: { note: string; createdAt: Date }[];
};

export type HistoryDocument = HydratedDocument<BookHistoryDoc>;
