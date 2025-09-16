import type { File } from "formidable";

import logger from "./logger";
import fs from "node:fs";
import path from "node:path";
import cloudinary from "@/cloud/cloudinary";
import { bookstoragePath, photoStoragePath } from "@/constant";

const updateAvatarToCloudinary = async (file: File, avatarId?: string) => {
  if (avatarId) {
    await cloudinary.uploader.destroy(avatarId);
  }

  const { public_id, secure_url } = await cloudinary.uploader.upload(file.filepath, {
    asset_folder: "BookStore/user/avatar",
    resource_type: "auto",
    tags: ["user_avatar"],
    context: "photo=user_avatar",
    width: 300,
    height: 300,
    gravity: "face",
    crop: "fill",
  });

  return { id: public_id, url: secure_url };
};

const uploadCoverToCloudinary = async (file: File, email: string) => {
  const { secure_url, public_id } = await cloudinary.uploader.upload(file.filepath, {
    asset_folder: `BookStore/${email.split("@")[0]}/book/book_covers`,
    resource_type: "auto",
    tags: ["book_cover"],
    context: "photo=book_cover",
    width: 800,
    height: 800,
  });
  return { id: public_id, url: secure_url };
};

const removefromCloudinary = async (public_id: string) => {
  await cloudinary.uploader.destroy(public_id);
};

const uploadBookTolocalDir = (file: File, uniqueFileName: string) => {
  if (!fs.existsSync(bookstoragePath)) {
    fs.mkdirSync(bookstoragePath, { recursive: true });
  }

  const filePath = path.resolve(bookstoragePath, uniqueFileName);

  // Convert the file to buffer using readFileSync and write it to the local directory as writeFileSync only accepts buffer file
  fs.writeFileSync(filePath, fs.readFileSync(file.filepath));
};

const uploadImageTolocalDir = (file: File, uniqueFileName: string, extension: string) => {
  if (!fs.existsSync(photoStoragePath)) {
    fs.mkdirSync(photoStoragePath, { recursive: true });
  }

  const filePath = path.resolve(photoStoragePath, `${uniqueFileName}.${extension}`);

  // Convert the file to buffer using readFileSync and write it to the local directory as writeFileSync only accepts buffer file
  fs.writeFileSync(filePath, fs.readFileSync(file.filepath));

  return {
    id: uniqueFileName,
    url: `http://localhost:3000/public/photos/${uniqueFileName}.${extension}`,
  };
};

const deleteFileFromLocalDir = (filePath: string) => {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      logger.info(`File deleted from ${filePath}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error(`Error while deleting file from ${filePath}`, {
        error: message,
      });
    }
    return;
  }
  logger.info(`No file to delete ${filePath}`);
};

// c_thumb,g_auto,h_800,w_800/co_rgb:921919,l_text:times%20new%20roman_300_bold_normal_left:S/fl_layer_apply,g_south_east/f8uxwzs9pyigbyjgffja

export {
  uploadImageTolocalDir,
  uploadBookTolocalDir,
  deleteFileFromLocalDir,
  uploadCoverToCloudinary,
  updateAvatarToCloudinary,
  removefromCloudinary,
};
