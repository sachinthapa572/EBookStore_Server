import http from "http";
import { app } from "@/app/app";
import { dbConnect } from "@/config/database";
import { env } from "@/config/env";

// server
const PORT = env.PORT || 8001;

const server = http.createServer(app);

dbConnect().then(
  () => {
    server.listen(PORT, () => {
      console.log(`Server is running at the port ${PORT}`);
    });
  },
  (error) => {
    console.log("Error connecting to database", error.message);
  }
);
