/**
 * ============================================================
 * Service de Patient — a camada que DECIDE.
 * ------------------------------------------------------------
 * Aqui moram: regra de negócio, acesso a dados e a tradução
 * snake_case (banco) -> camelCase (API). Nada de req/res.
 *
 * TODO ARQ-1 — Extrair o Repository de Patient
 * ------------------------------------------------------------
 * Este service DECIDE e também BUSCA — duas responsabilidades.
 * Sua tarefa na trilha ARQ:
 *   1. Criar `repositories/patients.repository.ts` com a
 *      INTERFACE `PatientsRepository` (o "port": findAll,
 *      findById, findByNationalId, create, updatePhoto) e a
 *      implementação `SqlitePatientsRepository` (o "adapter"),
 *      levando TODO o SQL deste arquivo para lá.
 *   2. Este service passa a receber o repository e a conhecer
 *      apenas a interface. O `import { db }` abaixo DESAPARECE.
 * Prova de pronto: `npm run gate` verde E, fechando a trilha,
 * o TODO ARQ-6 (.dependency-cruiser.cjs): a regra que proíbe
 * services de importarem `database` passa a existir — a régua
 * sobe a escada de enforcement junto com o código.
 * ============================================================
 */
import { ConflictError, NotFoundError } from "../errors/HttpError";
import type { CreatePatientInput } from "../validation/patients.schemas";
import {
  type PatientsRepository,
  defaultPatientsRepository,
} from "../repositories/patients.repository";

export async function listPatients(repository: PatientsRepository = defaultPatientsRepository) {
  return await repository.findAll();
}

export async function getPatientById(
  id: number,
  repository: PatientsRepository = defaultPatientsRepository,
) {
  const patient = await repository.findById(id);

  if (!patient) {
    // "Não encontrei" não é problema do servidor: é 404, não 500.
    throw new NotFoundError("Paciente não encontrado.");
  }
  return patient;
}

export async function createPatient(
  input: CreatePatientInput,
  repository: PatientsRepository = defaultPatientsRepository,
) {
  // Invariante N1: CNS único. Deixar o INSERT estourar viraria um
  // 500 mentiroso — o servidor está ótimo; o dado é que repetiu.
  const duplicate = await repository.findByNationalId(input.nationalId);

  if (duplicate) {
    throw new ConflictError("Já existe um paciente com este CNS.");
  }

  // Os `?` são a diferença entre dado e código: o conteúdo de
  // `name` JAMAIS será interpretado como comando SQL.
  return await repository.create(input);
}

export async function setPatientPhoto(
  id: number,
  photoUrl: string,
  repository: PatientsRepository = defaultPatientsRepository,
) {
  await getPatientById(id, repository); // garante o 404 antes de gravar
  return await repository.updatePhoto(id, photoUrl);
}
