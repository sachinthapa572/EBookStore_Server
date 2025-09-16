import { type Model, model, type ObjectId, Schema } from "mongoose";

export type BookDoc = {
  author: ObjectId;
  title: string;
  slug: string;
  description: string;
  language: string;
  publishedAt: Date;
  publicationName: string;
  genre: string;
  price: {
    mrp: number;
    sale: number;
  };
  cover?: {
    id: string;
    url: string;
  };
  fileInfo: {
    id: string;
    size: string;
  };
};

const bookSchema = new Schema<BookDoc>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },
    title: {
      type: String,
      trim: true,
      lowercase: true,
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      trim: true,
    },
    publicationName: {
      type: String,
      trim: true,
    },
    genre: {
      type: String,
      trim: true,
    },
    publishedAt: {
      type: Date,
    },
    price: {
      type: Object,
      mrp: {
        type: Number,
        require: true,
      },
      sale: {
        type: Number,
        require: true,
      },
    },
    cover: {
      url: String,
      id: String,
    },
    fileInfo: {
      type: Object,

      url: {
        type: Number,
      },
      id: {
        type: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const BookModel = model<BookDoc>("Book", bookSchema) as Model<BookDoc>;
