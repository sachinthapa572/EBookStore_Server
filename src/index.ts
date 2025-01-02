import { app } from "@/app/app";
import { dbConnect } from "@/config/database";
import { appEnv } from "@/config/env";
import http from "http";
import logger from "./logger/winston.logger";

// server
const PORT = appEnv.PORT || 8001;

const server = http.createServer(app);

dbConnect().then(
  () => {
    server.listen(PORT, () => {
      console.log(`\x1b[32mServer is running at the port ${PORT}\x1b[0m`);
    });
  },
  (error) => {
    // console.log("Error connecting to database", error.message);
    logger.error("Error connecting to database", error.message);
  }
);
