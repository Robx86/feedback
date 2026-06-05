import { MessageSquareText } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { FeedbackModal } from "./feedback-modal";
import type { FeedbackFormValues } from "./feedback.schema";
import { buildScreenshot, collectClientContext } from "./feedback.utils";
import { SCREENSHOT_EXCLUDE_ATTR, useScreenshot } from "@/hooks/use-screenshot";

export interface FeedbackWidgetProps {
    /**
     * URL do endpoint que receberá o payload via POST.
     * @example "https://api.seuapp.com/feedback"
     */
    endpoint: string;
    /**
     * Headers adicionais enviados junto ao POST (ex.: Authorization).
     * @example { Authorization: `Bearer ${token}` }
     */
    headers?: Record<string, string>;
    /** Chamado após envio bem-sucedido. Use para exibir um toast de sucesso. */
    onSuccess?: () => void;
    /** Chamado em caso de erro no envio ou na captura de tela. */
    onError?: (error: unknown) => void;
}

export function FeedbackWidget({
    endpoint,
    headers,
    onSuccess,
    onError,
}: FeedbackWidgetProps) {
    const [open, setOpen] = useState(false);
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { capture, isCapturing } = useScreenshot(onError);

    const handleOpen = async () => {
        const image = await capture();
        setScreenshot(image);
        setOpen(true);
    };

    const handleSubmit = async (values: FeedbackFormValues) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...headers,
                },
                body: JSON.stringify({
                    type: values.type,
                    message: values.message,
                    submittedAt: new Date().toISOString(),
                    context: collectClientContext(),
                    screenshot: buildScreenshot(screenshot),
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            onSuccess?.();
            setOpen(false);
            setScreenshot(null);
        } catch (error) {
            onError?.(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <button
                type="button"
                aria-label="Enviar feedback"
                onClick={handleOpen}
                disabled={isCapturing}
                {...{ [SCREENSHOT_EXCLUDE_ATTR]: "" }}
                className={cn(
                    "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full",
                    "bg-primary text-white shadow-lg transition-transform hover:scale-105",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:cursor-wait disabled:opacity-70",
                )}
            >
                <MessageSquareText className="h-6 w-6" />
            </button>

            <FeedbackModal
                open={open}
                onOpenChange={setOpen}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                screenshot={screenshot}
            />
        </>
    );
}