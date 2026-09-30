/**
 * Service de MedicationRequest (a prescrição de um atendimento).
 *
 * TODO ARQ-3 — extrair `repositories/medications.repository.ts`
 * (interface + adapter SQLite), como nos ARQ-1 e ARQ-2.
 */
import { getEncounterById } from "./encounters.service";
import type { CreateMedicationInput } from "../validation/medications.schemas";
import {
  type MedicationsRepository,
  defaultMedicationsRepository,
} from "../repositories/medications.repository";

export function listMedicationsByEncounter(
  encounterId: number,
  repository: MedicationsRepository = defaultMedicationsRepository,
) {
  getEncounterById(encounterId); // 404 se o atendimento não existe

  return repository.findByEncounterId(encounterId);
}

export function createMedication(
  encounterId: number,
  input: CreateMedicationInput,
  repository: MedicationsRepository = defaultMedicationsRepository,
) {
  getEncounterById(encounterId);

  return repository.create(encounterId, input);
}
