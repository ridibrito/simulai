'use client'

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    Flag,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ArrowLeft,
    Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Question {
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
}

interface ExamQuestion {
    order_index: number;
    question: Question;
}

interface Exam {
    id: string;
    title: string;
    description: string | null;
    duration: number | null;
    total_questions: number;
    exam_questions: ExamQuestion[];
}

interface UserAnswer {
    questionId: string;
    answer: string;
    flagged: boolean;
    timeSpent: number;
}

export default function ExamStartPage() {
    const router = useRouter();
    const params = useParams();
    const examId = params.id as string;
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<string, UserAnswer>>(new Map());
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [showFinishDialog, setShowFinishDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [startTime, setStartTime] = useState<number>(Date.now());
    const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

    const { data: exam, isLoading } = useQuery<Exam>({
        queryKey: ["/api/exams", examId],
        queryFn: async () => {
            const res = await fetch(`/api/exams/${examId}`);
            if (!res.ok) throw new Error('Erro ao carregar simulado');
            return res.json();
        },
    });

    // Create attempt on mount
    const createAttemptMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/attempts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exam_id: examId }),
            });
            if (!res.ok) throw new Error('Erro ao iniciar tentativa');
            return res.json();
        },
        onSuccess: (data) => {
            setAttemptId(data.id);
        },
        onError: (error) => {
            toast({
                title: "Erro",
                description: "Não foi possível iniciar o simulado",
                variant: "destructive",
            });
            router.push('/exams');
        },
    });

    // Submit attempt
    const submitAttemptMutation = useMutation({
        mutationFn: async () => {
            if (!attemptId) throw new Error('Tentativa não encontrada');

            const answersArray = Array.from(answers.entries()).map(([questionId, answer]) => ({
                questionId,
                answer: answer.answer,
                timeSpent: answer.timeSpent,
            }));

            const res = await fetch(`/api/attempts/${attemptId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answers: answersArray,
                    totalTimeSpent: Math.round((Date.now() - startTime) / 1000),
                }),
            });

            if (!res.ok) throw new Error('Erro ao enviar respostas');
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/attempts"] });
            queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
            router.push(`/exams/${examId}/results?attempt=${attemptId}`);
        },
        onError: (error) => {
            setIsSubmitting(false);
            toast({
                title: "Erro",
                description: "Não foi possível enviar as respostas",
                variant: "destructive",
            });
        },
    });

    // Initialize
    useEffect(() => {
        createAttemptMutation.mutate();
    }, []);

    // Timer
    useEffect(() => {
        if (exam?.duration && exam.duration > 0) {
            setTimeRemaining(exam.duration * 60); // Convert to seconds
        }
    }, [exam]);

    useEffect(() => {
        if (timeRemaining === null || timeRemaining <= 0) return;

        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev === null || prev <= 1) {
                    // Time's up - auto submit
                    handleFinish();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [timeRemaining]);

    const questions = exam?.exam_questions?.map(eq => eq.question) || [];
    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;
    const answeredCount = answers.size;
    const flaggedCount = Array.from(answers.values()).filter(a => a.flagged).length;

    const parseOptions = (optionsStr: string | null) => {
        if (!optionsStr) return [];
        try {
            return typeof optionsStr === 'string' ? JSON.parse(optionsStr) : optionsStr;
        } catch {
            return [];
        }
    };

    const handleAnswer = (answer: string) => {
        if (!currentQuestion) return;

        const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
        const existingAnswer = answers.get(currentQuestion.id);

        setAnswers(new Map(answers).set(currentQuestion.id, {
            questionId: currentQuestion.id,
            answer,
            flagged: existingAnswer?.flagged || false,
            timeSpent: (existingAnswer?.timeSpent || 0) + timeSpent,
        }));

        setQuestionStartTime(Date.now());
    };

    const handleFlag = () => {
        if (!currentQuestion) return;

        const existingAnswer = answers.get(currentQuestion.id);
        setAnswers(new Map(answers).set(currentQuestion.id, {
            questionId: currentQuestion.id,
            answer: existingAnswer?.answer || '',
            flagged: !existingAnswer?.flagged,
            timeSpent: existingAnswer?.timeSpent || 0,
        }));
    };

    const goToQuestion = (index: number) => {
        // Save time spent on current question
        if (currentQuestion) {
            const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
            const existingAnswer = answers.get(currentQuestion.id);
            if (existingAnswer) {
                setAnswers(new Map(answers).set(currentQuestion.id, {
                    ...existingAnswer,
                    timeSpent: existingAnswer.timeSpent + timeSpent,
                }));
            }
        }

        setCurrentIndex(index);
        setQuestionStartTime(Date.now());
    };

    const handleFinish = () => {
        setShowFinishDialog(true);
    };

    const confirmFinish = () => {
        setIsSubmitting(true);
        setShowFinishDialog(false);
        submitAttemptMutation.mutate();
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const isCurrentFlagged = currentQuestion ? answers.get(currentQuestion.id)?.flagged : false;
    const currentAnswer = currentQuestion ? answers.get(currentQuestion.id)?.answer || '' : '';

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
                <Card>
                    <CardContent className="py-12">
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!exam || questions.length === 0) {
        return (
            <div className="max-w-4xl mx-auto text-center py-12">
                <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Simulado não encontrado</h2>
                <p className="text-muted-foreground mb-4">
                    Este simulado não existe ou não possui questões.
                </p>
                <Link href="/exams">
                    <Button>Voltar para Simulados</Button>
                </Link>
            </div>
        );
    }

    if (isSubmitting) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h2 className="text-xl font-semibold">Enviando respostas...</h2>
                <p className="text-muted-foreground">Aguarde enquanto calculamos seu resultado</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/exams">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold line-clamp-1">{exam.title}</h1>
                        <p className="text-sm text-muted-foreground">
                            Questão {currentIndex + 1} de {totalQuestions}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {timeRemaining !== null && (
                        <Badge
                            variant={timeRemaining < 300 ? "destructive" : "secondary"}
                            className="gap-1 text-base px-3 py-1"
                        >
                            <Clock className="h-4 w-4" />
                            {formatTime(timeRemaining)}
                        </Badge>
                    )}
                    <Button variant="outline" onClick={handleFinish}>
                        Finalizar
                    </Button>
                </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span>{answeredCount} respondidas</span>
                    {flaggedCount > 0 && (
                        <span className="text-yellow-500">{flaggedCount} marcadas</span>
                    )}
                    <span>{totalQuestions - answeredCount} restantes</span>
                </div>
                <Progress value={(answeredCount / totalQuestions) * 100} className="h-2" />
            </div>

            {/* Question Navigation Pills */}
            <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                {questions.map((q, i) => {
                    const answer = answers.get(q.id);
                    const isAnswered = !!answer?.answer;
                    const isFlagged = answer?.flagged;
                    const isCurrent = i === currentIndex;

                    return (
                        <button
                            key={q.id}
                            onClick={() => goToQuestion(i)}
                            className={`
                                h-8 w-8 rounded-md text-sm font-medium transition-all
                                ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}
                                ${isAnswered
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background border hover:bg-muted'}
                                ${isFlagged ? 'ring-2 ring-yellow-500' : ''}
                            `}
                        >
                            {i + 1}
                        </button>
                    );
                })}
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion?.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="outline">
                                            {currentQuestion?.subject?.name || 'Geral'}
                                        </Badge>
                                        <Badge
                                            variant={
                                                currentQuestion?.difficulty === 'hard' ? 'destructive' :
                                                    currentQuestion?.difficulty === 'medium' ? 'secondary' : 'outline'
                                            }
                                        >
                                            {currentQuestion?.difficulty === 'hard' ? 'Difícil' :
                                                currentQuestion?.difficulty === 'medium' ? 'Médio' : 'Fácil'}
                                        </Badge>
                                        <Badge variant="secondary">
                                            {currentQuestion?.type === 'multiple_choice' ? 'Múltipla Escolha' : 'Discursiva'}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg font-normal mt-4">
                                        {currentQuestion?.content}
                                    </CardTitle>
                                </div>
                                <Button
                                    variant={isCurrentFlagged ? "default" : "outline"}
                                    size="icon"
                                    className={isCurrentFlagged ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                                    onClick={handleFlag}
                                    title="Marcar para revisão"
                                >
                                    <Flag className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {currentQuestion?.type === 'multiple_choice' ? (
                                <RadioGroup
                                    value={currentAnswer}
                                    onValueChange={handleAnswer}
                                    className="space-y-3"
                                >
                                    {parseOptions(currentQuestion.options).map((option: any) => (
                                        <div
                                            key={option.letter}
                                            className={`
                                                flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer
                                                ${currentAnswer === option.letter
                                                    ? 'border-primary bg-primary/5'
                                                    : 'hover:border-primary/50 hover:bg-muted/50'}
                                            `}
                                            onClick={() => handleAnswer(option.letter)}
                                        >
                                            <RadioGroupItem value={option.letter} id={option.letter} />
                                            <Label htmlFor={option.letter} className="flex-1 cursor-pointer">
                                                <span className="font-semibold mr-2">{option.letter})</span>
                                                {option.text}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            ) : (
                                <div className="space-y-2">
                                    <Label>Sua resposta:</Label>
                                    <Textarea
                                        value={currentAnswer}
                                        onChange={(e) => handleAnswer(e.target.value)}
                                        placeholder="Digite sua resposta aqui..."
                                        className="min-h-[200px] resize-none"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => goToQuestion(currentIndex - 1)}
                    disabled={currentIndex === 0}
                    className="gap-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                </Button>

                <div className="flex items-center gap-2">
                    {currentIndex === totalQuestions - 1 ? (
                        <Button onClick={handleFinish} className="gap-2">
                            <Send className="h-4 w-4" />
                            Finalizar Simulado
                        </Button>
                    ) : (
                        <Button
                            onClick={() => goToQuestion(currentIndex + 1)}
                            className="gap-2"
                        >
                            Próxima
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Finish Dialog */}
            <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Finalizar Simulado?</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-4">
                                <p>Você está prestes a finalizar o simulado.</p>
                                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-500">{answeredCount}</p>
                                        <p className="text-sm text-muted-foreground">Respondidas</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-muted-foreground">
                                            {totalQuestions - answeredCount}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Sem resposta</p>
                                    </div>
                                </div>
                                {totalQuestions - answeredCount > 0 && (
                                    <div className="flex items-center gap-2 text-yellow-600">
                                        <AlertCircle className="h-4 w-4" />
                                        <span className="text-sm">
                                            Você ainda tem questões não respondidas!
                                        </span>
                                    </div>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Continuar Respondendo</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmFinish}>
                            Finalizar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
