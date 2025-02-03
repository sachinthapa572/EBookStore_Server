import { app } from "@/app/app";
import { dbConnect } from "@/config/database";
import { appEnv } from "@/config/env";
import http from "http";
import logger from "./logger/winston.logger";

const PORT = appEnv.PORT || 8001;
const server = http.createServer(app);

async function startServer() {
  try {
    await dbConnect();
    server.listen(PORT, () => {
      console.log(`\x1b[32mServer is running at the port ${PORT}\x1b[0m`);
    });
  } catch (error) {
    logger.error(
      "Error connecting to database",
      error instanceof Error ? error.message : String(error)
    );
  }
}

startServer();
