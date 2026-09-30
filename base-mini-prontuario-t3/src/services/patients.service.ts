/**
 * ============================================================
 * Service de Patient — a camada que DECIDE.
 * ------------------------------------------------------------
 * Aqui moram: regra de negócio e chamadas ao repository.
 * Nada de SQL, nada de req/res.
 *
 * Trilha ORM: Agora respaldado pelo PrismaPatientsRepository
 * através da mesma interface PatientsRepository.
 * ============================================================
 */
import { ConflictError, NotFoundError } from "../errors/HttpError";
import type { CreatePatientInput } from "../validation/patients.schemas";
import {
  type PatientsRepository,
  PrismaPatientsRepository,
  type Patient,
} from "../repositories/patients.repository";

const defaultRepository: PatientsRepository = new PrismaPatientsRepository();

export async function listPatients(
  repository: PatientsRepository = defaultRepository,
): Promise<Patient[]> {
  return repository.findAll();
}

export async function getPatientById(
  id: number,
  repository: PatientsRepository = defaultRepository,
): Promise<Patient> {
  const patient = await repository.findById(id);

  if (!patient) {
    // "Não encontrei" não é problema do servidor: é 404, não 500.
    throw new NotFoundError("Paciente não encontrado.");
  }
  return patient;
}

export async function createPatient(
  input: CreatePatientInput,
  repository: PatientsRepository = defaultRepository,
): Promise<Patient> {
  // Invariante N1: CNS único. Deixar o INSERT estourar viraria um
  // 500 mentiroso — o servidor está ótimo; o dado é que repetiu.
  const duplicate = await repository.findByNationalId(input.nationalId);

  if (duplicate) {
    throw new ConflictError("Já existe um paciente com este CNS.");
  }

  return repository.create(input);
}

export async function setPatientPhoto(
  id: number,
  photoUrl: string,
  repository: PatientsRepository = defaultRepository,
): Promise<Patient> {
  await getPatientById(id, repository); // garante o 404 antes de gravar
  const updated = await repository.updatePhoto(id, photoUrl);
  if (!updated) {
    throw new NotFoundError("Paciente não encontrado.");
  }
  return updated;
}
