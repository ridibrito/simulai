'use client'

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    FileText,
    Target,
    Clock,
    TrendingUp,
    ArrowRight,
    Sparkles,
    BookOpen,
    CheckCircle2,
    XCircle,
    AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface UserStats {
    totalExams: number;
    totalAttempts: number;
    averageScore: number;
    totalTimeSpent: number;
}

export default function DashboardPage() {
    const { user } = useAuth();

    const { data: exams, isLoading: examsLoading } = useQuery<any[]>({
        queryKey: ["/api/exams"],
        queryFn: async () => {
            const res = await fetch('/api/exams');
            if (!res.ok) return [];
            return res.json();
        },
    });

    const { data: attempts, isLoading: attemptsLoading } = useQuery<any[]>({
        queryKey: ["/api/attempts"],
        queryFn: async () => {
            const res = await fetch('/api/attempts');
            if (!res.ok) return [];
            return res.json();
        },
    });

    const { data: performance, isLoading: performanceLoading } = useQuery<any[]>({
        queryKey: ["/api/performance"],
        queryFn: async () => {
            const res = await fetch('/api/performance');
            if (!res.ok) return [];
            return res.json();
        },
    });

    const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
        queryKey: ["/api/stats"],
        queryFn: async () => {
            const res = await fetch('/api/stats');
            if (!res.ok) return { totalExams: 0, totalAttempts: 0, averageScore: 0, totalTimeSpent: 0 };
            return res.json();
        },
    });

    const { data: recommendations, isLoading: recsLoading } = useQuery<any[]>({
        queryKey: ["/api/recommendations"],
        queryFn: async () => {
            const res = await fetch('/api/recommendations');
            if (!res.ok) return [];
            return res.json();
        },
    });

    const completedAttempts = attempts?.filter((a: any) => a.status === "completed") || [];
    const recentExamsWithAttempts = completedAttempts
        .sort((a: any, b: any) => new Date(b.completedAt || b.startedAt || Date.now()).getTime() - new Date(a.completedAt || a.startedAt || Date.now()).getTime())
        .slice(0, 4)
        .map((attempt: any) => {
            const exam = exams?.find((e: any) => e.id === attempt.examId);
            return {
                id: attempt.id,
                title: exam?.title || "Simulado",
                date: attempt.completedAt || attempt.startedAt,
                score: Math.round(attempt.score || 0),
                status: attempt.status,
            };
        });

    const performanceChartData = completedAttempts
        .sort((a: any, b: any) => new Date(a.completedAt || a.startedAt || Date.now()).getTime() - new Date(b.completedAt || b.startedAt || Date.now()).getTime())
        .slice(-6)
        .map((attempt: any, index: number) => ({
            attempt: `#${index + 1}`,
            acertos: Math.round(attempt.score || 0),
        }));

    const subjectPerformance = performance?.map((p: any, index: number) => ({
        name: p.subjectId ? `Área ${index + 1}` : "Geral",
        value: Math.round(p.averageScore || 0),
    })) || [];

    const unreadRecommendations = recommendations?.filter((r: any) => !r.isRead).slice(0, 3) || [];

    const totalExams = stats?.totalExams || exams?.length || 0;
    const avgScore = stats?.averageScore ||
        (completedAttempts.length > 0
            ? Math.round(completedAttempts.reduce((acc: number, a: any) => acc + (a.score || 0), 0) / completedAttempts.length)
            : 0);
    const totalTimeHours = stats?.totalTimeSpent
        ? Math.round(stats.totalTimeSpent / 60)
        : Math.round((completedAttempts.reduce((acc: number, a: any) => acc + (a.timeSpent || 0), 0)) / 60);

    const statsCards = [
        { title: "Simulados Criados", value: totalExams.toString(), icon: FileText, change: "Total" },
        { title: "Taxa de Acertos", value: `${avgScore}%`, icon: Target, change: "Média geral" },
        { title: "Tempo de Estudo", value: `${totalTimeHours}h`, icon: Clock, change: "Total" },
        { title: "Tentativas", value: completedAttempts.length.toString(), icon: TrendingUp, change: "Simulados realizados" },
    ];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high": return "destructive";
            case "medium": return "secondary";
            default: return "outline";
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case "high": return <AlertCircle className="h-4 w-4" />;
            case "medium": return <Clock className="h-4 w-4" />;
            default: return <CheckCircle2 className="h-4 w-4" />;
        }
    };

    const isLoading = examsLoading || attemptsLoading || performanceLoading || statsLoading;
    const firstName = user?.user_metadata?.first_name || "Estudante";

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-dashboard-title">
                        Olá, {firstName}!
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Continue sua jornada de estudos. Você está no caminho certo!
                    </p>
                </div>
                <Link href="/exams/new">
                    <Button className="gap-2" data-testid="button-new-exam">
                        <FileText className="h-4 w-4" />
                        Novo Simulado
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat, index) => (
                    <Card key={index} data-testid={`card-stat-${index}`}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between gap-2 mb-4">
                                <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <stat.icon className="h-4 w-4 text-primary" />
                                </div>
                            </div>
                            {isLoading ? (
                                <Skeleton className="h-8 w-20" />
                            ) : (
                                <div className="text-3xl font-bold" data-testid={`stat-${index}-value`}>{stat.value}</div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card data-testid="card-performance-chart">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold">Desempenho nas Últimas Tentativas</CardTitle>
                        <Badge variant="secondary" className="text-xs">Histórico</Badge>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="h-[280px]">
                            {attemptsLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Skeleton className="h-full w-full" />
                                </div>
                            ) : performanceChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={performanceChartData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="attempt" className="text-xs" />
                                        <YAxis className="text-xs" domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--popover))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "var(--radius)",
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="acertos"
                                            stroke="hsl(var(--chart-2))"
                                            strokeWidth={2}
                                            dot={{ fill: "hsl(var(--chart-2))" }}
                                            name="% Acertos"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <Target className="h-12 w-12 mb-4" />
                                    <p className="text-sm">Nenhum simulado realizado ainda</p>
                                    <Link href="/exams/new">
                                        <Button variant="outline" size="sm" className="mt-4">
                                            Criar primeiro simulado
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card data-testid="card-subject-breakdown">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold">Desempenho por Área</CardTitle>
                        <Link href="/stats">
                            <Button variant="ghost" size="sm" className="gap-1">
                                Ver detalhes
                                <ArrowRight className="h-3 w-3" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {performanceLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-2 w-full" />
                                    </div>
                                ))}
                            </div>
                        ) : subjectPerformance.length > 0 ? (
                            <div className="space-y-4">
                                {subjectPerformance.map((subject: any, index: number) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{subject.name}</span>
                                            <span className="text-sm text-muted-foreground">{subject.value}%</span>
                                        </div>
                                        <Progress value={subject.value} className="h-2" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <BookOpen className="h-10 w-10 mb-3" />
                                <p className="text-sm">Complete simulados para ver seu desempenho</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2" data-testid="card-recent-exams">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold">Simulados Recentes</CardTitle>
                        <Link href="/exams">
                            <Button variant="ghost" size="sm" className="gap-1">
                                Ver todos
                                <ArrowRight className="h-3 w-3" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {attemptsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : recentExamsWithAttempts.length > 0 ? (
                            <div className="space-y-3">
                                {recentExamsWithAttempts.map((exam: any) => (
                                    <div
                                        key={exam.id}
                                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                                        data-testid={`exam-item-${exam.id}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{exam.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {exam.date ? new Date(exam.date).toLocaleDateString("pt-BR") : ""}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={exam.score >= 70 ? "default" : "secondary"}>
                                                {exam.score}%
                                            </Badge>
                                            {exam.score >= 70 ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-destructive" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <FileText className="h-10 w-10 mb-3" />
                                <p className="text-sm">Nenhum simulado realizado ainda</p>
                                <Link href="/exams/new">
                                    <Button variant="outline" size="sm" className="mt-4">
                                        Criar simulado
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card data-testid="card-ai-recommendations">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Sugestões da IA
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {recsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                ))}
                            </div>
                        ) : unreadRecommendations.length > 0 ? (
                            <div className="space-y-3">
                                {unreadRecommendations.map((rec: any) => (
                                    <div
                                        key={rec.id}
                                        className="p-3 rounded-lg border space-y-2"
                                        data-testid={`recommendation-${rec.id}`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-medium text-sm">{rec.title}</span>
                                            <Badge variant={getPriorityColor(String(rec.priority || "low")) as any} className="text-xs">
                                                {getPriorityIcon(String(rec.priority || "low"))}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{rec.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <Sparkles className="h-10 w-10 mb-3" />
                                <p className="text-sm text-center">Complete simulados para receber sugestões personalizadas</p>
                            </div>
                        )}
                        <Link href="/recommendations">
                            <Button variant="outline" className="w-full mt-4 gap-2">
                                Ver todas as sugestões
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <Card data-testid="card-quick-actions">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Link href="/exams/new">
                            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                                <FileText className="h-5 w-5" />
                                <span>Novo Simulado</span>
                            </Button>
                        </Link>
                        <Link href="/materials">
                            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                                <BookOpen className="h-5 w-5" />
                                <span>Materiais</span>
                            </Button>
                        </Link>
                        <Link href="/stats">
                            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                                <Target className="h-5 w-5" />
                                <span>Ver Estatísticas</span>
                            </Button>
                        </Link>
                        <Link href="/recommendations">
                            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                                <Sparkles className="h-5 w-5" />
                                <span>Sugestões IA</span>
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
