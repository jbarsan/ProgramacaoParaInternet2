/**
 * ============================================================
 * TODO 6 -- Service de Encounter
 * ============================================================
 * Migre para ca: a verificacao patientExists, a query de list
 * (ordenada por started_at DESC), a validacao + insert de
 * create, e a funcao toEncounterJson.
 *
 *   export const encountersService = {
 *     list(patientId: string) { ... },
 *     create(patientId: string, data: { startedAt: string; chiefComplaint: string; notes?: string }) { ... },
 *   };
 * ============================================================
 */

import { db } from "../db/database.ts";

export type EncounterRow = {
    id: number;
    patient_id: number;
    started_at: string;
    chief_complaint: string;
    notes: string | null;
};

export type Encounter = {
    id: number;
    patientId: number;
    startedAt: string;
    chiefComplaint: string;
    notes: string | null;
};

export function toEncounterJson(row: EncounterRow): Encounter {
    return {
        id: row.id,
        patientId: row.patient_id,
        startedAt: row.started_at,
        chiefComplaint: row.chief_complaint,
        notes: row.notes,
    };
}

const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function isBlank(value: unknown): boolean {
    return typeof value !== "string" || value.trim() === "";
}

function patientExists(id: string): boolean {
    return db.prepare("SELECT 1 FROM patients WHERE id = ?").get(id) !== undefined;
}

// Implementação do Service de Encounter
export const encountersService = {
    // Lista os atendimentos de um paciente
    list(patientId: string): Encounter[] | null {
        if (!patientExists(patientId)) {
            return null;
        }

        const rows = db
            .prepare(
                `SELECT id, patient_id, started_at, chief_complaint, notes
                 FROM encounters
                 WHERE patient_id = ?
                 ORDER BY started_at DESC`
            )
            .all(patientId) as EncounterRow[];

        return rows.map(toEncounterJson);
    },

    // Cria um atendimento para um paciente
    create(patientId: string, data: { startedAt: string; chiefComplaint: string; notes?: string | null }): Encounter {
        if (!patientExists(patientId)) {
            const error = new Error("Paciente nao encontrado.") as Error & { status?: number };
            error.status = 404;
            throw error;
        }

        const { startedAt, chiefComplaint, notes } = data ?? {};

        if (isBlank(chiefComplaint)) {
            const error = new Error("O campo 'chiefComplaint' e obrigatorio.") as Error & { status?: number };
            error.status = 400;
            throw error;
        }

        if (isBlank(startedAt) || !ISO_DATE_TIME.test(startedAt)) {
            const error = new Error("O campo 'startedAt' e obrigatorio no formato AAAA-MM-DDTHH:MM.") as Error & { status?: number };
            error.status = 400;
            throw error;
        }

        const result = db
            .prepare(
                `INSERT INTO encounters (patient_id, started_at, chief_complaint, notes)
                 VALUES (?, ?, ?, ?)`
            )
            .run(patientId, startedAt, chiefComplaint.trim(), isBlank(notes) ? null : notes!.trim());

        const created = db
            .prepare(
                `SELECT id, patient_id, started_at, chief_complaint, notes
                 FROM encounters WHERE id = ?`
            )
            .get(result.lastInsertRowid) as EncounterRow;

        return toEncounterJson(created);
    },
};