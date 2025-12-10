'use client'

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    FileText,
    Plus,
    Search,
    Clock,
    MoreVertical,
    Trash2,
    Play,
    BarChart3,
    Calendar,
    Target,
    AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

interface Exam {
    id: string;
    title: string;
    description: string | null;
    duration: number | null;
    total_questions: number;
    created_at: string;
}

interface ExamAttempt {
    id: string;
    exam_id: string;
    status: string;
    score: number | null;
    correct_count: number;
    incorrect_count: number;
    started_at: string;
    completed_at: string | null;
}

export default function ExamsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: exams, isLoading: examsLoading } = useQuery<Exam[]>({
        queryKey: ["/api/exams"],
        queryFn: async () => {
            const res = await fetch('/api/exams');
            if (!res.ok) return [];
            return res.json();
        },
    });

    const { data: attempts } = useQuery<ExamAttempt[]>({
        queryKey: ["/api/attempts"],
        queryFn: async () => {
            const res = await fetch('/api/attempts');
            if (!res.ok) return [];
            return res.json();
        },
    });

    const deleteExamMutation = useMutation({
        mutationFn: async (examId: string) => {
            const res = await fetch(`/api/exams/${examId}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Falha ao excluir simulado');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
            queryClient.invalidateQueries({ queryKey: ["/api/attempts"] });
            toast({
                title: "Simulado excluído",
                description: "O simulado foi removido com sucesso.",
            });
            setDeleteDialogOpen(false);
            setExamToDelete(null);
        },
        onError: (error: Error) => {
            toast({
                title: "Erro ao excluir",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const getExamStats = (examId: string) => {
        const examAttempts = attempts?.filter(a => a.exam_id === examId) || [];
        const completedAttempts = examAttempts.filter(a => a.status === 'completed');

        if (completedAttempts.length === 0) {
            return { attempts: 0, bestScore: null, avgScore: null };
        }

        const scores = completedAttempts.map(a => a.score || 0);
        const bestScore = Math.max(...scores);
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

        return {
            attempts: completedAttempts.length,
            bestScore: Math.round(bestScore),
            avgScore: Math.round(avgScore),
        };
    };

    const filteredExams = exams?.filter(exam =>
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleDeleteClick = (exam: Exam) => {
        setExamToDelete(exam);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (examToDelete) {
            deleteExamMutation.mutate(examToDelete.id);
        }
    };

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return "Sem limite";
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Simulados</h1>
                    <p className="text-muted-foreground mt-1">
                        Crie e gerencie seus simulados de estudo
                    </p>
                </div>
                <Link href="/exams/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Novo Simulado
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar simulados..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Exams Grid */}
            {examsLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredExams.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredExams.map((exam, index) => {
                        const stats = getExamStats(exam.id);
                        return (
                            <motion.div
                                key={exam.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="space-y-1 flex-1">
                                                <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                                    {exam.title}
                                                </CardTitle>
                                                <CardDescription className="line-clamp-2">
                                                    {exam.description || "Sem descrição"}
                                                </CardDescription>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/exams/${exam.id}/start`} className="flex items-center gap-2">
                                                            <Play className="h-4 w-4" />
                                                            Iniciar
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/exams/${exam.id}/results`} className="flex items-center gap-2">
                                                            <BarChart3 className="h-4 w-4" />
                                                            Ver Resultados
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteClick(exam)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Exam Info */}
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary" className="gap-1">
                                                <FileText className="h-3 w-3" />
                                                {exam.total_questions} questões
                                            </Badge>
                                            <Badge variant="outline" className="gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDuration(exam.duration)}
                                            </Badge>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                                            <div className="text-center">
                                                <p className="text-xs text-muted-foreground">Tentativas</p>
                                                <p className="font-semibold">{stats.attempts}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-muted-foreground">Melhor</p>
                                                <p className="font-semibold text-green-500">
                                                    {stats.bestScore !== null ? `${stats.bestScore}%` : "-"}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-muted-foreground">Média</p>
                                                <p className="font-semibold">
                                                    {stats.avgScore !== null ? `${stats.avgScore}%` : "-"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
                                            <Calendar className="h-3 w-3" />
                                            Criado em {new Date(exam.created_at).toLocaleDateString("pt-BR")}
                                        </div>

                                        {/* Action Button */}
                                        <Link href={`/exams/${exam.id}/start`} className="block">
                                            <Button className="w-full gap-2">
                                                <Play className="h-4 w-4" />
                                                Iniciar Simulado
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <Card className="py-12">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <FileText className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                            {searchQuery ? "Nenhum simulado encontrado" : "Nenhum simulado criado"}
                        </h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            {searchQuery
                                ? "Tente buscar com outros termos."
                                : "Crie seu primeiro simulado e comece a estudar com questões geradas por IA."}
                        </p>
                        {!searchQuery && (
                            <Link href="/exams/new">
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Criar Primeiro Simulado
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Stats Summary */}
            {filteredExams.length > 0 && (
                <Card>
                    <CardContent className="py-4">
                        <div className="flex flex-wrap items-center justify-center gap-8 text-center">
                            <div>
                                <p className="text-2xl font-bold">{filteredExams.length}</p>
                                <p className="text-sm text-muted-foreground">Simulados</p>
                            </div>
                            <div className="h-8 w-px bg-border" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {filteredExams.reduce((acc, exam) => acc + exam.total_questions, 0)}
                                </p>
                                <p className="text-sm text-muted-foreground">Questões Total</p>
                            </div>
                            <div className="h-8 w-px bg-border" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {attempts?.filter(a => a.status === 'completed').length || 0}
                                </p>
                                <p className="text-sm text-muted-foreground">Tentativas Completas</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            Excluir Simulado
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir o simulado <strong>{examToDelete?.title}</strong>?
                            Esta ação não pode ser desfeita e todas as tentativas associadas serão perdidas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteExamMutation.isPending}
                        >
                            {deleteExamMutation.isPending ? "Excluindo..." : "Excluir"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
