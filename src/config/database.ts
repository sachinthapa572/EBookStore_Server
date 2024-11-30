import mongoose from "mongoose";
import { env } from "./env";


export const dbConnect = async (): Promise<void> => {
  try {
    const connectionInstance = await mongoose.connect(
      `${env.MONGODB_URI}/${env.DB_NAME}`
    );
    console.log(
      `MongoDB connected !! DB Host :${connectionInstance.connection.host} 👌`
    );
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process with failure
  }
};
