'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
    ArrowLeft,
    Sparkles,
    Loader2,
    FileText,
    Clock,
    Target,
    BookOpen,
    AlertCircle,
    Info,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Subject {
    id: string;
    name: string;
    description: string | null;
}

const examFormSchema = z.object({
    title: z.string().min(3, "Título deve ter no mínimo 3 caracteres").max(100, "Título muito longo"),
    description: z.string().max(500, "Descrição muito longa").optional(),
    duration: z.number().min(0).max(480).optional(),
    questionCount: z.number().min(5, "Mínimo de 5 questões").max(50, "Máximo de 50 questões"),
    difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
    selectedSubjects: z.array(z.string()).min(1, "Selecione ao menos uma disciplina"),
    contentPrompt: z.string().max(2000, "Conteúdo muito longo").optional(),
});

type ExamFormValues = z.infer<typeof examFormSchema>;

export default function NewExamPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);

    const { data: subjects, isLoading: subjectsLoading } = useQuery<Subject[]>({
        queryKey: ["/api/subjects"],
        queryFn: async () => {
            const res = await fetch('/api/subjects');
            if (!res.ok) return [];
            return res.json();
        },
    });

    const form = useForm<ExamFormValues>({
        resolver: zodResolver(examFormSchema),
        defaultValues: {
            title: "",
            description: "",
            duration: 60,
            questionCount: 10,
            difficulty: "medium",
            selectedSubjects: [],
            contentPrompt: "",
        },
    });

    const createExamMutation = useMutation({
        mutationFn: async (data: ExamFormValues) => {
            setIsGenerating(true);
            setGenerationProgress(10);

            // Create the exam first
            const examRes = await fetch('/api/exams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: data.title,
                    description: data.description,
                    duration: data.duration || null,
                    total_questions: 0, // Will be updated after generating questions
                }),
            });

            if (!examRes.ok) {
                const error = await examRes.json();
                throw new Error(error.message || 'Erro ao criar simulado');
            }

            const exam = await examRes.json();
            setGenerationProgress(30);

            // Generate questions with AI
            const questionsRes = await fetch('/api/questions/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    examId: exam.id,
                    subjectIds: data.selectedSubjects,
                    questionCount: data.questionCount,
                    difficulty: data.difficulty,
                    contentPrompt: data.contentPrompt,
                }),
            });

            setGenerationProgress(80);

            if (!questionsRes.ok) {
                const error = await questionsRes.json();
                throw new Error(error.message || 'Erro ao gerar questões');
            }

            setGenerationProgress(100);
            return exam;
        },
        onSuccess: (exam) => {
            toast({
                title: "Simulado criado!",
                description: "Seu simulado foi criado com sucesso. As questões foram geradas pela IA.",
            });
            router.push(`/exams/${exam.id}/start`);
        },
        onError: (error: Error) => {
            setIsGenerating(false);
            setGenerationProgress(0);
            toast({
                title: "Erro ao criar simulado",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: ExamFormValues) => {
        createExamMutation.mutate(data);
    };

    const selectedSubjectsCount = form.watch("selectedSubjects").length;
    const questionCount = form.watch("questionCount");
    const difficulty = form.watch("difficulty");

    const getDifficultyLabel = (value: string) => {
        switch (value) {
            case "easy": return "Fácil";
            case "medium": return "Médio";
            case "hard": return "Difícil";
            case "mixed": return "Misto";
            default: return value;
        }
    };

    const getDifficultyColor = (value: string) => {
        switch (value) {
            case "easy": return "text-green-500";
            case "medium": return "text-yellow-500";
            case "hard": return "text-red-500";
            case "mixed": return "text-blue-500";
            default: return "";
        }
    };

    if (isGenerating) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                >
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                        </div>
                        <motion.div
                            className="absolute inset-0 h-24 w-24 rounded-full border-4 border-primary border-t-transparent mx-auto"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold">Gerando seu simulado...</h2>
                        <p className="text-muted-foreground">
                            A IA está criando {questionCount} questões personalizadas para você
                        </p>
                    </div>

                    <div className="w-64 mx-auto">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${generationProgress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{generationProgress}%</p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Isso pode levar alguns segundos...</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/exams">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Novo Simulado</h1>
                    <p className="text-muted-foreground mt-1">
                        Configure seu simulado e deixe a IA gerar as questões
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Informações Básicas
                            </CardTitle>
                            <CardDescription>
                                Defina o título e descrição do seu simulado
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Título do Simulado *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Simulado de Direito Constitucional"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descrição</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Descreva o conteúdo ou objetivo deste simulado..."
                                                className="min-h-[80px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Subjects Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Disciplinas
                            </CardTitle>
                            <CardDescription>
                                Selecione as disciplinas para gerar as questões
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="selectedSubjects"
                                render={() => (
                                    <FormItem>
                                        {subjectsLoading ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                                    <Skeleton key={i} className="h-10" />
                                                ))}
                                            </div>
                                        ) : subjects && subjects.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {subjects.map((subject) => (
                                                    <FormField
                                                        key={subject.id}
                                                        control={form.control}
                                                        name="selectedSubjects"
                                                        render={({ field }) => (
                                                            <FormItem
                                                                key={subject.id}
                                                                className="flex items-center space-x-2 space-y-0"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(subject.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            const newValue = checked
                                                                                ? [...field.value, subject.id]
                                                                                : field.value?.filter((id) => id !== subject.id);
                                                                            field.onChange(newValue);
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="text-sm font-normal cursor-pointer">
                                                                    {subject.name}
                                                                </FormLabel>
                                                            </FormItem>
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-muted-foreground">
                                                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                                                <p>Nenhuma disciplina cadastrada.</p>
                                                <p className="text-sm">Entre em contato com o administrador.</p>
                                            </div>
                                        )}
                                        <FormMessage />
                                        {selectedSubjectsCount > 0 && (
                                            <p className="text-sm text-muted-foreground mt-2">
                                                {selectedSubjectsCount} disciplina(s) selecionada(s)
                                            </p>
                                        )}
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Configuração
                            </CardTitle>
                            <CardDescription>
                                Defina quantidade de questões, dificuldade e tempo
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Question Count */}
                            <FormField
                                control={form.control}
                                name="questionCount"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Quantidade de Questões</FormLabel>
                                            <Badge variant="secondary" className="text-lg px-3">
                                                {field.value}
                                            </Badge>
                                        </div>
                                        <FormControl>
                                            <Slider
                                                min={5}
                                                max={50}
                                                step={5}
                                                value={[field.value]}
                                                onValueChange={([value]) => field.onChange(value)}
                                                className="mt-2"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Entre 5 e 50 questões
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Difficulty */}
                            <FormField
                                control={form.control}
                                name="difficulty"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nível de Dificuldade</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a dificuldade" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="easy">🟢 Fácil</SelectItem>
                                                <SelectItem value="medium">🟡 Médio</SelectItem>
                                                <SelectItem value="hard">🔴 Difícil</SelectItem>
                                                <SelectItem value="mixed">🔵 Misto (variado)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Questões {getDifficultyLabel(difficulty).toLowerCase()} serão geradas
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Duration */}
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                Tempo Limite
                                            </FormLabel>
                                            <Badge variant="outline">
                                                {field.value ? `${field.value} min` : "Sem limite"}
                                            </Badge>
                                        </div>
                                        <FormControl>
                                            <Slider
                                                min={0}
                                                max={240}
                                                step={15}
                                                value={[field.value || 0]}
                                                onValueChange={([value]) => field.onChange(value)}
                                                className="mt-2"
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            0 = sem limite de tempo
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* AI Content Prompt */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Contexto para IA (Opcional)
                            </CardTitle>
                            <CardDescription>
                                Forneça contexto adicional para a IA gerar questões mais específicas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="contentPrompt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Ex: Foque em questões sobre controle de constitucionalidade, especialmente ADI e ADC. Inclua questões sobre jurisprudência recente do STF..."
                                                className="min-h-[120px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription className="flex items-start gap-2">
                                            <Info className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span>
                                                Quanto mais detalhado, mais precisas serão as questões geradas.
                                                Você pode mencionar tópicos específicos, tipos de questões preferidos,
                                                ou bancas de referência.
                                            </span>
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Summary & Submit */}
                    <Card className="border-primary/50 bg-primary/5">
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="font-semibold">Resumo do Simulado</h3>
                                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                        <span>{questionCount} questões</span>
                                        <span>•</span>
                                        <span className={getDifficultyColor(difficulty)}>
                                            {getDifficultyLabel(difficulty)}
                                        </span>
                                        <span>•</span>
                                        <span>{selectedSubjectsCount} disciplina(s)</span>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="gap-2 w-full sm:w-auto"
                                    disabled={createExamMutation.isPending}
                                >
                                    {createExamMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Gerando...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4" />
                                            Gerar Simulado com IA
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
