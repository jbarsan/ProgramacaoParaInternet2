/**
 * ============================================================
 * TODO 5 -- Controller de Encounter
 * ============================================================
 * Mesma regra do TODO 2: traduz HTTP <-> dominio, chama o
 * Service (TODO 6), nunca acessa o banco diretamente.
 *
 * Repare que aqui o id do paciente vem de req.params.id (por
 * causa do mergeParams no TODO 4) -- e nao de um :patientId
 * separado.
 *
 *   import { encountersService } from "../services/encounters.service.ts";
 *
 *   export const encountersController = {
 *     list(req, res) { ... },
 *     create(req, res) { ... },
 *   };
 * ============================================================
 */

import type { Request, Response } from "express";
import { encountersService } from "../services/encounters.service.ts";

export const encountersController = {
  list(req: Request, res: Response) {
    try {
      const patientId = req.params.id as string;
      const encounters = encountersService.list(patientId);

      if (encounters === null) {
        res.status(404).json({ error: "Paciente nao encontrado." });
        return;
      }

      res.status(200).json(encounters);
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      throw err;
    }
  },

  create(req: Request, res: Response) {
    try {
      const patientId = req.params.id as string;
      const created = encountersService.create(patientId, req.body);
      res.status(201).json(created);
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ error: err.message });
        return;
      }
      throw err;
    }
  },
};

