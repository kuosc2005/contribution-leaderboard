import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import { route } from "./routes";
import dotenv from "dotenv";

dotenv.config();

export const app: Express = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

import mongoose, { ConnectOptions } from "mongoose";

const dbURL: string = process.env.DBURL as string;

mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions)
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/api", route);

app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Hello from the server!</h1>");
});
