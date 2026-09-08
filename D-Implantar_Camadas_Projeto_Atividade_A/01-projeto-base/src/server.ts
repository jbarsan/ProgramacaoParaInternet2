import express from "express";
import { errorHandler } from "./middlewares/errorHandler";

import { patientsRouter } from "./routes/patients.router";
import { encountersRouter } from "./routes/encounters.route";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

// ============================================================
// ROTAS DE SAÚDE DO SERVIDOR, PACIENTES E ATENDIMENTOS
// ============================================================

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/patients", patientsRouter);
app.use("/api/patients/:id/encounters", encountersRouter);

// ------------------------------------------------------------
// MIDDLEWARES DE ERRO E INICIALIZAÇÃO
// ------------------------------------------------------------
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Mini-Prontuario no ar em http://localhost:${PORT}`);
});
