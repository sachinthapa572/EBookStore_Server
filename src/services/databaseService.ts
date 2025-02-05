import { appEnv } from "@/config/env";
import { DB_NAME } from "@/constant";
import mongoose from "mongoose";
const uri = `${appEnv.MONGODB_URI}/${DB_NAME}`;

export default {
  connect: async () => {
    try {
      await mongoose.connect(uri as string);

      return mongoose.connection;
    } catch (err) {
      throw err;
    }
  },
};
