import { z } from "zod";

export const FEEDBACK_TYPES = [
    { value: "ELOGIO", label: "Elogio" },
    { value: "SUGESTAO", label: "Sugestão" },
    { value: "CRITICA", label: "Crítica" },
    { value: "RECLAMACAO", label: "Reclamação" },
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number]["value"];

export const feedbackSchema = z.object({
    type: z.enum(["ELOGIO", "SUGESTAO", "CRITICA", "RECLAMACAO"], {
        required_error: "Selecione o tipo de feedback.",
    }),
    message: z
        .string()
        .trim()
        .min(1, "Descreva seu feedback.")
        .max(2000, "Máximo de 2000 caracteres."),
});

export type FeedbackFormValues = z.infer<typeof feedbackSchema>;

/** Print da tela em base64 (data URL) capturado antes de abrir o modal. */
export interface FeedbackScreenshot {
    /** data URL completo: `data:image/jpeg;base64,...`. */
    dataUrl: string;
    mimeType: string;
    /** base64 puro, sem o prefixo `data:...;base64,`. */
    base64: string;
}

/** Contexto técnico coletado automaticamente do navegador. */
export interface FeedbackClientContext {
    /** URL completa da página no momento do feedback. */
    pageUrl: string;
    pageTitle: string;
    pathname: string;
    referrer: string;
    userAgent: string;
    language: string;
    timezone: string;
    viewport: { width: number; height: number };
    screen: { width: number; height: number };
    devicePixelRatio: number;
}

/**
 * Payload enviado ao endpoint configurado (`POST /feedback`).
 */
export interface FeedbackPayload {
    type: FeedbackType;
    message: string;
    /** Momento do envio em ISO 8601 (UTC). */
    submittedAt: string;
    context: FeedbackClientContext;
    screenshot: FeedbackScreenshot | null;
}