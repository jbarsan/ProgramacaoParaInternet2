import type { Request, Response } from "express";
import { encountersService } from "../services/encounters.service";

export const encountersController = {
    listByPatient(req: Request, res: Response) {
        const encounters = encountersService.listByPatient(req.params.id as string);
        res.status(200).json(encounters);
    },

    create(req: Request, res: Response) {
        const newEncounter = encountersService.create(req.params.id as string, req.body);
        res.status(201).json(newEncounter);
    }
}