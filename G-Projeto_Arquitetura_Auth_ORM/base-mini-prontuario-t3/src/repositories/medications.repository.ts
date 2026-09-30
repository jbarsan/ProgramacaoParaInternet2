/**
 * ============================================================
 * Repositório de MedicationRequest — Camada Repository (Port & Adapter)
 * ------------------------------------------------------------
 * Porta (interface): MedicationsRepository
 * Adaptador (implementação SQLite): SqliteMedicationsRepository
 *
 * Responsável pelo acesso aos dados de medicamentos/prescrições
 * e pela tradução snake_case (banco) -> camelCase (aplicação).
 * O formato interno do banco NUNCA vaza para o serviço.
 * ============================================================
 */
import { db } from "../database";
import type { CreateMedicationInput } from "../validation/medications.schemas";

/** Representação de Medication no domínio da aplicação (camelCase). */
export type Medication = {
  id: number;
  encounterId: number;
  medication: string;
  dosage: string;
};

/** Formato do registro retornado pelo SQLite (snake_case). */
type MedicationRow = {
  id: number;
  encounter_id: number;
  medication: string;
  dosage: string;
};

/** Tradução banco -> aplicação. O formato interno NUNCA vaza para fora do repositório. */
function toMedication(row: MedicationRow): Medication {
  return {
    id: row.id,
    encounterId: row.encounter_id,
    medication: row.medication,
    dosage: row.dosage,
  };
}

const SELECT = "SELECT id, encounter_id, medication, dosage FROM medication_requests";

/**
 * Interface MedicationsRepository (o Port).
 * O Service depende apenas deste contrato abstrato.
 */
export interface MedicationsRepository {
  findByEncounterId(encounterId: number): Medication[];
  findById(id: number): Medication | null;
  create(encounterId: number, input: CreateMedicationInput): Medication;
}

/**
 * Implementação SQLite de MedicationsRepository (o Adapter).
 * Único ponto onde mora o SQL de prescrições e o acesso ao driver do banco.
 */
export class SqliteMedicationsRepository implements MedicationsRepository {
  findByEncounterId(encounterId: number): Medication[] {
    const rows = db
      .prepare(`${SELECT} WHERE encounter_id = ? ORDER BY id`)
      .all(encounterId) as MedicationRow[];

    return rows.map(toMedication);
  }

  findById(id: number): Medication | null {
    const row = db.prepare(`${SELECT} WHERE id = ?`).get(id) as MedicationRow | undefined;
    return row ? toMedication(row) : null;
  }

  create(encounterId: number, input: CreateMedicationInput): Medication {
    const result = db
      .prepare(
        `INSERT INTO medication_requests (encounter_id, medication, dosage)
         VALUES (?, ?, ?)`,
      )
      .run(encounterId, input.medication, input.dosage);

    const created = this.findById(Number(result.lastInsertRowid));
    if (!created) {
      throw new Error("Falha ao recuperar a prescrição recém-criada.");
    }
    return created;
  }
}

/** Instância padrão para uso padrão nos services. */
export const defaultMedicationsRepository = new SqliteMedicationsRepository();
