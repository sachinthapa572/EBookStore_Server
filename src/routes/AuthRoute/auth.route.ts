import { Router } from "express";

import {
  generateAuthLink,
  logout,
  ProfileInfo,
  updateProfile,
  verifyAuthToken,
} from "@/controllers";
import { fileParser, isAuth, validater } from "@/middlewares";
import { emailschema, newUserSchema } from "@/validators";

const authRouter = Router();

authRouter.post("/generate-link", validater(emailschema), generateAuthLink);

authRouter.get("/verify", verifyAuthToken);

authRouter
  .route("/profile")
  .all(isAuth)
  .get(ProfileInfo)
  .post(fileParser, validater(newUserSchema), updateProfile);

authRouter.get("/logout", isAuth, logout);

export { authRouter };
