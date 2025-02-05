import { app } from "@/app/app";
import { appEnv } from "@/config/env";
import http from "http";
import databaseService from "./services/databaseService";
import { initRateLimiter } from "./config/rateLimiter";
import logger from "./utils/logger";

const PORT = appEnv.PORT || 8001;
const server = http.createServer(app);

(async () => {
  try {
    // Database Connection
    const connection = await databaseService.connect();
    logger.info(`DATABASE_CONNECTION`, {
      meta: {
        CONNECTION_NAME: connection.name,
      },
    });

    initRateLimiter(connection);
    logger.info(`RATE_LIMITER_INITIATED`);
    server.listen(PORT, () => {
      console.log(`\x1b[32mServer is running at the port ${PORT}\x1b[0m`);
    });

    logger.info(`APPLICATION_STARTED`, {
      meta: {
        PORT: appEnv.PORT,
        SERVER_URL: appEnv.SERVER_URL,
      },
    });
  } catch (err) {
    logger.error(`APPLICATION_ERROR`, { meta: err });

    server.close((error) => {
      if (error) {
        logger.error(`APPLICATION_ERROR`, { meta: error });
      }

      process.exit(1);
    });
  }
})();
