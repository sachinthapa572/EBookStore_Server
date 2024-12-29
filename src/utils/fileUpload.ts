import cloudinary from "@/cloud/cloudinary";
import { File } from "formidable";

export const updateAvatarToCloudinary = async (file: File, avatarId?: string) => {
  if (avatarId) {
    // if user already has a profile image remove the old first
    await cloudinary.uploader.destroy(avatarId);
  }

  const { public_id, secure_url } = await cloudinary.uploader.upload(file.filepath, {
    asset_folder: "BookStore/user/user_avatars",
    resource_type: "auto",
    // public_id: "custom_id", this is the id given by the user itself
    tags: ["user_avatar"],
    context: "photo=user_avatar",
    width: 300,
    height: 300,
    gravity: "face",
    crop: "fill",
  });

  return { id: public_id, url: secure_url };
};

// c_thumb,g_auto,h_800,w_800/co_rgb:921919,l_text:times%20new%20roman_300_bold_normal_left:S/fl_layer_apply,g_south_east/f8uxwzs9pyigbyjgffja
