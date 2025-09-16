import { faker } from "@faker-js/faker";
import { USERS_COUNT } from "./_constants";
import { getRandomNumber } from "./helper";

import fs from "fs";
import logger from "@/utils/logger";
import { UserModel } from "@/model/user/user.model";
import { ApiError } from "@/utils/ApiError";
import { ApiResponse } from "@/utils/ApiResponse";
import { asyncHandler } from "@/utils/asyncHandler";
import { deleteFileFromLocalDir } from "@/utils/fileUpload";

const AvailableUserRoles = ["AUTHOR", "USER"];
const users = new Array(USERS_COUNT).fill("_").map(() => ({
  avatar: {
    url: faker.image.avatarGitHub(),
    id: "",
  },
  username: faker.person.fullName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  isverfied: true,
  signedUp: true,
  role: AvailableUserRoles[getRandomNumber(2)],
}));

const seedUsers = asyncHandler(async (req, res, next) => {
  const userCount = await UserModel.countDocuments();
  if (userCount >= USERS_COUNT) {
    throw new ApiError(400, "Users already seeded");
  }

  await Promise.all([
    UserModel.deleteMany({}),
    //     BookModel.deleteMany({}),
    //     AuthorModel.deleteMany({}),
    //     ReviewModel.deleteMany({}),
  ]);

  // remove old credentials file
  deleteFileFromLocalDir("./public/temp/seed-credentials.json");

  const credentials: {
    username: string;
    password: string;
    role: string;
  }[] = [];

  // create Promise array
  const userCreationPromise = users.map(async (user) => {
    credentials.push({
      username: user.username.toLowerCase(),
      password: user.password,
      role: user.role,
    });
    await UserModel.create(user);
  });

  // pass promises array to the Promise.all method
  await Promise.all(userCreationPromise);
  logger.info("Users seeded successfully", {
    meta: {
      timeStamp: new Date().toISOString(),
    },
  });

  // Once users are created dump the credentials to the json file
  const json = JSON.stringify(credentials);

  try {
    if (!fs.existsSync("./public/temp/seed-credentials.json")) {
      fs.writeFileSync("./public/temp/seed-credentials.json", json, "utf8");
    }
  } catch (err: any) {
    logger.error("Error while writing the credentials", err.message);
  }

  next();

  res.status(201).json(new ApiResponse(201, null, "Users seeded successfully"));
});

const getGeneratedCredentials = asyncHandler(async (_req, res) => {
  try {
    const json = fs.readFileSync("./public/temp/seed-credentials.json", "utf8");
    res
      .status(200)
      .json(new ApiResponse(200, JSON.parse(json), "Dummy credentials fetched successfully"));
  } catch (error) {
    throw new ApiError(404, "No credentials generated yet. Make sure you have seeded .");
  }
});

export { getGeneratedCredentials, seedUsers };
