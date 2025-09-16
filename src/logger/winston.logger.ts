import winston from "winston";

import { appEnv } from "@/config/env";

// Define your severity levels.
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// This method set the current severity based on
// the current NODE_ENV: show all the log levels
// if the server was run in development mode; otherwise,
// if it was run in production, show only warn and error messages.
const level = () => {
  const env = appEnv.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
  error: "red",
  warn: "yellow",
  info: "blue",
  http: "magenta",
  debug: "white",
};

// Tell winston that you want to link the colors
// defined above to the severity levels.
winston.addColors(colors);
// Console format (with colors)

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "DD MMM, YYYY - HH:mm:ss:ms" }),
  winston.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
);

// File format (no colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "DD MMM, YYYY - HH:mm:ss:ms" }),
  winston.format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
);

const transports = [
  new winston.transports.Console({ format: consoleFormat }),
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
    format: fileFormat,
  }),
  new winston.transports.File({
    filename: "logs/info.log",
    level: "info",
    format: fileFormat,
  }),
  new winston.transports.File({
    filename: "logs/http.log",
    level: "http",
    format: fileFormat,
  }),
];

const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

export default logger;
