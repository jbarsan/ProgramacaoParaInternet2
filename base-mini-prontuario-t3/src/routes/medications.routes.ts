/**
 * Rotas de MedicationRequest, aninhadas em
 * /api/encounters/:encounterId/medications.
 */
import { Router } from "express";
import * as medicationsController from "../controllers/medications.controller";
import { validate } from "../middlewares/validate";
import { requireAuth, requireRole } from "../middlewares/auth";
import { createMedicationSchema } from "../validation/medications.schemas";

export const medicationsRouter = Router({ mergeParams: true });

medicationsRouter.get(
  "/",
  requireAuth,
  requireRole("admin", "profissional"),
  medicationsController.listByEncounter,
);

medicationsRouter.post(
  "/",
  requireAuth,
  requireRole("profissional"),
  validate(createMedicationSchema),
  medicationsController.create,
);
