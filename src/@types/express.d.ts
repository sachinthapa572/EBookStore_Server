import { File } from "formidable";
import { ObjectId } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user: {
        _id: string;
        username?: string;
        email: string;
        role: "user" | "author";
      };
      // files?: { [key: string]: File | File[] };
      files: Record<string, File | File[]>;
    }
  }
}
