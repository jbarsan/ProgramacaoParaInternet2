/**
 * Repository de MedicationRequest (Port, SQLite Adapter & Prisma Adapter).
 *
 * Contrato (interface) que o service enxerga + implementações concretas
 * (SQLite clássico e Prisma ORM).
 */
import { db } from "../database";
import { prisma } from "./prisma";

export type Medication = {
  id: number;
  encounterId: number;
  medication: string;
  dosage: string;
};

export type CreateMedicationData = {
  encounterId: number;
  medication: string;
  dosage: string;
};

export interface MedicationsRepository {
  findByEncounterId(encounterId: number): Promise<Medication[]>;
  findById(id: number): Promise<Medication | null>;
  create(data: CreateMedicationData): Promise<Medication>;
}

type MedicationRow = {
  id: number;
  encounter_id: number;
  medication: string;
  dosage: string;
};

function toMedicationJson(row: MedicationRow): Medication {
  return {
    id: row.id,
    encounterId: row.encounter_id,
    medication: row.medication,
    dosage: row.dosage,
  };
}

const SELECT = "SELECT id, encounter_id, medication, dosage FROM medication_requests";

export class SqliteMedicationsRepository implements MedicationsRepository {
  async findByEncounterId(encounterId: number): Promise<Medication[]> {
    const rows = db
      .prepare(`${SELECT} WHERE encounter_id = ? ORDER BY id`)
      .all(encounterId) as MedicationRow[];

    return rows.map(toMedicationJson);
  }

  async findById(id: number): Promise<Medication | null> {
    const row = db.prepare(`${SELECT} WHERE id = ?`).get(id) as MedicationRow | undefined;
    return row ? toMedicationJson(row) : null;
  }

  async create(data: CreateMedicationData): Promise<Medication> {
    const result = db
      .prepare(
        `INSERT INTO medication_requests (encounter_id, medication, dosage)
         VALUES (?, ?, ?)`,
      )
      .run(data.encounterId, data.medication, data.dosage);

    const created = await this.findById(Number(result.lastInsertRowid));
    if (!created) {
      throw new Error("Erro ao criar prescrição.");
    }
    return created;
  }
}

export class PrismaMedicationsRepository implements MedicationsRepository {
  async findByEncounterId(encounterId: number): Promise<Medication[]> {
    const rows = await prisma.medicationRequest.findMany({
      where: { encounterId },
      orderBy: { id: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      encounterId: r.encounterId,
      medication: r.medication,
      dosage: r.dosage,
    }));
  }

  async findById(id: number): Promise<Medication | null> {
    const r = await prisma.medicationRequest.findUnique({ where: { id } });
    if (!r) return null;
    return {
      id: r.id,
      encounterId: r.encounterId,
      medication: r.medication,
      dosage: r.dosage,
    };
  }

  async create(data: CreateMedicationData): Promise<Medication> {
    const r = await prisma.medicationRequest.create({
      data: {
        encounterId: data.encounterId,
        medication: data.medication,
        dosage: data.dosage,
      },
    });
    return {
      id: r.id,
      encounterId: r.encounterId,
      medication: r.medication,
      dosage: r.dosage,
    };
  }
}
