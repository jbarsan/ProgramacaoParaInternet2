/**
 * Service de Encounter.
 *
 * TODO ARQ-2 — mesmo movimento do ARQ-1: extrair
 * `repositories/encounters.repository.ts` (interface + adapter
 * SQLite) e remover o `import { db }` daqui.
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
  defaultEncountersRepository,
} from "../repositories/encounters.repository";

export async function listEncountersByPatient(
  patientId: number,
  repository: EncountersRepository = defaultEncountersRepository,
) {
  await getPatientById(patientId); // 404 se o paciente não existe

  // Ordenamos no SQL: o banco tem índice e o dado chega pronto.
  return await repository.findByPatientId(patientId);
}

export async function getEncounterById(
  id: number,
  repository: EncountersRepository = defaultEncountersRepository,
) {
  const encounter = await repository.findById(id);
  if (!encounter) {
    throw new NotFoundError("Atendimento não encontrado.");
  }
  return encounter;
}

export async function createEncounter(
  patientId: number,
  input: CreateEncounterInput,
  repository: EncountersRepository = defaultEncountersRepository,
) {
  await getPatientById(patientId);

  return await repository.create(patientId, input);
}
