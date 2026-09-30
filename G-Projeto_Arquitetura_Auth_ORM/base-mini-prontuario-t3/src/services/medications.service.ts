/**
 * Service de MedicationRequest (a prescrição de um atendimento).
 *
 * TODO ARQ-3 — extrair `repositories/medications.repository.ts`
 * (interface + adapter SQLite), como nos ARQ-1 e ARQ-2.
 */
import { ForbiddenError } from "../errors/HttpError";
import { getEncounterById } from "./encounters.service";
import type { CreateMedicationInput } from "../validation/medications.schemas";
import {
  type MedicationsRepository,
  defaultMedicationsRepository,
} from "../repositories/medications.repository";

export async function listMedicationsByEncounter(
  encounterId: number,
  repository: MedicationsRepository = defaultMedicationsRepository,
) {
  await getEncounterById(encounterId); // 404 se o atendimento não existe

  return await repository.findByEncounterId(encounterId);
}

export async function createMedication(
  encounterId: number,
  input: CreateMedicationInput,
  professionalId?: number,
  repository: MedicationsRepository = defaultMedicationsRepository,
) {
  const encounter = await getEncounterById(encounterId);

  // Invariante N2 / Regra de domínio (ATAQUE 6):
  // Somente o profissional que registrou o atendimento pode prescrever nele.
  if (encounter.professionalId && professionalId && encounter.professionalId !== professionalId) {
    throw new ForbiddenError(
      "Apenas o profissional que registrou o atendimento pode prescrever.",
    );
  }

  return await repository.create(encounterId, input);
}
