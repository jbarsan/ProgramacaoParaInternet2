import { db } from "../db/database";
import { BadRequestError, NotFoundError } from "../errors/HttpError";
import { patientsService } from "./patients.service";

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
    notes?: string | null;
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

// Validação do input de atendimento
const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function isBlank(value: unknown): boolean {
    return typeof value !== 'string' || value.trim() === '';
}

export function validateEncounterInput(body: any): string | null {
    if (isBlank(body?.startedAt) || !ISO_DATETIME.test(body.startedAt)) {
        return "O campo 'Data e Hora' deve estar no formato AAAA-MM-DDTHH:MM.";
    }
    if (isBlank(body?.chiefComplaint)) {
        return "O campo 'Queixa Principal' é obrigatório.";
    }
    return null;
}

// Services de atendimentos
export const encountersService = {
    // Lista atendimentos de um paciente específico
    listByPatient(patientId: number | string): Encounter[] {
        if (!patientsService.exists(patientId)) {
            throw new NotFoundError("Paciente não encontrado");
        }

        const rows = db
            .prepare(
                "SELECT id, patient_id, started_at, chief_complaint, notes FROM encounters WHERE patient_id = ? ORDER BY started_at DESC"
            )
            .all(patientId) as EncounterRow[];

        return rows.map(toEncounterJson);
    },

    // Registra novo atendimento para um paciente
    create(
        patientId: number | string,
        data: { startedAt?: unknown; chiefComplaint?: unknown; notes?: unknown }
    ): Encounter {
        if (!patientsService.exists(patientId)) {
            throw new NotFoundError("Paciente não encontrado");
        }

        const error = validateEncounterInput(data);
        if (error) {
            throw new BadRequestError(error);
        }

        const startedAt = String(data.startedAt).trim();
        const chiefComplaint = String(data.chiefComplaint).trim();
        const notes =
            data.notes && typeof data.notes === "string"
                ? data.notes.trim()
                : (data.notes ? String(data.notes) : null);

        const stmt = db.prepare(
            "INSERT INTO encounters (patient_id, started_at, chief_complaint, notes) VALUES (?, ?, ?, ?)"
        );

        const result = stmt.run(patientId, startedAt, chiefComplaint, notes);

        const newEncounter = db
            .prepare(
                "SELECT id, patient_id, started_at, chief_complaint, notes FROM encounters WHERE id = ?"
            )
            .get(result.lastInsertRowid) as EncounterRow;

        return toEncounterJson(newEncounter);
    },

    // Busca um atendimento por ID
    findById(id: number | string): Encounter {
        const row = db
            .prepare(
                "SELECT id, patient_id, started_at, chief_complaint, notes FROM encounters WHERE id = ?"
            )
            .get(id) as EncounterRow | undefined;

        if (!row) {
            throw new NotFoundError("Atendimento não encontrado");
        }

        return toEncounterJson(row);
    },

    // Remove um atendimento pelo ID
    delete(id: number | string): void {
        const encounter = db
            .prepare("SELECT id FROM encounters WHERE id = ?")
            .get(id);

        if (!encounter) {
            throw new NotFoundError("Atendimento não encontrado");
        }

        db.prepare("DELETE FROM encounters WHERE id = ?").run(id);
    },
};
