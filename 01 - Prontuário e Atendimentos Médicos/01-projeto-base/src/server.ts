/**
 * ============================================================
 * Mini-Prontuario - Servidor HTTP
 * ============================================================
 * Esta semana o servidor e PROPOSITALMENTE simples:
 * um unico arquivo, sem camadas, sem arquitetura.
 * O objetivo e enxergar o HTTP acontecendo.
 *
 * A separacao em camadas chega na Semana 03. Ate la, o que
 * queremos e que voce saiba exatamente o que cada linha faz.
 */

// import express, { response } from "express";
// import { request } from "node:http";

import express from "express";
import { db } from "./database";

const app = express();
const PORT = 3000;

// ------------------------------------------------------------
// MIDDLEWARES - executam ANTES das rotas, em ordem
// ------------------------------------------------------------

// Le o corpo da requisicao quando o Content-Type e application/json
// e coloca o resultado em req.body.
// SEM ESTA LINHA, req.body vem `undefined`. Erro numero 1 da turma.
app.use(express.json());

// Serve os arquivos de public/ como conteudo estatico.
// Por isso o frontend e a API vivem na MESMA origem (localhost:3000)
// e nao precisamos falar de CORS ainda.
app.use(express.static("public"));

// ------------------------------------------------------------
// ROTAS
// ------------------------------------------------------------

/** Rota de saude: serve para saber se o servidor esta de pe. */
app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

// ============================================================
// TODO 1 (Encontro 2, Pratica 1)
// GET /api/patients  ->  200 com um ARRAY de pacientes.
// Comece devolvendo um array fixo, escrito na mao. Sem banco ainda.
// ============================================================

/* João Carlos: Aqui já resolve o que o TODO pediu. Eu usei os dados
 json do arquivo mock/patients.json

app.get("/api/patients", (_request, response) => {
  response.json([
  {
    "id": 1,
    "name": "Ana Beatriz Nogueira",
    "birthDate": "1991-03-14",
    "nationalId": "700012345678901",
    "active": true
  },
  {
    "id": 2,
    "name": "Carlos Eduardo Matias",
    "birthDate": "1978-11-02",
    "nationalId": "700012345678902",
    "active": true
  },
  {
    "id": 3,
    "name": "Eduardo Vasconcelos",
    "birthDate": "2003-01-09",
    "nationalId": "700012345678904",
    "active": false
  },
  {
    "id": 4,
    "name": "Fernanda Passos Alves",
    "birthDate": "1986-09-30",
    "nationalId": "700012345678905",
    "active": true
  },
  {
    "id": 5,
    "name": "Helena Marques Sa",
    "birthDate": "1968-12-05",
    "nationalId": "700012345678907",
    "active": false
  },
  ]);
});
*/

// João Carlos: Para ativar o filtro que pede no slide 2.
// O "banco" foi adicionado a uma variável const para ficar mais 
// fácil de manipular

/*
const patients = [
  {
    "id": 1,
    "name": "Ana Beatriz Nogueira",
    "birthDate": "1991-03-14",
    "nationalId": "700012345678901",
    "active": true
  },
  {
    "id": 2,
    "name": "Carlos Eduardo Matias",
    "birthDate": "1978-11-02",
    "nationalId": "700012345678902",
    "active": true
  },
  {
    "id": 3,
    "name": "Eduardo Vasconcelos",
    "birthDate": "2003-01-09",
    "nationalId": "700012345678904",
    "active": false
  },
  {
    "id": 4,
    "name": "Fernanda Passos Alves",
    "birthDate": "1986-09-30",
    "nationalId": "700012345678905",
    "active": true
  },
  {
    "id": 5,
    "name": "Helena Marques Sa",
    "birthDate": "1968-12-05",
    "nationalId": "700012345678907",
    "active": false
  },
]
*/

// Os dados que chegam em request.query são sempre strings.
// Para funcionar, devemos sempre comparar com strings.
// "true", filtra todos os ativos.
// "false", filtra todos os inativos.
// E se não for nenhuma, retorna todos os pacientes.

