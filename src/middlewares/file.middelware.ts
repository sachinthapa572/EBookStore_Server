import type { Request, RequestHandler } from "express";
import formidable from "formidable";

/**
 * Processes array values by returning the full array if it has multiple items,
 * or the first item if it has only one item
 */
const processArrayValue = <T>(value: T | T[]): T | T[] => {
  return Array.isArray(value) && value.length === 1 ? value[0] : value;
};

/**
 * Merges formidable fields into the request body
 */
const mergeFields = (req: Request, fields: formidable.Fields): void => {
  req.body = req.body || {};

  for (const key in fields) {
    if (key in fields) {
      req.body[key] = processArrayValue(fields[key]);
    }
  }
};

/**
 * Merges formidable files into the request files object
 */
const mergeFiles = (req: Request, files: formidable.Files): void => {
  req.files = req.files || {};

  for (const key in files) {
    if (key in files) {
      const fileValue = files[key];
      if (fileValue !== undefined) {
        req.files[key] = processArrayValue(fileValue);
      }
    }
  }
};

export const fileParser: RequestHandler = (req, _res, next) => {
  const form = formidable();

  form.parse(req, (err, fields, files) => {
    if (err) {
      return next(err);
    }

    mergeFields(req, fields);
    mergeFiles(req, files);
    next();
  });
};
