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

const authRoute = Router();

authRoute.post("/generate-link", validator(emailschema), generateAuthLink);

authRoute.get("/verify", queryValidator(useridsechema), verifyAuthToken);

authRoute.use(isAuth);
authRoute.get("/profile", ProfileInfo);

authRoute.put("/profile", fileParser, updateProfile);
authRoute.get("/logout", logout);

export default authRoute;
