import { type Model, model, type ObjectId, Schema } from "mongoose";

type BookHistoryDoc = {
  book: ObjectId;
  reader: ObjectId;
  lastLocation: string; // the lastlocation is the last page the user read in the book
  lastReadAt: Date;
  highlights: { selection: string; fill: string }[];
  notes: { note: string; createdAt: Date }[];
};
const bookHistorySchema = new Schema<BookHistoryDoc>(
  {
    book: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    reader: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastLocation: {
      type: String,
      required: true,
    },
    lastReadAt: {
      type: Date,
      required: true,
    },
    highlights: [
      {
        selection: {
          type: String,
          required: true,
        },
        fill: {
          type: String,
          required: true,
        },
      },
    ],
    notes: [
      {
        note: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const BookHistoryModel = model<BookHistoryDoc>(
  "BookHistory",
  bookHistorySchema
) as Model<BookHistoryDoc>;
