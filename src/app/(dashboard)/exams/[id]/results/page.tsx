'use client'

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    ArrowLeft,
    Trophy,
    Target,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    RotateCcw,
    BarChart3,
    Lightbulb,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import { motion } from "framer-motion";

interface QuestionAnswer {
    id: string;
    question_id: string;
    user_answer: string | null;
    is_correct: boolean | null;
    time_spent: number;
    question: {
        id: string;
        content: string;
        type: string;
        difficulty: string;
        options: string | null;
        correct_answer: string | null;
        explanation: string | null;
        subject: {
            id: string;
            name: string;
        } | null;
    };
}

interface AttemptResult {
    id: string;
    exam_id: string;
    status: string;
    score: number;
    correct_count: number;
    incorrect_count: number;
    time_spent: number;
    started_at: string;
    completed_at: string;
    exam: {
        id: string;
        title: string;
        description: string | null;
        total_questions: number;
    };
    answers: QuestionAnswer[];
}

export default function ExamResultsPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const examId = params.id as string;
    const attemptId = searchParams.get('attempt');

    const { data: result, isLoading } = useQuery<AttemptResult>({
        queryKey: ["/api/attempts", attemptId, "results"],
        queryFn: async () => {
            const res = await fetch(`/api/attempts/${attemptId}/results`);
            if (!res.ok) throw new Error('Erro ao carregar resultados');
            return res.json();
        },
        enabled: !!attemptId,
    });

    const parseOptions = (optionsStr: string | null) => {
        if (!optionsStr) return [];
        try {
            return typeof optionsStr === 'string' ? JSON.parse(optionsStr) : optionsStr;
        } catch {
            return [];
        }
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) {
            return `${hours}h ${mins}min ${secs}s`;
        }
        return mins > 0 ? `${mins}min ${secs}s` : `${secs}s`;
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500";
        if (score >= 60) return "text-yellow-500";
        return "text-red-500";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return { label: "Excelente!", icon: Trophy };
        if (score >= 80) return { label: "Muito Bom!", icon: TrendingUp };
        if (score >= 70) return { label: "Bom", icon: Target };
        if (score >= 60) return { label: "Regular", icon: AlertCircle };
        return { label: "Precisa Melhorar", icon: TrendingDown };
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-8 w-64" />
                <Card>
                    <CardContent className="py-12">
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="max-w-4xl mx-auto text-center py-12">
                <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Resultado não encontrado</h2>
                <p className="text-muted-foreground mb-4">
                    Este resultado não existe ou você não tem permissão para visualizá-lo.
                </p>
                <Link href="/exams">
                    <Button>Voltar para Simulados</Button>
                </Link>
            </div>
        );
    }

    const scoreInfo = getScoreLabel(result.score);
    const totalQuestions = result.correct_count + result.incorrect_count;
    const unanswered = result.exam.total_questions - totalQuestions;

    // Group answers by subject
    const answersBySubject = result.answers?.reduce((acc: any, answer) => {
        const subjectName = answer.question?.subject?.name || 'Geral';
        if (!acc[subjectName]) {
            acc[subjectName] = { correct: 0, incorrect: 0, total: 0 };
        }
        acc[subjectName].total++;
        if (answer.is_correct) acc[subjectName].correct++;
        else acc[subjectName].incorrect++;
        return acc;
    }, {}) || {};

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/exams">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Resultado do Simulado</h1>
                    <p className="text-muted-foreground">{result.exam.title}</p>
                </div>
            </div>

            {/* Score Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="overflow-hidden">
                    <div className={`h-2 ${result.score >= 70 ? 'bg-green-500' : result.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <CardContent className="pt-8 pb-6">
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10">
                                <scoreInfo.icon className={`h-10 w-10 ${getScoreColor(result.score)}`} />
                            </div>
                            <div>
                                <h2 className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                                    {Math.round(result.score)}%
                                </h2>
                                <p className="text-lg text-muted-foreground mt-1">{scoreInfo.label}</p>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="p-3 rounded-lg bg-green-500/10">
                                <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-1" />
                                <p className="text-2xl font-bold text-green-500">{result.correct_count}</p>
                                <p className="text-sm text-muted-foreground">Corretas</p>
                            </div>
                            <div className="p-3 rounded-lg bg-red-500/10">
                                <XCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
                                <p className="text-2xl font-bold text-red-500">{result.incorrect_count}</p>
                                <p className="text-sm text-muted-foreground">Incorretas</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted">
                                <Target className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                                <p className="text-2xl font-bold">{result.exam.total_questions}</p>
                                <p className="text-sm text-muted-foreground">Total</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted">
                                <Clock className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                                <p className="text-2xl font-bold">{formatTime(result.time_spent)}</p>
                                <p className="text-sm text-muted-foreground">Tempo</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Performance by Subject */}
            {Object.keys(answersBySubject).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Desempenho por Disciplina
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(answersBySubject).map(([subject, stats]: [string, any]) => {
                            const percentage = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
                            return (
                                <div key={subject} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{subject}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">
                                                {stats.correct}/{stats.total}
                                            </span>
                                            <Badge variant={percentage >= 70 ? "default" : percentage >= 50 ? "secondary" : "destructive"}>
                                                {Math.round(percentage)}%
                                            </Badge>
                                        </div>
                                    </div>
                                    <Progress value={percentage} className="h-2" />
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}

            {/* Questions Review */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Revisão das Questões
                    </CardTitle>
                    <CardDescription>
                        Confira a correção detalhada de cada questão
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="space-y-2">
                        {result.answers?.map((answer, index) => {
                            const question = answer.question;
                            const options = parseOptions(question?.options);
                            const isCorrect = answer.is_correct;
                            const userOption = options.find((o: any) => o.letter === answer.user_answer);
                            const correctOption = options.find((o: any) => o.letter === question?.correct_answer);

                            return (
                                <AccordionItem
                                    key={answer.id}
                                    value={answer.id}
                                    className={`border rounded-lg px-4 ${isCorrect === true ? 'border-green-500/50 bg-green-500/5' :
                                            isCorrect === false ? 'border-red-500/50 bg-red-500/5' :
                                                'border-muted'
                                        }`}
                                >
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex items-center gap-3 text-left">
                                            <div className={`
                                                h-8 w-8 rounded-full flex items-center justify-center shrink-0
                                                ${isCorrect === true ? 'bg-green-500 text-white' :
                                                    isCorrect === false ? 'bg-red-500 text-white' :
                                                        'bg-muted text-muted-foreground'}
                                            `}>
                                                {isCorrect === true ? (
                                                    <CheckCircle2 className="h-4 w-4" />
                                                ) : isCorrect === false ? (
                                                    <XCircle className="h-4 w-4" />
                                                ) : (
                                                    <span className="text-sm">{index + 1}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium line-clamp-1">
                                                    Questão {index + 1}
                                                </p>
                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                    {question?.content}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="shrink-0">
                                                {question?.subject?.name || 'Geral'}
                                            </Badge>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-4 pt-2 space-y-4">
                                        {/* Question Content */}
                                        <div className="p-4 bg-muted/50 rounded-lg">
                                            <p className="font-medium">{question?.content}</p>
                                        </div>

                                        {/* Options */}
                                        {question?.type === 'multiple_choice' && options.length > 0 && (
                                            <div className="space-y-2">
                                                {options.map((option: any) => {
                                                    const isUserAnswer = option.letter === answer.user_answer;
                                                    const isCorrectAnswer = option.letter === question?.correct_answer;

                                                    return (
                                                        <div
                                                            key={option.letter}
                                                            className={`
                                                                p-3 rounded-lg border flex items-start gap-2
                                                                ${isCorrectAnswer ? 'border-green-500 bg-green-500/10' : ''}
                                                                ${isUserAnswer && !isCorrectAnswer ? 'border-red-500 bg-red-500/10' : ''}
                                                            `}
                                                        >
                                                            <span className="font-semibold shrink-0">
                                                                {option.letter})
                                                            </span>
                                                            <span className="flex-1">{option.text}</span>
                                                            {isCorrectAnswer && (
                                                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                                            )}
                                                            {isUserAnswer && !isCorrectAnswer && (
                                                                <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Essay Answer */}
                                        {question?.type === 'essay' && answer.user_answer && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-muted-foreground">Sua resposta:</p>
                                                <p className="p-3 bg-muted rounded-lg">{answer.user_answer}</p>
                                            </div>
                                        )}

                                        {/* Explanation */}
                                        {question?.explanation && (
                                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Lightbulb className="h-4 w-4 text-primary" />
                                                    <span className="font-medium text-primary">Explicação</span>
                                                </div>
                                                <p className="text-sm">{question.explanation}</p>
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/exams/${examId}/start`}>
                    <Button variant="outline" className="gap-2 w-full sm:w-auto">
                        <RotateCcw className="h-4 w-4" />
                        Refazer Simulado
                    </Button>
                </Link>
                <Link href="/exams">
                    <Button className="gap-2 w-full sm:w-auto">
                        <BarChart3 className="h-4 w-4" />
                        Ver Todos os Simulados
                    </Button>
                </Link>
            </div>
        </div>
    );
}
