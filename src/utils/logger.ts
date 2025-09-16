import util from "node:util";
import "winston-mongodb";
import { blue, green, magenta, red, yellow } from "colorette";
import { createLogger, format, transports } from "winston";
import type {
  ConsoleTransportInstance,
  FileTransportInstance,
} from "winston/lib/winston/transports";
import type { MongoDBTransportInstance } from "winston-mongodb";

import path from "node:path";
import { appEnv } from "@/config/env";
import { EApplicationEnvironment } from "@/enum/application";

const colorizeLevel = (level: string) => {
  switch (level) {
    case "ERROR":
      return red(level);
    case "INFO":
      return blue(level);
    case "WARN":
      return yellow(level);
    default:
      return level;
  }
};

const consoleLogFormat = format.printf((info) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { level, message, timestamp, meta = {} } = info;

  const customLevel = colorizeLevel(level.toUpperCase());
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const customTimestamp = green(timestamp as string);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const customMessage = message;

  const customMeta = util.inspect(meta, {
    showHidden: false,
    depth: null,
    colors: true,
  });

  const customLog = `${customLevel} [${customTimestamp}] ${customMessage}\n${magenta("META")} ${customMeta}\n`;

  return customLog;
});

const consoleTransport = (): ConsoleTransportInstance[] => {
  if (appEnv.NODE_ENV === EApplicationEnvironment.DEVELOPMENT) {
    return [
      new transports.Console({
        level: "info",
        format: format.combine(format.timestamp(), consoleLogFormat),
      }),
    ];
  }

  return [];
};

const fileLogFormat = format.printf((info) => {
  const { level, message, timestamp, meta = {} } = info;

  const logMeta: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(meta as Record<string, unknown>)) {
    if (value instanceof Error) {
      logMeta[key] = {
        name: value.name,
        message: value.message,
        trace: value.stack || "",
      };
    } else {
      logMeta[key] = value;
    }
  }

  const logData = {
    level: level.toUpperCase(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    message,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    timestamp,
    meta: logMeta,
  };

  return JSON.stringify(logData, null, 4);
});

export const FileTransport = (): FileTransportInstance[] => {
  return [
    new transports.File({
      filename: path.join(__dirname, "../", "../", "logs", `${appEnv.NODE_ENV}.log`),
      level: "info",
      format: format.combine(format.timestamp(), fileLogFormat),
    }),
  ];
};

export const MongodbTransport = (): MongoDBTransportInstance[] => {
  return [
    new transports.MongoDB({
      level: "info",
      db: appEnv.MONGODB_URI as string,
      metaKey: "meta",
      expireAfterSeconds: 3600 * 24 * 30,
      collection: "application-logs",
    }),
  ];
};

export default createLogger({
  defaultMeta: {
    meta: {},
  },
  // transports: [...FileTransport(), ...MongodbTransport(), ...consoleTransport()],
  transports: [...consoleTransport()],
});
