'use client'

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import {
    Target,
    TrendingUp,
    Clock,
    Award,
    BookOpen,
    FileText,
    BarChart3,
    Activity,
} from "lucide-react";

interface Stats {
    examsCompleted: number;
    questionsAnswered: number;
    accuracy: number;
    studyMaterials: number;
    streakDay: number;
}

interface Performance {
    id: string;
    user_id: string;
    subject_id: string;
    total_questions: number;
    correct_answers: number;
    average_score: number;
    subject: {
        name: string;
    } | null;
}

interface Attempt {
    id: string;
    exam_id: string;
    status: string;
    score: number | null;
    correct_count: number;
    incorrect_count: number;
    time_spent: number;
    started_at: string;
    completed_at: string | null;
    exam: {
        title: string;
        total_questions: number;
    } | null;
}

export default function StatsPage() {
    const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
        queryKey: ["/api/stats"],
        queryFn: async () => {
            const res = await fetch('/api/stats');
            if (!res.ok) throw new Error('Erro ao carregar estatísticas');
            return res.json();
        },
    });

    const { data: performance, isLoading: perfLoading } = useQuery<Performance[]>({
        queryKey: ["/api/performance"],
        queryFn: async () => {
            const res = await fetch('/api/performance');
            if (!res.ok) return [];
            return res.json();
        },
    });

    const { data: attempts, isLoading: attemptsLoading } = useQuery<Attempt[]>({
        queryKey: ["/api/attempts"],
        queryFn: async () => {
            const res = await fetch('/api/attempts');
            if (!res.ok) return [];
            return res.json();
        },
    });

    const isLoading = statsLoading || perfLoading || attemptsLoading;

    const completedAttempts = attempts?.filter(a => a.status === 'completed') || [];

    // Evolution chart data (last 10 attempts)
    const evolutionData = completedAttempts
        .sort((a, b) => new Date(a.completed_at || a.started_at).getTime() - new Date(b.completed_at || b.started_at).getTime())
        .slice(-10)
        .map((attempt, index) => ({
            name: `#${index + 1}`,
            score: Math.round(attempt.score || 0),
            date: attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '',
        }));

    // Performance by subject
    const subjectData = performance?.map(p => ({
        name: p.subject?.name || 'Geral',
        acertos: Math.round(p.average_score),
        questoes: p.total_questions,
    })) || [];

    // Pie chart for correct vs incorrect
    const totalCorrect = completedAttempts.reduce((acc, a) => acc + (a.correct_count || 0), 0);
    const totalIncorrect = completedAttempts.reduce((acc, a) => acc + (a.incorrect_count || 0), 0);
    const pieData = [
        { name: 'Corretas', value: totalCorrect, color: '#22c55e' },
        { name: 'Incorretas', value: totalIncorrect, color: '#ef4444' },
    ];

    // Time distribution by attempt
    const timeData = completedAttempts
        .slice(-10)
        .map((attempt, index) => ({
            name: `#${index + 1}`,
            tempo: Math.round((attempt.time_spent || 0) / 60), // in minutes
        }));

    const statCards = [
        {
            title: "Simulados Realizados",
            value: stats?.examsCompleted || 0,
            icon: FileText,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Questões Respondidas",
            value: stats?.questionsAnswered || 0,
            icon: Target,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
        },
        {
            title: "Taxa de Acertos",
            value: `${stats?.accuracy || 0}%`,
            icon: TrendingUp,
            color: "text-yellow-500",
            bgColor: "bg-yellow-500/10",
        },
        {
            title: "Materiais de Estudo",
            value: stats?.studyMaterials || 0,
            icon: BookOpen,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Estatísticas</h1>
                <p className="text-muted-foreground mt-1">
                    Acompanhe seu progresso e identifique áreas para melhorar
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                                    {isLoading ? (
                                        <Skeleton className="h-8 w-20 mt-2" />
                                    ) : (
                                        <p className="text-3xl font-bold mt-2">{stat.value}</p>
                                    )}
                                </div>
                                <div className={`h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Evolution Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Evolução do Desempenho
                        </CardTitle>
                        <CardDescription>
                            Seus últimos 10 simulados
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {attemptsLoading ? (
                                <Skeleton className="h-full w-full" />
                            ) : evolutionData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={evolutionData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="name" className="text-xs" />
                                        <YAxis domain={[0, 100]} className="text-xs" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--popover))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "var(--radius)",
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="score"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={3}
                                            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                                            name="Pontuação"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <BarChart3 className="h-12 w-12 mb-4" />
                                    <p>Realize simulados para ver sua evolução</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Distribuição de Respostas
                        </CardTitle>
                        <CardDescription>
                            Total de acertos vs erros
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {attemptsLoading ? (
                                <Skeleton className="h-full w-full" />
                            ) : totalCorrect + totalIncorrect > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <Target className="h-12 w-12 mb-4" />
                                    <p>Responda questões para ver a distribuição</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Performance by Subject */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Desempenho por Disciplina
                        </CardTitle>
                        <CardDescription>
                            Taxa de acertos em cada área
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {perfLoading ? (
                                <Skeleton className="h-full w-full" />
                            ) : subjectData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={subjectData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis type="number" domain={[0, 100]} className="text-xs" />
                                        <YAxis dataKey="name" type="category" width={120} className="text-xs" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--popover))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "var(--radius)",
                                            }}
                                        />
                                        <Bar dataKey="acertos" fill="hsl(var(--primary))" radius={4} name="% Acertos" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <BookOpen className="h-12 w-12 mb-4" />
                                    <p>Complete simulados para ver seu desempenho por área</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Time per Attempt */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Tempo por Simulado
                        </CardTitle>
                        <CardDescription>
                            Minutos gastos em cada tentativa
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {attemptsLoading ? (
                                <Skeleton className="h-full w-full" />
                            ) : timeData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={timeData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                        <XAxis dataKey="name" className="text-xs" />
                                        <YAxis className="text-xs" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--popover))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "var(--radius)",
                                            }}
                                        />
                                        <Bar dataKey="tempo" fill="hsl(var(--chart-2))" radius={4} name="Minutos" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <Clock className="h-12 w-12 mb-4" />
                                    <p>Realize simulados para ver o histórico de tempo</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Atividade Recente
                    </CardTitle>
                    <CardDescription>
                        Seus últimos simulados realizados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {attemptsLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : completedAttempts.length > 0 ? (
                        <div className="space-y-3">
                            {completedAttempts.slice(0, 5).map((attempt) => (
                                <div
                                    key={attempt.id}
                                    className="flex items-center justify-between p-4 rounded-lg border"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            h-10 w-10 rounded-lg flex items-center justify-center
                                            ${(attempt.score || 0) >= 70 ? 'bg-green-500/10' : 'bg-red-500/10'}
                                        `}>
                                            <FileText className={`h-5 w-5 ${(attempt.score || 0) >= 70 ? 'text-green-500' : 'text-red-500'}`} />
                                        </div>
                                        <div>
                                            <p className="font-medium">{attempt.exam?.title || 'Simulado'}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {attempt.completed_at
                                                    ? new Date(attempt.completed_at).toLocaleDateString('pt-BR', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={(attempt.score || 0) >= 70 ? "default" : "secondary"}>
                                            {Math.round(attempt.score || 0)}%
                                        </Badge>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {attempt.correct_count}/{attempt.correct_count + attempt.incorrect_count} corretas
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Award className="h-12 w-12 mx-auto mb-4" />
                            <p>Nenhuma atividade recente</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
