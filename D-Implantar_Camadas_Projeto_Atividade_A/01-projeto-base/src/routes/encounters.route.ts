import { Router } from "express";
import { encountersController } from "../controllers/encounters.controller";

export const encountersRouter = Router({ mergeParams: true });

encountersRouter.get("/", encountersController.listByPatient);
encountersRouter.post("/", encountersController.create);
