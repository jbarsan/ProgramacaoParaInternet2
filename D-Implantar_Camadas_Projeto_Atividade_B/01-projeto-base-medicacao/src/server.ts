import express from "express";
import { medicationsRouter } from "./routes/medications.router";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/medications", medicationsRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Painel de Medicacao no ar em http://localhost:${PORT}`);
});
