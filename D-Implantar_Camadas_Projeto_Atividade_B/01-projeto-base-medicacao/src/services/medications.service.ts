import { db } from "../db/database";
import {
    BadRequestError,
    NotFoundError,
    ConflictError,
} from "../errors/HttpError";

export type MedicationRow = {
    id: number;
    patient_name: string;
    medication_name: string;
    dosage: string;
    route: string;
    scheduled_at: string;
    notes: string | null;
};

export type Medication = {
    id: number;
    patientName: string;
    medicationName: string;
    dosage: string;
    route: string;
    scheduledAt: string;
    notes: string | null;
};

export function toMedicationJson(row: MedicationRow): Medication {
    return {
        id: row.id,
        patientName: row.patient_name,
        medicationName: row.medication_name,
        dosage: row.dosage,
        route: row.route,
        scheduledAt: row.scheduled_at,
        notes: row.notes,
    };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function isBlank(value: unknown): boolean {
    return typeof value !== "string" || value.trim().length === 0;
}

export function validateMedicationInput(body: any): string | null {
    if (isBlank(body?.patientName)) return "Nome do paciente é obrigatório.";
    if (isBlank(body?.medicationName)) return "Nome do medicamento é obrigatório.";
    if (isBlank(body?.dosage)) return "Dosagem é obrigatória.";
    if (isBlank(body?.route)) return "Via de administração é obrigatória.";

    if (isBlank(body?.scheduledAt) || !ISO_DATE.test(body.scheduledAt)) {
        return "Horário previsto inválido (formato esperado: AAAA-MM-DDTHH:MM).";
    }

    return null;
}

export const medicationsService = {
    list(): Medication[] {
        const rows = db
            .prepare(`
                SELECT id, patient_name, medication_name, dosage, route, scheduled_at, notes
                FROM medication_orders
                ORDER BY scheduled_at ASC
            `)
            .all() as MedicationRow[];

        return rows.map(toMedicationJson);
    },

    findById(id: number | string): Medication {
        const row = db
            .prepare(`
                SELECT id, patient_name, medication_name, dosage, route, scheduled_at, notes
                FROM medication_orders
                WHERE id = ?
            `)
            .get(id) as MedicationRow | undefined;

        if (!row) {
            throw new NotFoundError("Prescrição não encontrada.");
        }

        return toMedicationJson(row);
    },

    create(data: {
        patientName?: unknown;
        medicationName?: unknown;
        dosage?: unknown;
        route?: unknown;
        scheduledAt?: unknown;
        notes?: unknown;
    }): Medication {
        const problem = validateMedicationInput(data);
        if (problem) {
            throw new BadRequestError(problem);
        }

        const patientName = String(data.patientName).trim();
        const medicationName = String(data.medicationName).trim();
        const dosage = String(data.dosage).trim();
        const route = String(data.route).trim();
        const scheduledAt = String(data.scheduledAt).trim();
        const notes = typeof data.notes === "string" && data.notes.trim().length > 0
            ? data.notes.trim()
            : null;

        const result = db
            .prepare(`
                INSERT INTO medication_orders (patient_name, medication_name, dosage, route, scheduled_at, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            `)
            .run(patientName, medicationName, dosage, route, scheduledAt, notes);

        const created = db
            .prepare(`
                SELECT id, patient_name, medication_name, dosage, route, scheduled_at, notes
                FROM medication_orders
                WHERE id = ?
            `)
            .get(result.lastInsertRowid) as MedicationRow;

        return toMedicationJson(created);
    },

    delete(id: number | string): void {
        const result = db
            .prepare("DELETE FROM medication_orders WHERE id = ?")
            .run(id);

        if (result.changes === 0) {
            throw new NotFoundError("Prescrição não encontrada.");
        }
    },

    exists(id: number | string): boolean {
        const row = db
            .prepare("SELECT id FROM medication_orders WHERE id = ?")
            .get(id);
        return Boolean(row);
    },
};

export const medicationService = medicationsService;