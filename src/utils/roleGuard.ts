import type { Request } from "express";

import { ApiError } from "./ApiError";
import { HttpStatusCode } from "@/constant";
import type { RoleType } from "@/enum/role.enum";

const roleGuard = (req: Request, role: RoleType) => {
  if (!req.user) {
    throw new ApiError(HttpStatusCode.Forbidden, "User not authenticated");
  }

  if (req.user.role !== role) {
    throw new ApiError(HttpStatusCode.Forbidden, "Access denied: Insufficient permissions");
  }
};

export { roleGuard };
