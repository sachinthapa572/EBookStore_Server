import mongoose from "mongoose";

import { DB_URL } from "@/constant";

export default {
  connect: async () => {
    await mongoose.connect(DB_URL);
    console.log("\x1b[32m%s\x1b[0m", "MongoDB connected !!");

    return mongoose.connection;
  },
};
