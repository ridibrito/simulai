import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  BookOpen,
  Award,
  Loader2,
} from "lucide-react";
import type { UserPerformance, Subject } from "@shared/schema";

interface UserStats {
  totalExams: number;
  completedExams: number;
  averageScore: number;
  totalQuestions: number;
  correctAnswers: number;
  totalTimeSpent: number;
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Stats() {
  const { data: stats, isLoading: isLoadingStats } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  const { data: performance, isLoading: isLoadingPerformance } = useQuery<UserPerformance[]>({
    queryKey: ["/api/performance"],
  });

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const getSubjectName = (subjectId: string) => {
    const subject = subjects?.find(s => s.id === subjectId);
    return subject?.name || "Matéria";
  };

  const accuracyRate = stats && stats.totalQuestions > 0
    ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
    : 0;

  const totalTimeHours = stats ? Math.round((stats.totalTimeSpent || 0) / 3600) : 0;

  const subjectPerformanceData = performance?.map((p, index) => ({
    subject: getSubjectName(p.subjectId),
    score: p.totalQuestions && p.totalQuestions > 0
      ? Math.round(((p.correctAnswers || 0) / p.totalQuestions) * 100)
      : 0,
    total: p.totalQuestions || 0,
    color: CHART_COLORS[index % CHART_COLORS.length],
  })) || [];

  const radarData = subjectPerformanceData.map(p => ({
    subject: p.subject.length > 10 ? p.subject.substring(0, 10) + "..." : p.subject,
    value: p.score,
    fullMark: 100,
  }));

  const statsCards = [
    {
      title: "Taxa de Acertos Geral",
      value: `${accuracyRate}%`,
      icon: Target,
    },
    {
      title: "Questões Respondidas",
      value: stats?.totalQuestions?.toLocaleString("pt-BR") || "0",
      icon: BookOpen,
    },
    {
      title: "Tempo Total de Estudo",
      value: `${totalTimeHours}h`,
      icon: Clock,
    },
    {
      title: "Simulados Completos",
      value: stats?.completedExams?.toString() || "0",
      icon: Award,
    },
  ];

  const isLoading = isLoadingStats || isLoadingPerformance;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasNoData = !stats?.totalQuestions && !performance?.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-stats-title">
          Estatísticas de Desempenho
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe sua evolução e identifique pontos de melhoria.
        </p>
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
              <div className="text-3xl font-bold" data-testid={`stat-value-${index}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasNoData ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum dado disponível</h3>
            <p className="text-muted-foreground">
              Complete alguns simulados para ver suas estatísticas de desempenho.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="subjects">
          <TabsList>
            <TabsTrigger value="subjects" data-testid="tab-subjects">Por Área</TabsTrigger>
            <TabsTrigger value="overview" data-testid="tab-overview">Visão Geral</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="mt-6">
            <Card data-testid="card-subject-performance">
              <CardHeader>
                <CardTitle className="text-base">Desempenho por Área de Conhecimento</CardTitle>
              </CardHeader>
              <CardContent>
                {subjectPerformanceData.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum dado de desempenho por matéria disponível.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {subjectPerformanceData.map((subject, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-medium">{subject.subject}</span>
                            <Badge variant="secondary" className="text-xs">
                              {subject.total} questões
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold" data-testid={`subject-score-${index}`}>
                              {subject.score}%
                            </span>
                            {subject.score >= 70 ? (
                              <TrendingUp className="h-4 w-4 text-chart-2" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                        </div>
                        <Progress value={subject.score} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {subject.score < 60 && "Precisa de atenção"}
                            {subject.score >= 60 && subject.score < 80 && "Bom desempenho"}
                            {subject.score >= 80 && "Excelente!"}
                          </span>
                          <span>Meta: 80%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card data-testid="card-radar-chart">
                <CardHeader>
                  <CardTitle className="text-base">Perfil de Conhecimento</CardTitle>
                </CardHeader>
                <CardContent>
                  {radarData.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum dado disponível para o gráfico.
                    </p>
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid className="stroke-muted" />
                          <PolarAngleAxis dataKey="subject" className="text-xs" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
                          <Radar
                            name="Desempenho"
                            dataKey="value"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="card-bar-chart">
                <CardHeader>
                  <CardTitle className="text-base">Comparativo por Matéria</CardTitle>
                </CardHeader>
                <CardContent>
                  {subjectPerformanceData.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhum dado disponível para o gráfico.
                    </p>
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subjectPerformanceData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis type="number" domain={[0, 100]} className="text-xs" />
                          <YAxis
                            type="category"
                            dataKey="subject"
                            width={100}
                            className="text-xs"
                            tick={{ fontSize: 11 }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--popover))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "var(--radius)",
                            }}
                            formatter={(value: number) => [`${value}%`, "Acertos"]}
                          />
                          <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2" data-testid="card-summary">
                <CardHeader>
                  <CardTitle className="text-base">Resumo do Desempenho</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="p-4 rounded-lg border text-center">
                      <div className="text-3xl font-bold text-primary" data-testid="summary-exams">
                        {stats?.completedExams || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Simulados Completos</div>
                    </div>
                    <div className="p-4 rounded-lg border text-center">
                      <div className="text-3xl font-bold text-chart-2" data-testid="summary-accuracy">
                        {accuracyRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">Taxa de Acertos</div>
                    </div>
                    <div className="p-4 rounded-lg border text-center">
                      <div className="text-3xl font-bold text-chart-3" data-testid="summary-time">
                        {totalTimeHours}h
                      </div>
                      <div className="text-sm text-muted-foreground">Tempo de Estudo</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
