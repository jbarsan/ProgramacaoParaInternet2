/**
 * ============================================================
 * Repositório de Encounter — Camada Repository (Port & Adapter)
 * ------------------------------------------------------------
 * Porta (interface): EncountersRepository
 * Adaptador SQLite: SqliteEncountersRepository
 * Adaptador Prisma: PrismaEncountersRepository
 *
 * Responsável pelo acesso aos dados de atendimentos e pela
 * tradução snake_case (banco) -> camelCase (aplicação).
 * O formato interno do banco NUNCA vaza para o serviço.
 * ============================================================
 */
import { db } from "../database";
import { prisma } from "./prisma";
import type { CreateEncounterInput } from "../validation/encounters.schemas";

/** Representação de Encounter no domínio da aplicação (camelCase). */
export type Encounter = {
  id: number;
  patientId: number;
  professionalId?: number | null;
  startedAt: string;
  chiefComplaint: string;
  notes: string | null;
};

/** Formato do registro retornado pelo SQLite (snake_case). */
type EncounterRow = {
  id: number;
  patient_id: number;
  professional_id?: number | null;
  started_at: string;
  chief_complaint: string;
  notes: string | null;
};

/** Tradução banco -> aplicação. O formato interno NUNCA vaza para fora do repositório. */
function toEncounter(row: EncounterRow): Encounter {
  return {
    id: row.id,
    patientId: row.patient_id,
    professionalId: row.professional_id ?? null,
    startedAt: row.started_at,
    chiefComplaint: row.chief_complaint,
    notes: row.notes,
  };
}

const SELECT = "SELECT id, patient_id, started_at, chief_complaint, notes FROM encounters";

/**
 * Interface EncountersRepository (o Port).
 * O Service depende apenas deste contrato abstrato.
 */
export interface EncountersRepository {
  findByPatientId(patientId: number): Promise<Encounter[]> | Encounter[];
  findById(id: number): Promise<Encounter | null> | Encounter | null;
  create(patientId: number, input: CreateEncounterInput, professionalId?: number): Promise<Encounter> | Encounter;
}

/**
 * Implementação SQLite de EncountersRepository (o Adapter legacy).
 */
export class SqliteEncountersRepository implements EncountersRepository {
  findByPatientId(patientId: number): Encounter[] {
    const rows = db
      .prepare(`${SELECT} WHERE patient_id = ? ORDER BY started_at DESC`)
      .all(patientId) as EncounterRow[];

    return rows.map(toEncounter);
  }

  findById(id: number): Encounter | null {
    const row = db.prepare(`${SELECT} WHERE id = ?`).get(id) as EncounterRow | undefined;
    return row ? toEncounter(row) : null;
  }

  create(patientId: number, input: CreateEncounterInput): Encounter {
    const result = db
      .prepare(
        `INSERT INTO encounters (patient_id, started_at, chief_complaint, notes)
         VALUES (?, ?, ?, ?)`,
      )
      .run(patientId, input.startedAt, input.chiefComplaint, input.notes ?? null);

    const created = this.findById(Number(result.lastInsertRowid));
    if (!created) {
      throw new Error("Falha ao recuperar o atendimento recém-criado.");
    }
    return created;
  }
}

/**
 * Implementação Prisma de EncountersRepository (Adapter ORM).
 */
export class PrismaEncountersRepository implements EncountersRepository {
  async findByPatientId(patientId: number): Promise<Encounter[]> {
    const rows = await prisma.encounter.findMany({
      where: { patientId },
      orderBy: { startedAt: "desc" },
    });
    return rows.map((row) => ({
      id: row.id,
      patientId: row.patientId,
      professionalId: row.professionalId,
      startedAt: row.startedAt,
      chiefComplaint: row.chiefComplaint,
      notes: row.notes,
    }));
  }

  async findById(id: number): Promise<Encounter | null> {
    const row = await prisma.encounter.findUnique({
      where: { id },
    });
    if (!row) return null;
    return {
      id: row.id,
      patientId: row.patientId,
      professionalId: row.professionalId,
      startedAt: row.startedAt,
      chiefComplaint: row.chiefComplaint,
      notes: row.notes,
    };
  }

  async create(patientId: number, input: CreateEncounterInput, professionalId?: number): Promise<Encounter> {
    const row = await prisma.encounter.create({
      data: {
        patientId,
        professionalId: professionalId ?? null,
        startedAt: input.startedAt,
        chiefComplaint: input.chiefComplaint,
        notes: input.notes ?? null,
      },
    });
    return {
      id: row.id,
      patientId: row.patientId,
      professionalId: row.professionalId,
      startedAt: row.startedAt,
      chiefComplaint: row.chiefComplaint,
      notes: row.notes,
    };
  }
}

/** Instância padrão configurada para o repositório Prisma. */
export const defaultEncountersRepository: EncountersRepository = new PrismaEncountersRepository();
