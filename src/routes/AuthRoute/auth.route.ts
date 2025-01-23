import {
  generateAuthLink,
  logout,
  ProfileInfo,
  updateProfile,
  verifyAuthToken,
} from "@/controllers";
import { fileParser } from "@/middlewares/file.middelware";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { validater } from "@/middlewares/validator.middlewares";
import { emailschema, newUserSchema } from "@/validators/auth/auth.validation";
import { Router } from "express";

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
