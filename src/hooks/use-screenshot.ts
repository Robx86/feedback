import { useCallback, useState } from "react";

/**
 * Atributo usado para excluir elementos da captura de tela
 * (ex.: a própria FAB de feedback e os toasts).
 */
export const SCREENSHOT_EXCLUDE_ATTR = "data-feedback-exclude";

const shouldInclude = (node: HTMLElement) => {
    if (!(node instanceof HTMLElement)) return true;
    if (node.hasAttribute(SCREENSHOT_EXCLUDE_ATTR)) return false;
    // react-toastify renderiza os toasts em containers com esta classe.
    if (node.classList?.contains("Toastify")) return false;
    return true;
};

/**
 * Captura a tela atual (`document.body`) como data URL base64.
 *
 * O `html-to-image` é carregado dinamicamente para não pesar no bundle inicial.
 * Retorna `null` em caso de falha (a captura nunca deve bloquear o feedback).
 *
 * Em caso de erro, conecte seu serviço de monitoramento no callback `onError`.
 */
export const useScreenshot = (onError?: (error: unknown) => void) => {
    const [isCapturing, setIsCapturing] = useState(false);

    const capture = useCallback(async (): Promise<string | null> => {
        if (typeof window === "undefined") return null;

        setIsCapturing(true);
        try {
            const { toJpeg } = await import("html-to-image");

            return await toJpeg(document.body, {
                quality: 0.85,
                pixelRatio: 1,
                cacheBust: true,
                filter: shouldInclude,
                backgroundColor: "#ffffff",
            });
        } catch (error) {
            onError?.(error);
            return null;
        } finally {
            setIsCapturing(false);
        }
    }, [onError]);

    return { capture, isCapturing };
};