import type { FeedbackClientContext, FeedbackScreenshot } from "./feedback.schema";

/** Coleta o contexto técnico do navegador para acompanhar o feedback. */
export function collectClientContext(): FeedbackClientContext {
    return {
        pageUrl: window.location.href,
        pageTitle: document.title,
        pathname: window.location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
        },
        screen: {
            width: window.screen.width,
            height: window.screen.height,
        },
        devicePixelRatio: window.devicePixelRatio,
    };
}

/** Converte o data URL do print em uma estrutura com mime type e base64 puro. */
export function buildScreenshot(dataUrl: string | null): FeedbackScreenshot | null {
    if (!dataUrl) return null;

    const [header, base64 = ""] = dataUrl.split(",");
    const mimeType = header.match(/data:(.*?);/)?.[1] ?? "image/jpeg";

    return { dataUrl, mimeType, base64 };
}