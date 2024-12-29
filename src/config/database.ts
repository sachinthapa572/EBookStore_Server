import mongoose from "mongoose";
import { appEnv } from "./env";
import { DB_NAME } from "@/constant";

const uri = `${appEnv.MONGODB_URI}/${DB_NAME}`;
if (!uri) {
  console.error("Please define the MONGODB_URI environment variable inside .env");
  process.exit(1);
}

export const dbConnect = async (): Promise<void> => {
  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected !!`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process with failure
  }
};
