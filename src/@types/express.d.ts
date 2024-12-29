import { File } from "formidable";
import { ObjectId } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user: {
        _id: ObjectId;
        username?: string;
        email: string;
        role: "user" | "author";
        signedUp: boolean;
        avatar?: string;
        authorId?: ObjectId;
      };
      // files?: { [key: string]: File | File[] };
      files: Record<string, File | File[]>;
    }
  }
}
