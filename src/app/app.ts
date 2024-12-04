import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
// import "express-async-errors";
import routes from "@/routes/routes";
import {
  globalErrHandler,
  notFoundErr,
} from "@/middlewares/globalErrHandler.middleware";

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

//==> routes <==//

app.use("/api/v1", routes);

//==> error middleware <==//
app.use(notFoundErr);
app.use(globalErrHandler);

export { app };
