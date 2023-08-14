import { Router } from "express";
import { get, post } from "../controllers";

export const route = Router();

route.post("/post", post);
route.get("/", get);
