import { db } from "../db/database";
import {
    BadRequestError,
    NotFoundError,
    ConflictError,
} from "../errors/HttpError";

export type PatientRow = {
    id: number;
    name: string;
    birth_date: string;
    national_id: string;
    active: number;
};

export type Patient = {
    id: number;
    name: string;
    birthDate: string;
    nationalId: string;
    active: boolean;
};

export function toPatientJson(row: PatientRow): Patient {
    return {
        id: row.id,
        name: row.name,
        birthDate: row.birth_date,
        nationalId: row.national_id,
        active: Boolean(row.active),
    }
};

// Validação do input
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isBlank(value: unknown): boolean {
    return typeof value !== 'string' || value.trim() === '';
}

export function validatePatientInput(body: any): string | null {
    if (isBlank(body?.name)) {
        return "O campo 'nome' é obrigatório.";
    }
    if (isBlank(body?.birthDate) || !ISO_DATE.test(body.birthDate)) {
        return "O campo 'Data de Nascimento' deve ser AAAA-MM-DD.";
    }
    // Validação do CNS
    if (isBlank(body?.nationalId)) {
        return "O campo 'CNS' é obrigatório."
    }
    return null;
    // null = esta tudo certo
}

// Services do paciente
export const patientsService = {
    // Lista todos os pacientes com suporte a filtro de status ativo
    list(active?: string | boolean): Patient[] {
        if (active === "true" || active === true) {
            const rows = db
                .prepare("SELECT id, name, birth_date, national_id, active FROM patients WHERE active = 1 ORDER BY name")
                .all() as PatientRow[];
            return rows.map(toPatientJson);
        }

        if (active === "false" || active === false) {
            const rows = db
                .prepare("SELECT id, name, birth_date, national_id, active FROM patients WHERE active = 0 ORDER BY name")
                .all() as PatientRow[];
            return rows.map(toPatientJson);
        }

        const rows = db
            .prepare("SELECT id, name, birth_date, national_id, active FROM patients ORDER BY name")
            .all() as PatientRow[];
        return rows.map(toPatientJson);
    },

    // Busca paciente por ID
    findById(id: number | string): Patient {
        const row = db
            .prepare("SELECT id, name, birth_date, national_id, active FROM patients WHERE id = ?")
            .get(id) as PatientRow | undefined;

        if (!row) {
            throw new NotFoundError("Paciente não encontrado");
        }

        return toPatientJson(row);
    },

    // Cria um novo paciente
    create(data: { name?: unknown; birthDate?: unknown; nationalId?: unknown; active?: unknown }): Patient {
        const error = validatePatientInput(data);
        if (error) {
            throw new BadRequestError(error);
        }

        const name = String(data.name).trim();
        const birthDate = String(data.birthDate).trim();
        const nationalId = String(data.nationalId).trim();

        // Verifica se o CNS já está cadastrado
        const existingPatient = db
            .prepare("SELECT id FROM patients WHERE national_id = ?")
            .get(nationalId);

        if (existingPatient) {
            throw new ConflictError("Já existe um paciente cadastrado com este CNS.");
        }

        const isActive = typeof data.active === "boolean" ? (data.active ? 1 : 0) : 1;

        const stmt = db.prepare(
            "INSERT INTO patients (name, birth_date, national_id, active) VALUES (?, ?, ?, ?)"
        );

        const result = stmt.run(name, birthDate, nationalId, isActive);

        const newPatient = db
            .prepare("SELECT id, name, birth_date, national_id, active FROM patients WHERE id = ?")
            .get(result.lastInsertRowid) as PatientRow;

        return toPatientJson(newPatient);
    },

    // Remove um paciente e seus atendimentos associados (cascade)
    delete(id: number | string): void {
        const patient = db
            .prepare("SELECT id FROM patients WHERE id = ?")
            .get(id);

        if (!patient) {
            throw new NotFoundError("Paciente não encontrado");
        }

        db.prepare("DELETE FROM patients WHERE id = ?").run(id);
    },

    // Verifica se um paciente existe pelo ID
    exists(id: number | string): boolean {
        const patient = db
            .prepare("SELECT id FROM patients WHERE id = ?")
            .get(id);
        return Boolean(patient);
    },
};