/*
app.get("/api/patients", (request, response) => {
  const { active } = request.query;

  if (active === "true") {
    return response.json(patients.filter(p => p.active === true));
  }

  if (active === "false") {
    return response.json(patients.filter(p => p.active === false))
  }

  return response.json(patients);
})
*/

// ============================================================
// TODO 2 (Encontro 2, Pratica 2)
// POST /api/patients
//   - leia req.body
//   - valide: name obrigatorio (texto nao vazio)
//              birthDate obrigatorio no formato AAAA-MM-DD
//              nationalId obrigatorio
//   - se invalido:  400  { "error": "mensagem util" }
//   - se valido:    201  com o paciente criado
// ============================================================

// Função apresentada no slide 2.
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isBlank(value: unknown): boolean {
  return typeof value !== 'string' || value.trim() === '';
}

function validatePatientInput(body: any): string | null {
  if (isBlank(body?.name)) {
    return "O campo 'name' é obrigatório.";
  }
  if (isBlank(body?.birthDate) || !ISO_DATE.test(body.birthDate)) {
    return "O campo 'birthDate' deve ser AAAA-MM-DD.";
  }
  // Validação do CNS
  if (isBlank(body?.nationalId)) {
    return "O campo 'nationalId' é obrigatório."
  }
  return null;
  // null = esta tudo certo
}

app.post("/api/patients", (request, response) => {
  const error = validatePatientInput(request.body);

  if (error) {
    return response.status(400).json({ error });
  }

  const { name, birthDate, nationalId } = request.body;
  /*
    // Acha o maior ID atual e soma 1 para criar o novo.
    const nextId = patients.length === 0 ? 1 : Math.max(...patients.map(p => p.id)) + 1;
  
    const newPatient = {
      id: nextId,
      name: name.trim(),
      birthDate,
      nationalId: nationalId.trim(),
      active: true
    };
  */
  const stmt = db
    .prepare("INSERT INTO patients (name, birth_date, national_id) VALUES (?, ?, ?)");

  const result = stmt.run(name.trim(), birthDate, nationalId.trim());
  const newPatient = db
    .prepare("SELECT id, name, birth_date AS birthDate, national_id AS nationalId FROM patients WHERE id = ?")
    .get(result.lastInsertRowid);

  return response.status(201).json(newPatient);
});

// ============================================================
// TODO 3 (Encontro 2, Pratica 3)
// Troque o array em memoria pelo banco:
//   import { db } from "./database";
//   const rows = db.prepare("SELECT ... FROM patients ORDER BY name").all();
// E crie GET /api/patients/:id devolvendo 404 quando nao existir.
// ============================================================

app.get("/api/patients", (request, response) => {
  const { active } = request.query;

  if (active === "true") {
    const rows = db
      .prepare("SELECT id, name, birth_date AS birthDate, national_id AS nationalId, active FROM patients WHERE active = 1 ORDER BY name")
      .all();
    return response.json(rows);
  }

  if (active === "false") {
    const rows = db
      .prepare("SELECT id, name, birth_date AS birthDate, national_id AS nationalId, active FROM patients WHERE active = 0 ORDER BY name")
      .all();
    return response.json(rows);
  }

  const rows = db
    .prepare("SELECT id, name, birth_date AS birthDate, national_id AS nationalId, active FROM patients ORDER BY name")
    .all();

  return response.json(rows);
})

app.get("/api/patients/:id", (request, response) => {
  const { id } = request.params;
  const patient = db
    .prepare("SELECT id, name, birth_date AS birthDate, national_id AS nationalId, active FROM patients WHERE id = ?")
    .get(id);

  if (!patient) {
    return response.status(404).json({ error: "Paciente nao encontrado" });
  }

  return response.json(patient);
});

// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Mini-Prontuario no ar em http://localhost:${PORT}`);
});
