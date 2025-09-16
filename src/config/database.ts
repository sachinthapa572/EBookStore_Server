import mongoose from "mongoose";

import { DB_URL } from "@/constant";
import logger from "@/logger/winston.logger";

export const dbConnect = async (): Promise<void> => {
  try {
    await mongoose.connect(DB_URL);
    console.log("\x1b[32m%s\x1b[0m", "MongoDB connected !!");
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};
