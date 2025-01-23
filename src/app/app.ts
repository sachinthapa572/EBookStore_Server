import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import requestIp from "request-ip";
import cors from "cors";
// import path from "path";
// import formidable from "formidable";

import routes from "@/routes/routes";
import { globalErrHandler, notFoundErr } from "@/middlewares/globalErrHandler.middleware";
import refreshTokenMiddleware from "@/middlewares/refreshToken.middleware";
import { corsOptions, limiter } from "@/constant";
import morganMiddleware from "@/logger/morgan.logger";
// @ts-ignore
import logger from "@/logger/winston.logger";
import path from "path";
import redis from "@/config/redisClient";

const app = express();

// global middlewares
app.use(morganMiddleware);

app.use(cors(corsOptions));
app.use(requestIp.mw());

app.use(limiter);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// serve static files
app.use("/public", express.static(path.join(path.resolve(__dirname, "../"), "../public")));

app.use(helmet());
app.use(refreshTokenMiddleware);

//==> routes <==//

app.use("/api/v1", routes);

//==> error middleware <==//
app.use(notFoundErr);
app.use(globalErrHandler);

export { app };

// uplode file to server
// app.post("/api/v1/test", async (req, res) => {
//   const form = formidable({
//     uploadDir: path.resolve(__dirname, "../../public/books"),
//     filename(name, ext, _part, _form) {
//       console.log("name", name);
//       console.log("ext", ext);
//       return `${name}kk${ext}`;
//     },
//     keepExtensions: true,
//   });

//   await form.parse(req);

//   res.send("Hello World");
// });

// // * API DOCS
// // ? Keeping swagger code at the end so that we can load swagger on "/" route
// app.use(
//   "/",
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerDocument, {
//     swaggerOptions: {
//       docExpansion: "none", // keep all the sections collapsed by default
//     },
//     customSiteTitle: "FreeAPI docs",
//   })
// );

// app.use(
//   "/photos",
//   express.static(path.join(path.resolve(__dirname, "../"), "../public/photos"))
// ); //localhost:3000/photos/fileName
// app.use(
//   "/books",
//   express.static(path.join(path.resolve(__dirname, "../"), "../public/books"))
// );
