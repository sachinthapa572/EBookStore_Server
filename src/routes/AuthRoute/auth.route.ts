import {
  generateAuthLink,
  ProfileInfo,
  verifyAuthToken,
} from "@/controllers/auth.controller";
import { validater } from "@/middlewares/validator.middlewares";
import { emailschema } from "@/validators/auth.validation";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/generate-link", validater(emailschema), generateAuthLink);

authRouter.get("/verify", verifyAuthToken);

authRouter.get("me", ProfileInfo);

authRouter.get("/logout", logout);

export default authRouter;
