import { z } from "zod";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const MSG_NAME_REQUIRED = "'Nome' é um campo obrigatório e não pode ser vazio.";
const MSG_BIRTH_DATE_REQUIRED = "'Data de nascimento' é um campo obrigatório e deve estar no formato AAAA-MM-DD.";
const MSG_CNS_REQUIRED = "'CNS' é um campo obrigatório.";

export const createPatientSchema = z.object({
    name: z
        .string({ error: MSG_NAME_REQUIRED })
        .trim()
        .min(1, MSG_NAME_REQUIRED),
    birthDate: z
        .string({ error: MSG_BIRTH_DATE_REQUIRED })
        .regex(ISO_DATE, MSG_BIRTH_DATE_REQUIRED),
    nationalId: z
        .string({ error: MSG_CNS_REQUIRED })
        .trim()
        .min(1, MSG_CNS_REQUIRED),
    active: z.boolean().optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;