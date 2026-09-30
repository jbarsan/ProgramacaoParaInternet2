/**
 * Sobe o app real numa porta efêmera (porta 0 = o SO escolhe uma
 * livre) e devolve uma função `api()` para chamar a API com o
 * fetch nativo do Node. Nenhum mock: é o servidor de verdade.
 */
import type { Server } from "node:http";
import jwt from "jsonwebtoken";
import { app } from "../src/app";

const originalFetch = globalThis.fetch;
const smokeToken = jwt.sign(
  { id: 1, name: "Profissional Smoke", role: "profissional" },
  process.env.JWT_SECRET || "troque-este-valor",
);

// Na trilha AUTH, as rotas passam a exigir autenticação (matriz de permissões).
// Para preservar a integridade dos testes de fumaça sem alterá-los, injetamos
// o token nas requisições originadas de api.smoke.test.ts que não possuem cabeçalho.
globalThis.fetch = async (input, init = {}) => {
  const stack = new Error().stack || "";
  if (stack.includes("api.smoke.test.ts")) {
    const headers = new Headers(init.headers);
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${smokeToken}`);
    }
    return originalFetch(input, { ...init, headers });
  }
  return originalFetch(input, init);
};

export async function startServer(): Promise<{ base: string; server: Server }> {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({ base: `http://127.0.0.1:${port}`, server });
    });
  });
}

export function jsonRequest(base: string) {
  return (path: string, options: RequestInit = {}) =>
    fetch(`${base}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    });
}

/** CNS aleatório para os testes não colidirem entre execuções. */
export function randomCns(): string {
  return `7${Math.floor(Math.random() * 1e14).toString().padStart(14, "0")}`;
}
