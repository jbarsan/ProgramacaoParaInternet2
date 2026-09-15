import { z } from "zod";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const MSG_PATIENT_NAME_REQUIRED = "Nome do paciente é obrigatório";
const MSG_MEDICATION_NAME_REQUIRED = "Nome do medicamento é obrigatório";
const MSG_DOSAGE_REQUIRED = "Dosagem é obrigatória";
const MSG_ROUTE_REQUIRED = "Via de administração é obrigatória";
const MSG_SCHEDULED_AT_INVALID = "Horário previsto inválido (formato esperado: AAAA-MM-DDTHH:MM)";

export const createMedicationSchema = z.object({
    patientName: z.string(MSG_PATIENT_NAME_REQUIRED).trim().min(1, MSG_PATIENT_NAME_REQUIRED),
    medicationName: z.string(MSG_MEDICATION_NAME_REQUIRED).trim().min(1, MSG_MEDICATION_NAME_REQUIRED),
    dosage: z.string(MSG_DOSAGE_REQUIRED).trim().min(1, MSG_DOSAGE_REQUIRED),
    route: z.string(MSG_ROUTE_REQUIRED).trim().min(1, MSG_ROUTE_REQUIRED),
    scheduledAt: z.string().regex(ISO_DATE, MSG_SCHEDULED_AT_INVALID),
    notes: z.string().optional(),
});

export type CreateMedicationSchema = z.infer<typeof createMedicationSchema>;