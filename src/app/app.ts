import { env } from "@/config/env";
import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";


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

console.log(env.PORT)

export { app };
