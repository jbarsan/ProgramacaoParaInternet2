/**
 * ============================================================
 * Repositório de Patient — Camada Repository (Port & Adapter)
 * ------------------------------------------------------------
 * Porta (interface): PatientsRepository
 * Adaptador SQLite: SqlitePatientsRepository
 * Adaptador Prisma: PrismaPatientsRepository
 *
 * Responsável pelo acesso aos dados de pacientes e pela
 * tradução snake_case (banco) -> camelCase (aplicação).
 * O formato interno do banco NUNCA vaza para o serviço.
 * ============================================================
 */
import { db } from "../database";
import { prisma } from "./prisma";
import type { CreatePatientInput } from "../validation/patients.schemas";

/** Representação de Patient no domínio da aplicação (camelCase). */
export type Patient = {
  id: number;
  name: string;
  birthDate: string;
  nationalId: string;
  photoUrl: string | null;
  active: boolean;
};

/** Formato do registro como retornado pelo SQLite (snake_case). */
type PatientRow = {
  id: number;
  name: string;
  birth_date: string;
  national_id: string;
  photo_url: string | null;
  active: number;
};

/** Tradução banco -> aplicação. O formato interno NUNCA vaza para fora do repositório. */
function toPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    name: row.name,
    birthDate: row.birth_date,
    nationalId: row.national_id,
    photoUrl: row.photo_url,
    active: row.active === 1,
  };
}

const SELECT = "SELECT id, name, birth_date, national_id, photo_url, active FROM patients";

/**
 * Interface PatientsRepository (o Port).
 * O Service depende apenas deste contrato abstrato.
 */
export interface PatientsRepository {
  findAll(): Promise<Patient[]> | Patient[];
  findById(id: number): Promise<Patient | null> | Patient | null;
  findByNationalId(nationalId: string): Promise<Patient | null> | Patient | null;
  create(input: CreatePatientInput): Promise<Patient> | Patient;
  updatePhoto(id: number, photoUrl: string): Promise<Patient> | Patient;
}

/**
 * Implementação SQLite de PatientsRepository (o Adapter legacy).
 */
export class SqlitePatientsRepository implements PatientsRepository {
  findAll(): Patient[] {
    const rows = db.prepare(`${SELECT} ORDER BY name`).all() as PatientRow[];
    return rows.map(toPatient);
  }

  findById(id: number): Patient | null {
    const row = db.prepare(`${SELECT} WHERE id = ?`).get(id) as PatientRow | undefined;
    return row ? toPatient(row) : null;
  }

  findByNationalId(nationalId: string): Patient | null {
    const row = db.prepare(`${SELECT} WHERE national_id = ?`).get(nationalId) as PatientRow | undefined;
    return row ? toPatient(row) : null;
  }

  create(input: CreatePatientInput): Patient {
    const result = db
      .prepare(
        `INSERT INTO patients (name, birth_date, national_id, active)
         VALUES (?, ?, ?, 1)`,
      )
      .run(input.name, input.birthDate, input.nationalId);

    const created = this.findById(Number(result.lastInsertRowid));
    if (!created) {
      throw new Error("Falha ao recuperar o paciente recém-criado.");
    }
    return created;
  }

  updatePhoto(id: number, photoUrl: string): Patient {
    db.prepare("UPDATE patients SET photo_url = ? WHERE id = ?").run(photoUrl, id);
    const updated = this.findById(id);
    if (!updated) {
      throw new Error("Falha ao recuperar o paciente após atualização de foto.");
    }
    return updated;
  }
}

/**
 * Implementação Prisma de PatientsRepository (Adapter ORM).
 */
export class PrismaPatientsRepository implements PatientsRepository {
  async findAll(): Promise<Patient[]> {
    const rows = await prisma.patient.findMany({
      orderBy: { name: "asc" },
    });
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      birthDate: row.birthDate,
      nationalId: row.nationalId,
      photoUrl: row.photoUrl,
      active: row.active === 1,
    }));
  }

  async findById(id: number): Promise<Patient | null> {
    const row = await prisma.patient.findUnique({
      where: { id },
    });
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      birthDate: row.birthDate,
      nationalId: row.nationalId,
      photoUrl: row.photoUrl,
      active: row.active === 1,
    };
  }

  async findByNationalId(nationalId: string): Promise<Patient | null> {
    const row = await prisma.patient.findUnique({
      where: { nationalId },
    });
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      birthDate: row.birthDate,
      nationalId: row.nationalId,
      photoUrl: row.photoUrl,
      active: row.active === 1,
    };
  }

  async create(input: CreatePatientInput): Promise<Patient> {
    const row = await prisma.patient.create({
      data: {
        name: input.name,
        birthDate: input.birthDate,
        nationalId: input.nationalId,
        active: 1,
      },
    });
    return {
      id: row.id,
      name: row.name,
      birthDate: row.birthDate,
      nationalId: row.nationalId,
      photoUrl: row.photoUrl,
      active: row.active === 1,
    };
  }

  async updatePhoto(id: number, photoUrl: string): Promise<Patient> {
    const row = await prisma.patient.update({
      where: { id },
      data: { photoUrl },
    });
    return {
      id: row.id,
      name: row.name,
      birthDate: row.birthDate,
      nationalId: row.nationalId,
      photoUrl: row.photoUrl,
      active: row.active === 1,
    };
  }
}

/** Instância padrão configurada para o repositório Prisma. */
export const defaultPatientsRepository: PatientsRepository = new PrismaPatientsRepository();
