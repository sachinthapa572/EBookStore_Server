import formidable from "formidable";
import { RequestHandler } from "express";

export const fileParser: RequestHandler = async (req, _res, next) => {
  const form = formidable();

  form.parse(req, (err, fields, files) => {
    if (err) {
      return next(err);
    }
    // console.log("Parsed fields:", fields);
    // console.log("Parsed files:", files);

    req.body = req.body || {};
    req.files = req.files || {};

    // Merge fields into req.body
    for (const key in fields) {
      if (Array.isArray(fields[key])) {
        req.body[key] = fields[key].length > 1 ? fields[key] : fields[key][0];
      } else {
        req.body[key] = fields[key];
      }
    }

    // Merge files into req.files
    for (const key in files) {
      if (Array.isArray(files[key])) {
        req.files[key] = files[key].length > 1 ? files[key] : files[key][0];
      } else {
        if (files[key] !== undefined) {
          req.files[key] = files[key];
        }
      }
    }

    // console.log("Merged fields:", req.body);
    // console.log("Merged files:", req.files);

    next();
  });
};

//! When you use multer for handling file uploads, it simplifies the process significantly by automatically attaching req.body and req.files to the request object after parsing. However, libraries like formidable or busboy do not automatically perform this integration, which is why you have to manually process and append the parsed fields and files to the req.body and req.files.

// for (const key in fields) {
//   const fieldValue = fields[key];
//   if (fieldValue) req.body[key] = fieldValue[0];
// }

// for (const key in files) {
//   const fieldValue = files[key];
//   if (fieldValue) {
//     if (fieldValue.length > 1) {
//       req.files[key] = fieldValue;
//     } else {
//       req.files[key] = fieldValue[0];
//     }
//   }
// }
