import type { File } from "formidable";
import type { ObjectId } from "mongoose";

import type { RoleType } from "@/enum/role.enum";

declare global {
  // biome-ignore lint/style/noNamespace: test
  namespace Express {
    // biome-ignore lint/nursery/useConsistentTypeDefinitions: i
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
    // biome-ignore lint/nursery/useConsistentTypeDefinitions: i
    interface Locals {
      session?: mongoose.ClientSession;
    }
  }
}
