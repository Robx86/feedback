import { ArrowUpRight, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    FEEDBACK_TYPES,
    feedbackSchema,
    type FeedbackFormValues,
} from "./feedback.schema";

interface FeedbackModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: FeedbackFormValues) => Promise<void> | void;
    isSubmitting: boolean;
    /** Print capturado antes de abrir o modal (preview opcional). */
    screenshot: string | null;
}

export function FeedbackModal({
    open,
    onOpenChange,
    onSubmit,
    isSubmitting,
    screenshot,
}: FeedbackModalProps) {
    const [previewOpen, setPreviewOpen] = useState(false);

    const form = useForm<FeedbackFormValues>({
        resolver: zodResolver(feedbackSchema),
        defaultValues: { type: undefined, message: "" },
    });

    useEffect(() => {
        if (!open) {
            form.reset();
            setPreviewOpen(false);
        }
    }, [open, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[50vw] min-w-[320px] gap-6 rounded-[1.75rem] p-8">
                <DialogHeader className="space-y-0 mb-3">
                    <div className="flex items-start gap-3.5">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
                            <MessageSquare strokeWidth={2.5} className="size-5" />
                        </span>
                        <div className="flex flex-col gap-1.5">
                            <span className="w-max rounded-full bg-gray-200 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-gray-800">
                                Feedback
                            </span>
                            <DialogTitle className="text-xl font-semibold tracking-tight text-gray-900">
                                Enviar feedback
                            </DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Selecione o tipo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {FEEDBACK_TYPES.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mensagem</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            rows={5}
                                            maxLength={2000}
                                            placeholder="Descreva seu feedback..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="rounded-2xl bg-gray-100/70 p-.5 px-4 ring-1 ring-gray-900/5">
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                Ao clicar em enviar será enviado uma
                                {screenshot && (
                                    <Button
                                        type="button"
                                        variant="link"
                                        onClick={() => setPreviewOpen(true)}
                                        className="p-0 px-1 text-xs"
                                    >
                                        captura do sistema
                                    </Button>
                                )}
                                para melhorar o processo.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-1 mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="group gap-2"
                            >
                                {isSubmitting ? (
                                    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                    <ArrowUpRight strokeWidth={1.5} className="size-4" />
                                )}
                                Enviar
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>

            {screenshot && (
                <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                    <DialogContent className="max-w-[80vw] rounded-[1.75rem] p-2">
                        <DialogTitle className="sr-only">Print da tela</DialogTitle>
                        <div className="rounded-[1.5rem] bg-gray-100/70 p-1.5 ring-1 ring-gray-900/5">
                            <img
                                src={screenshot}
                                alt="Print da tela que será enviado"
                                className="max-h-[80vh] w-full rounded-[calc(1.5rem-0.375rem)] object-contain"
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </Dialog>
    );
}