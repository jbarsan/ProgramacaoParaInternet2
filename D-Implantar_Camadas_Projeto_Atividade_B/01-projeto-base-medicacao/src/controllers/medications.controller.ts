import type { Request, Response } from "express";
import { medicationService } from "../services/medications.service";
import { create } from "domain";

export const medicationsController = {
    list(request: Request, response: Response) {
        const medications = medicationService.list();
        response.status(200).json(medications);
    },

    getById(request: Request, response: Response) {
        const medication = medicationService.findById(request.params.id as string);
        response.status(200).json(medication);
    },

    create(request: Request, response: Response) {
        const newMedication = medicationService.create(request.body);
        response.status(201).json(newMedication);
    },

    delete(request: Request, response: Response) {
        medicationService.delete(request.params.id as string);
        response.status(204).send();
    }
}