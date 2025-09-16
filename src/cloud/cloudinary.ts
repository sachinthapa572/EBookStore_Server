// biome-ignore lint/style/noExportedImports: l
import { v2 as cloudinary } from "cloudinary";

import { appEnv } from "@/config/env";

cloudinary.config({
  cloud_name: appEnv.CLOUDINARY_NAME,
  api_key: appEnv.CLOUDINARY_API_KEY,
  api_secret: appEnv.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
