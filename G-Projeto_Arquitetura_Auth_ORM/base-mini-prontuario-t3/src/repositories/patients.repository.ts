/**
 * ============================================================
 * Repositório de Patient — Camada Repository (Port & Adapter)
 * ------------------------------------------------------------
 * Porta (interface): PatientsRepository
 * Adaptador (implementação SQLite): SqlitePatientsRepository
 *
 * Responsável pelo acesso aos dados de pacientes e pela
 * tradução snake_case (banco) -> camelCase (aplicação).
 * O formato interno do banco NUNCA vaza para o serviço.
 * ============================================================
 */
import { db } from "../database";
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
  findAll(): Patient[];
  findById(id: number): Patient | null;
  findByNationalId(nationalId: string): Patient | null;
  create(input: CreatePatientInput): Patient;
  updatePhoto(id: number, photoUrl: string): Patient;
}

/**
 * Implementação SQLite de PatientsRepository (o Adapter).
 * Único ponto onde mora o SQL de pacientes e o acesso ao driver do banco.
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
    // Os `?` garantem query parametrizada contra SQL injection.
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

/** Instância padrão para uso padrão nos services. */
export const defaultPatientsRepository = new SqlitePatientsRepository();
