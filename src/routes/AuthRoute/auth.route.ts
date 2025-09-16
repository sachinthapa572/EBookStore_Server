import { Router } from "express";

import {
  generateAuthLink,
  logout,
  ProfileInfo,
  updateProfile,
  verifyAuthToken,
} from "@/controllers/auth.controller";
import { fileParser } from "@/middlewares/file.middelware";
import { isAuth } from "@/middlewares/isAuth.middleware";
import { queryValidator, validator } from "@/middlewares/validator.middlewares";
import { emailschema, newUserSchema, useridsechema } from "@/validators/auth/auth.validation";

const authRouter = Router();

authRouter.post("/generate-link", validator(emailschema), generateAuthLink);

authRouter.get("/verify", queryValidator(useridsechema), verifyAuthToken);

authRouter.use(isAuth);
authRouter
  .route("/profile")
  .get(ProfileInfo)
  .post(fileParser, validator(newUserSchema), updateProfile);

authRouter.get("/logout", logout);

export { authRouter };
