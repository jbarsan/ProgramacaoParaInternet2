/**
 * Repository de Patient (Port, SQLite Adapter & Prisma Adapter).
 *
 * Contrato (interface) que o service enxerga + implementações concretas
 * (SQLite clássico e Prisma ORM).
 */
import { db } from "../database";
import { prisma } from "./prisma";

export type Patient = {
  id: number;
  name: string;
  birthDate: string;
  nationalId: string;
  photoUrl: string | null;
  active: boolean;
};

export type CreatePatientData = {
  name: string;
  birthDate: string;
  nationalId: string;
};

export interface PatientsRepository {
  findAll(): Promise<Patient[]>;
  findById(id: number): Promise<Patient | null>;
  findByNationalId(nationalId: string): Promise<Patient | null>;
  create(data: CreatePatientData): Promise<Patient>;
  updatePhoto(id: number, photoUrl: string): Promise<Patient | null>;
}

type PatientRow = {
  id: number;
  name: string;
  birth_date: string;
  national_id: string;
  photo_url: string | null;
  active: number;
};

/** Tradução banco -> API para o adapter SQLite. */
function toPatientJson(row: PatientRow): Patient {
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

export class SqlitePatientsRepository implements PatientsRepository {
  async findAll(): Promise<Patient[]> {
    const rows = db.prepare(`${SELECT} ORDER BY name`).all() as PatientRow[];
    return rows.map(toPatientJson);
  }

  async findById(id: number): Promise<Patient | null> {
    const row = db.prepare(`${SELECT} WHERE id = ?`).get(id) as PatientRow | undefined;
    return row ? toPatientJson(row) : null;
  }

  async findByNationalId(nationalId: string): Promise<Patient | null> {
    const row = db
      .prepare(`${SELECT} WHERE national_id = ?`)
      .get(nationalId) as PatientRow | undefined;
    return row ? toPatientJson(row) : null;
  }

  async create(data: CreatePatientData): Promise<Patient> {
    const result = db
      .prepare(
        `INSERT INTO patients (name, birth_date, national_id, active)
         VALUES (?, ?, ?, 1)`,
      )
      .run(data.name, data.birthDate, data.nationalId);

    const created = await this.findById(Number(result.lastInsertRowid));
    if (!created) {
      throw new Error("Erro ao criar paciente.");
    }
    return created;
  }

  async updatePhoto(id: number, photoUrl: string): Promise<Patient | null> {
    db.prepare("UPDATE patients SET photo_url = ? WHERE id = ?").run(photoUrl, id);
    return this.findById(id);
  }
}

export class PrismaPatientsRepository implements PatientsRepository {
  async findAll(): Promise<Patient[]> {
    const list = await prisma.patient.findMany({ orderBy: { name: "asc" } });
    return list.map((p) => ({
      id: p.id,
      name: p.name,
      birthDate: p.birthDate,
      nationalId: p.nationalId,
      photoUrl: p.photoUrl,
      active: p.active === 1,
    }));
  }

  async findById(id: number): Promise<Patient | null> {
    const p = await prisma.patient.findUnique({ where: { id } });
    if (!p) return null;
    return {
      id: p.id,
      name: p.name,
      birthDate: p.birthDate,
      nationalId: p.nationalId,
      photoUrl: p.photoUrl,
      active: p.active === 1,
    };
  }

  async findByNationalId(nationalId: string): Promise<Patient | null> {
    const p = await prisma.patient.findUnique({ where: { nationalId } });
    if (!p) return null;
    return {
      id: p.id,
      name: p.name,
      birthDate: p.birthDate,
      nationalId: p.nationalId,
      photoUrl: p.photoUrl,
      active: p.active === 1,
    };
  }

  async create(data: CreatePatientData): Promise<Patient> {
    const p = await prisma.patient.create({
      data: {
        name: data.name,
        birthDate: data.birthDate,
        nationalId: data.nationalId,
        active: 1,
      },
    });
    return {
      id: p.id,
      name: p.name,
      birthDate: p.birthDate,
      nationalId: p.nationalId,
      photoUrl: p.photoUrl,
      active: p.active === 1,
    };
  }

  async updatePhoto(id: number, photoUrl: string): Promise<Patient | null> {
    const p = await prisma.patient.update({
      where: { id },
      data: { photoUrl },
    });
    return {
      id: p.id,
      name: p.name,
      birthDate: p.birthDate,
      nationalId: p.nationalId,
      photoUrl: p.photoUrl,
      active: p.active === 1,
    };
  }
}
