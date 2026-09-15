import { Router } from "express";
import { medicationsController } from "../controllers/medications.controller";
import { validateSchema } from "../middlewares/validate";
import { createMedicationSchema } from "../validation/medications.schemas";

export const medicationsRouter = Router({ mergeParams: true });

medicationsRouter.get("/", medicationsController.list);
medicationsRouter.post("/", validateSchema(createMedicationSchema), medicationsController.create);
medicationsRouter.get("/:id", medicationsController.getById);
medicationsRouter.delete("/:id", medicationsController.delete);

