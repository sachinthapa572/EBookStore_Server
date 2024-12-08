import {
  generateAuthLink,
  logout,
  ProfileInfo,
  verifyAuthToken,
} from "@/controllers/auth.controller";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { validater } from "@/middlewares/validator.middlewares";
import { emailschema } from "@/validators/auth.validation";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/generate-link", validater(emailschema), generateAuthLink);

authRouter.get("/verify", verifyAuthToken);

authRouter.get("/me", isAuth, ProfileInfo);

authRouter.get("/logout", isAuth, logout);

export default authRouter;
