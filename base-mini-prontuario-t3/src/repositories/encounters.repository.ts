/**
 * Repository de Encounter (Port, SQLite Adapter & Prisma Adapter).
 *
 * Contrato (interface) que o service enxerga + implementações concretas
 * (SQLite clássico e Prisma ORM).
 */
import { db } from "../database";
import { prisma } from "./prisma";

export type Encounter = {
  id: number;
  patientId: number;
  professionalId: number | null;
  startedAt: string;
  chiefComplaint: string;
  notes: string | null;
};

export type CreateEncounterData = {
  patientId: number;
  professionalId?: number | null;
  startedAt: string;
  chiefComplaint: string;
  notes?: string | null;
};

export interface EncountersRepository {
  findByPatientId(patientId: number): Promise<Encounter[]>;
  findById(id: number): Promise<Encounter | null>;
  create(data: CreateEncounterData): Promise<Encounter>;
}

type EncounterRow = {
  id: number;
  patient_id: number;
  professional_id?: number | null;
  started_at: string;
  chief_complaint: string;
  notes: string | null;
};

function toEncounterJson(row: EncounterRow): Encounter {
  return {
    id: row.id,
    patientId: row.patient_id,
    professionalId: row.professional_id ?? null,
    startedAt: row.started_at,
    chiefComplaint: row.chief_complaint,
    notes: row.notes,
  };
}

const SELECT = "SELECT id, patient_id, professional_id, started_at, chief_complaint, notes FROM encounters";

export class SqliteEncountersRepository implements EncountersRepository {
  async findByPatientId(patientId: number): Promise<Encounter[]> {
    const rows = db
      .prepare(`${SELECT} WHERE patient_id = ? ORDER BY started_at DESC`)
      .all(patientId) as EncounterRow[];

    return rows.map(toEncounterJson);
  }

  async findById(id: number): Promise<Encounter | null> {
    const row = db.prepare(`${SELECT} WHERE id = ?`).get(id) as EncounterRow | undefined;
    return row ? toEncounterJson(row) : null;
  }

  async create(data: CreateEncounterData): Promise<Encounter> {
    const result = db
      .prepare(
        `INSERT INTO encounters (patient_id, professional_id, started_at, chief_complaint, notes)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(data.patientId, data.professionalId ?? null, data.startedAt, data.chiefComplaint, data.notes ?? null);

    const created = await this.findById(Number(result.lastInsertRowid));
    if (!created) {
      throw new Error("Erro ao criar atendimento.");
    }
    return created;
  }
}

export class PrismaEncountersRepository implements EncountersRepository {
  async findByPatientId(patientId: number): Promise<Encounter[]> {
    const rows = await prisma.encounter.findMany({
      where: { patientId },
      orderBy: { startedAt: "desc" },
    });
    return rows.map((r) => ({
      id: r.id,
      patientId: r.patientId,
      professionalId: r.professionalId,
      startedAt: r.startedAt,
      chiefComplaint: r.chiefComplaint,
      notes: r.notes,
    }));
  }

  async findById(id: number): Promise<Encounter | null> {
    const r = await prisma.encounter.findUnique({ where: { id } });
    if (!r) return null;
    return {
      id: r.id,
      patientId: r.patientId,
      professionalId: r.professionalId,
      startedAt: r.startedAt,
      chiefComplaint: r.chiefComplaint,
      notes: r.notes,
    };
  }

  async create(data: CreateEncounterData): Promise<Encounter> {
    const r = await prisma.encounter.create({
      data: {
        patientId: data.patientId,
        professionalId: data.professionalId ?? null,
        startedAt: data.startedAt,
        chiefComplaint: data.chiefComplaint,
        notes: data.notes ?? null,
      },
    });
    return {
      id: r.id,
      patientId: r.patientId,
      professionalId: r.professionalId,
      startedAt: r.startedAt,
      chiefComplaint: r.chiefComplaint,
      notes: r.notes,
    };
  }
}
