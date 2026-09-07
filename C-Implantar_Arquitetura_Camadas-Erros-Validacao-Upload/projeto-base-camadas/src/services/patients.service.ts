/**
 * ============================================================
 * TODO 3 -- Service de Patient
 * ============================================================
 * O Service e onde mora a regra de negocio de verdade: o SQL
 * (db.prepare), a checagem de CNS duplicado (409), a traducao
 * snake_case -> camelCase (toPatientJson).
 *
 * O Service NUNCA:
 *   - conhece req/res (nao sabe que existe HTTP)
 *   - formata resposta HTTP
 *
 * Quando algo da errado (paciente nao encontrado, CNS
 * duplicado), por enquanto o Service pode continuar devolvendo
 * um valor especial (ex.: null) OU lancando um Error comum --
 * a hierarquia HttpError chega no TODO 8 (Encontro 2). Combine
 * com a dupla como vao sinalizar "nao encontrado" antes disso
 * existir.
 *
 * Migre para ca: a query de list, a query de getById, a
 * checagem de duplicata + insert de create, e a funcao
 * toPatientJson (que hoje esta em server.ts).
 *
 * Dica de assinatura:
 *   export const patientsService = {
 *     list() { ... },
 *     getById(id: string) { ... },
 *     create(data: { name: string; birthDate: string; nationalId: string }) { ... },
 *   };
 * ============================================================
 */
import { db } from "../db/database.ts";

export type PatientRow = {
    id: number;
    name: string;
    birth_date: string;
    national_id: string;
    active: number;
    photo_path: string | null;
};

export type Patient = {
    id: number;
    name: string;
    birthDate: string;
    nationalId: string;
    active: boolean;
    photoUrl: string | null;
};

export function toPatientJson(row: PatientRow): Patient {
    return {
        id: row.id,
        name: row.name,
        birthDate: row.birth_date,
        nationalId: row.national_id,
        active: row.active === 1,
        photoUrl: row.photo_path,
    };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isBlank(value: unknown): boolean {
    return typeof value !== "string" || value.trim() === "";
}

export function validatePatientInput(body: any): string | null {
    if (isBlank(body?.name)) {
        return "O campo 'name' e obrigatorio e nao pode ser vazio.";
    }
    if (isBlank(body?.birthDate) || !ISO_DATE.test(body.birthDate)) {
        return "O campo 'birthDate' e obrigatorio e deve estar no formato AAAA-MM-DD.";
    }
    if (isBlank(body?.nationalId)) {
        return "O campo 'nationalId' e obrigatorio.";
    }
    return null;
}

// Implementação do Service de Patient
export const patientsService = {

    // Lista todos os pacientes
    list(): Patient[] {
        const rows = db
            .prepare("SELECT id, name, birth_date, national_id, active, photo_path FROM patients ORDER BY name")
            .all() as PatientRow[];

        return rows.map(toPatientJson); // Service não reconhece request e response
    },

    // Busca um paciente pelo id
    getById(id: string | number): Patient | null {
        const row = db
            .prepare("SELECT id, name, birth_date, national_id, active, photo_path FROM patients WHERE id = ?")
            .get(id) as PatientRow | undefined;

        if (!row) {
            return null;
        }

        return toPatientJson(row);
    },

    // Cria um paciente
    create(data: { name: string; birthDate: string; nationalId: string }): Patient {
        const problem = validatePatientInput(data);
        if (problem) {
            const error = new Error(problem) as Error & { status?: number };
            error.status = 400;
            throw error;
        }

        const { name, birthDate, nationalId } = data;

        const duplicate = db
            .prepare("SELECT id FROM patients WHERE national_id = ?")
            .get(nationalId.trim());

        if (duplicate) {
            const error = new Error("Ja existe um paciente com este CNS.") as Error & { status?: number };
            error.status = 409;
            throw error;
        }

        const result = db
            .prepare(
                `INSERT INTO patients (name, birth_date, national_id, active)
         VALUES (?, ?, ?, 1)`
            )
            .run(name.trim(), birthDate, nationalId.trim());

        const created = db
            .prepare("SELECT id, name, birth_date, national_id, active, photo_path FROM patients WHERE id = ?")
            .get(result.lastInsertRowid) as PatientRow;

        return toPatientJson(created);
    },
};


/**
 * ============================================================
 * TODO 13 (Encontro 2, continuacao) -- Service de upload
 * ============================================================
 * setPhoto(id, filename):
 *   - busca o paciente (senao existir -> throw NotFoundError)
 *   - UPDATE patients SET photo_path = ? WHERE id = ?
 *     (salve como `/uploads/${filename}`)
 *   - devolve o paciente atualizado (toPatientJson)
 * ============================================================
 */
