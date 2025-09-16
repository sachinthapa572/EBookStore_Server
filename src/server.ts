import { app } from "./app/app";
import { appEnv } from "./config/env";
import logger from "./logger/winston.logger";
import databaseService from "./services/databaseService";
import http from "node:http";

const PORT = appEnv.PORT;
const server: ReturnType<typeof http.createServer> = http.createServer(app);

(async () => {
  try {
    // Database Connection
    const connection = await databaseService.connect();
    logger.info("DATABASE_CONNECTION", {
      meta: {
        CONNECTION_NAME: connection.name,
      },
    });

    server.listen(PORT, () => {
      console.log(`\x1b[32mServer is running at the port ${PORT}\x1b[0m`);
    });

    logger.info("APPLICATION_STARTED", {
      meta: {
        PORT: appEnv.PORT,
        SERVER_URL: appEnv.SERVER_URL,
      },
    });
  } catch (err) {
    logger.error("APPLICATION_ERROR", { meta: err });

    server.close((error) => {
      if (error) {
        logger.error("APPLICATION_ERROR", { meta: error });
      }
      process.exit(1);
    });
  }
})();
