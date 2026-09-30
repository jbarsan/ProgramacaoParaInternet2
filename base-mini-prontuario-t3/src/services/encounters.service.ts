/**
 * Service de Encounter.
 *
 * Trilha ORM: Agora respaldado pelo PrismaEncountersRepository
 * através da mesma interface EncountersRepository.
 *
 * TODO AUTH-8 — (parte NÃO guiada) quando `professional_id`
 * existir em encounters, `createEncounter` passa a registrar
 * QUEM registrou — e nasce aqui a regra de domínio da matriz
 * de permissões que middleware nenhum resolve sozinho.
 */
import { NotFoundError } from "../errors/HttpError";
import { getPatientById } from "./patients.service";
import type { CreateEncounterInput } from "../validation/encounters.schemas";
import {
  type EncountersRepository,
  PrismaEncountersRepository,
  type Encounter,
} from "../repositories/encounters.repository";

const defaultRepository: EncountersRepository = new PrismaEncountersRepository();

export async function listEncountersByPatient(
  patientId: number,
  repository: EncountersRepository = defaultRepository,
): Promise<Encounter[]> {
  await getPatientById(patientId); // 404 se o paciente não existe
  return repository.findByPatientId(patientId);
}

export async function getEncounterById(
  id: number,
  repository: EncountersRepository = defaultRepository,
): Promise<Encounter> {
  const encounter = await repository.findById(id);
  if (!encounter) {
    throw new NotFoundError("Atendimento não encontrado.");
  }
  return encounter;
}

export async function createEncounter(
  patientId: number,
  input: CreateEncounterInput,
  professionalId?: number | null,
  repository: EncountersRepository = defaultRepository,
): Promise<Encounter> {
  await getPatientById(patientId);

  return repository.create({
    patientId,
    professionalId: professionalId ?? null,
    startedAt: input.startedAt,
    chiefComplaint: input.chiefComplaint,
    notes: input.notes,
  });
}
