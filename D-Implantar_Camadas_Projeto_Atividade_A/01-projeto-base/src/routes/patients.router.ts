import { Router } from "express";
import { patientsController } from "../controllers/patients.controller";
import { validateSchema } from "../middlewares/validate";
import { createPatientSchema } from "../validation/patients.schemas";

export const patientsRouter = Router({ mergeParams: true });

patientsRouter.get("/", patientsController.list);
patientsRouter.get("/:id", patientsController.getById);
patientsRouter.post("/", validateSchema(createPatientSchema), patientsController.create);
patientsRouter.delete("/:id", patientsController.delete);
