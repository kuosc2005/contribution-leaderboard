import { Router } from "express";
import { webhook } from "./modules/webhooks/v1";

export const route = Router();

route.use("/v1/webhook", webhook);
