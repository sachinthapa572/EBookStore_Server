import morgan from "morgan";
import type winston from "winston";

import logger from "./winston.logger";
import { appEnv } from "@/config/env";

type Stream = {
  write: (message: string) => winston.Logger;
};

const stream: Stream = {
  // Use the http severity
  write: (message: string) => logger.http(message.trim()),
};

const skip = () => {
  const env = appEnv.NODE_ENV || "development";
  return env !== "development";
};

const morganMiddleware = morgan(":remote-addr :method :url :status - :response-time ms", {
  stream,
  skip,
});

export default morganMiddleware;
