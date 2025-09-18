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
import { emailschema, useridsechema } from "@/validators/auth/auth.validation";

const authRouter = Router();

authRouter.post("/generate-link", validator(emailschema), generateAuthLink);

authRouter.get("/verify", queryValidator(useridsechema), verifyAuthToken);

authRouter.use(isAuth);
authRouter.get("/profile", ProfileInfo);

authRouter.put("/profile", fileParser, updateProfile);
authRouter.get("/logout", logout);

export { authRouter };
