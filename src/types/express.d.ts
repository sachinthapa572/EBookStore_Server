import { ObjectId } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      userId?: ObjectId; // Add user to the Request type
      // files?: { [key: string]: File | File[] };
      files: Record<string, File | File[]>;
    }
  }
}
