import express from "express";
import morgan from "morgan";
import routes from "@/routes/routes";
import { globalErrHandler, notFoundErr } from "@/middlewares/globalErrHandler.middleware";
import refreshTokenMiddleware from "@/middlewares/refreshToken.middleware";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { fileParser } from "@/middlewares/file.middelware";

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
app.use(express.static("public"));
app.use(helmet());

app.use(refreshTokenMiddleware);

//==> routes <==//

app.use("/api/v1", routes);
app.post("/api/v1/test", fileParser, (req, res) => {
  console.log(req.body);
  console.log(req.files);
  res.send("Hello World");
});

//==> error middleware <==//
app.use(notFoundErr);
app.use(globalErrHandler);

export { app };
