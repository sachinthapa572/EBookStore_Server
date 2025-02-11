import { RoleType } from "@/enum/role.enum";
import { File } from "formidable";
import { ObjectId } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user: {
        _id: ObjectId;
        username?: string;
        email: string;
        role: RoleType;
        signedUp: boolean;
        avatar?: string;
        authorId?: ObjectId;
        role: string;
      };
      // files?: { [key: string]: File | File[] };
      files: Record<string, File | File[]>;
    }
    interface Locals {
      session?: mongoose.ClientSession;
    }
  }
}
