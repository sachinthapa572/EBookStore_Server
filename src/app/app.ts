import express from "express";
import morgan from "morgan";
import routes from "@/routes/routes";
import { globalErrHandler, notFoundErr } from "@/middlewares/globalErrHandler.middleware";
import refreshTokenMiddleware from "@/middlewares/refreshToken.middleware";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { fileParser } from "@/middlewares/file.middelware";
import path from "path";
import formidable from "formidable";
import { publicPath } from "@/constant";

const app: express.Application = express();

//==> middlewares <==//
app.use(morgan("dev"));
app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);
app.use(cookieParser());
app.use("/books", express.static(publicPath)); //localhost:3000/books/fileName
app.use(helmet());

app.use(refreshTokenMiddleware);

//==> routes <==//

app.use("/api/v1", routes);

// uplode file to server
app.post("/api/v1/test", async (req, res) => {
  const form = formidable({
    uploadDir: path.resolve(__dirname, "../../public/books"),
    filename(name, ext, _part, _form) {
      console.log("name", name);
      console.log("ext", ext);
      return `${name}kk${ext}`;
    },
    keepExtensions: true,
  });

  await form.parse(req);

  res.send("Hello World");
});

//==> error middleware <==//
app.use(notFoundErr);
app.use(globalErrHandler);

export { app };
