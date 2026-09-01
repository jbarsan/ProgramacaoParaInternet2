/**
 * ============================================================
 * Painel de Medicacao - Servidor HTTP
 * ============================================================
 * Isto e um "Hello World": so a rota de saude e o servidor
 * estatico. As quatro rotas da atividade (listar, criar, obter
 * um, remover) ainda nao existem — sao o que voce vai construir.
 */
import express from "express";
import { db } from "./database";
import { error } from "console";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

// ============================================================
// PASSO 1 — GET /api/medications
//   db.prepare("SELECT ... FROM medication_orders").all()
//   Nao esqueca de traduzir snake_case -> camelCase antes de responder.
// ============================================================

// João Carlos
// Tradução entre snake_case (banco) e camelCase (JS/Frontend)
type MedicationRow = {
  id: number;
  patient_name: string;
  medication_name: string;
  dosage: string;
  route: string;
  scheduled_at: string;
  notes: string;
};

function toMedicationJson(row: MedicationRow) {
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

app.get("/api/medications", (_request, response) => {
  try {
    const rows = db
      .prepare(`
        SELECT id, patient_name, medication_name, dosage, route, scheduled_at, notes
        FROM medication_orders
        ORDER BY scheduled_at ASC`)
      .all() as MedicationRow[];

    response.status(200).json(rows.map(toMedicationJson));
  } catch (error) {
    console.error("Erro ao buscar medicações:", error);
    response.status(500).json({ error: "Erro interno do servidor" });
  }
});

// ============================================================
// PASSO 3 — POST /api/medications
//   valide patientName, medicationName, dosage, route, scheduledAt
//   INSERT parametrizado -> responda 201 com o registro criado
// ============================================================

// João Carlos
function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

// João Carlos
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function validateMedicationInput(body: any): string | null {
  if (isBlank(body?.patientName)) return "Nome do paciente é obrigatório.";
  if (isBlank(body?.medicationName)) return "Nome do medicamento é obrigatório.";
  if (isBlank(body?.dosage)) return "Dosagem é obrigatória.";
  if (isBlank(body?.route)) return "Via de administração é obrigatória.";

  if (isBlank(body?.scheduledAt) || !ISO_DATE.test(body.scheduledAt)) {
    return "Horário previsto inválido (formato esperado: AAAA-MM-DDTHH:MM).";
  }

  return null;
};

// João Carlos
app.post("/api/medications", (request, response) => {
  const problem = validateMedicationInput(request.body);
  if (problem) {
    response.status(400).json({ error: problem });
    return;
  }

  const { patientName, medicationName, dosage, route, scheduledAt, notes } = request.body;
  const sanitizedNotes = typeof notes === "string" && notes.trim().length > 0 ? notes.trim() : null;

  try {
    const result = db
      .prepare(`
        INSERT INTO medication_orders (patient_name, medication_name, dosage, route, scheduled_at, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run(
        patientName.trim(),
        medicationName.trim(),
        dosage.trim(),
        route.trim(),
        scheduledAt.trim(),
        sanitizedNotes
      );

    const created = db
      .prepare("SELECT id, patient_name, medication_name, dosage, route, scheduled_at, notes FROM medication_orders WHERE id = ?")
      .get(result.lastInsertRowid) as MedicationRow;
    response.status(201).json(toMedicationJson(created));
  } catch (erro) {
    console.error("Erro ao inserir prescrição:", erro);
    response.status(500).json({ error: "Erro interno ao cadastrar prescrição." });
  }
});

// ============================================================
// PASSO 4 — GET /api/medications/:id
//   db.prepare("SELECT ... WHERE id = ?").get(id)
//   undefined -> 404
// ============================================================

// João Carlos
app.get("/api/medications/:id", (request, response) => {
  const row = db
    .prepare(`SELECT id, patient_name, medication_name, dosage, route, scheduled_at, notes
    FROM medication_orders
    WHERE id = ?`)
    .get(request.params.id) as MedicationRow | undefined;

  if (!row) {
    response.status(404).json({ error: "Prescrição não encontrada." });
    return;
  }
  response.status(200).json(toMedicationJson(row));
});


// ============================================================
// PASSO 5 — DELETE /api/medications/:id
//   db.prepare("DELETE FROM medication_orders WHERE id = ?").run(id)
//   responda 204, sem corpo
// ============================================================

// João Carlos
app.delete("/api/medications/:id", (request, response) => {
  try {
    const result = db
      .prepare("DELETE FROM medication_orders WHERE id = ?")
      .run(request.params.id);

    if (result.changes === 0) {
      response.status(404).json({ error: "Prescrição não encontrada." });
      return;
    }

    response.status(204).send();
  } catch (error) {
    console.error("Erro ao remover prescrição:", error);
    response.status(500).json({ error: "Erro interno ao remover prescrição." });
  }
});

app.listen(PORT, () => {
  console.log(`Painel de Medicacao no ar em http://localhost:${PORT}`);
});

