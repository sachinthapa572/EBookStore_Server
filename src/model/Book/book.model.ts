import { type Model, model, type ObjectId, Schema } from "mongoose";

export type BookDoc = {
  _id?: ObjectId;
  author: ObjectId;
  title: string;
  slug: string;
  description: string;
  language: string;
  status: "published" | "unpublished";
  copySold: number;
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
  avgRating?: number;
  totalReviews?: number;
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
    status: {
      type: String,
      enum: ["published", "unpublished"],
      default: "published",
    },
    copySold: {
      type: Number,
      default: 0,
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
        type: String,
      },
      id: {
        type: String,
      },
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

bookSchema.pre("save", function (next) {
  if (
    this.price &&
    typeof this.price.mrp === "number" &&
    typeof this.price.sale === "number"
  ) {
    const { mrp, sale } = this.price;
    // Convert price from dollars to cents for storage
    this.price = { mrp: mrp * 100, sale: sale * 100 };
  }

  next();
});
export const BookModel = model<BookDoc>("Book", bookSchema) as Model<BookDoc>;
