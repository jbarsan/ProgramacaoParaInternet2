import type { Request, Response } from "express";
import { patientsService } from "../services/patients.service";

export const patientsController = {
    list(req: Request, res: Response) {
        const patients = patientsService.list(req.query.active as string | undefined);
        res.status(200).json(patients);
    },

    getById(req: Request, res: Response) {
        const patient = patientsService.findById(req.params.id as string);
        res.status(200).json(patient);
    },

    create(req: Request, res: Response) {
        const newPatient = patientsService.create(req.body);
        res.status(201).json(newPatient);
    },

    delete(req: Request, res: Response) {
        patientsService.delete(req.params.id as string);
        res.status(204).send();
    }
}
