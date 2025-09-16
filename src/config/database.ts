import { DB_NAME } from "@/constant";
import logger from "@/logger/winston.logger";
import mongoose from "mongoose";
import { appEnv } from "./env";

const uri = `${appEnv.MONGODB_URI}/${DB_NAME}`;
if (!uri) {
  // console.error("Please define the MONGODB_URI environment variable inside .env");
  logger.error("Please define the MONGODB_URI environment variable inside .env");
  process.exit(1);
}

export const dbConnect = async (): Promise<void> => {
  try {
    await mongoose.connect(uri);
    console.log("\x1b[32m%s\x1b[0m", "MongoDB connected !!");
  } catch (error) {
    // console.error("Error connecting to MongoDB:", error);
    logger.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process with failure
  }
};
