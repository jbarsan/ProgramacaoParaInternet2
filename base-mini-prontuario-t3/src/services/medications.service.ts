/**
 * Service de MedicationRequest (a prescrição de um atendimento).
 *
 * Trilha ORM: Agora respaldado pelo PrismaMedicationsRepository
 * através da mesma interface MedicationsRepository.
 */
import { ForbiddenError } from "../errors/HttpError";
import { getEncounterById } from "./encounters.service";
import type { CreateMedicationInput } from "../validation/medications.schemas";
import {
  type MedicationsRepository,
  PrismaMedicationsRepository,
  type Medication,
} from "../repositories/medications.repository";

const defaultRepository: MedicationsRepository = new PrismaMedicationsRepository();

export async function listMedicationsByEncounter(
  encounterId: number,
  repository: MedicationsRepository = defaultRepository,
): Promise<Medication[]> {
  await getEncounterById(encounterId); // 404 se o atendimento não existe

  return repository.findByEncounterId(encounterId);
}

export async function createMedication(
  encounterId: number,
  input: CreateMedicationInput,
  user?: { id: number; role: string },
  repository: MedicationsRepository = defaultRepository,
): Promise<Medication> {
  const encounter = await getEncounterById(encounterId);

  // Regra de domínio da prescrição:
  // Nem admin prescreve (403), e apenas o profissional que registrou pode prescrever.
  if (user) {
    if (user.role !== "profissional") {
      throw new ForbiddenError("Apenas profissionais de saúde podem prescrever.");
    }
    if (encounter.professionalId !== null && encounter.professionalId !== user.id) {
      throw new ForbiddenError("Apenas o profissional que registrou o atendimento pode prescrever nele.");
    }
  }

  return repository.create({
    encounterId,
    medication: input.medication,
    dosage: input.dosage,
  });
}
