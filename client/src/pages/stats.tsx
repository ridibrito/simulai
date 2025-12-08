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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
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
  Calendar,
} from "lucide-react";

const performanceOverTime = [
  { week: "Sem 1", acertos: 62, questoes: 100 },
  { week: "Sem 2", acertos: 68, questoes: 120 },
  { week: "Sem 3", acertos: 71, questoes: 150 },
  { week: "Sem 4", acertos: 75, questoes: 180 },
  { week: "Sem 5", acertos: 78, questoes: 200 },
  { week: "Sem 6", acertos: 82, questoes: 220 },
];

const subjectPerformance = [
  { subject: "Português", score: 78, total: 150, color: "hsl(var(--chart-1))" },
  { subject: "Matemática", score: 65, total: 120, color: "hsl(var(--chart-2))" },
  { subject: "Dir. Constitucional", score: 82, total: 100, color: "hsl(var(--chart-3))" },
  { subject: "Dir. Administrativo", score: 70, total: 90, color: "hsl(var(--chart-4))" },
  { subject: "Informática", score: 90, total: 80, color: "hsl(var(--chart-5))" },
  { subject: "Raciocínio Lógico", score: 72, total: 60, color: "hsl(var(--chart-1))" },
];

const radarData = [
  { subject: "Português", value: 78, fullMark: 100 },
  { subject: "Matemática", value: 65, fullMark: 100 },
  { subject: "Direito", value: 76, fullMark: 100 },
  { subject: "Informática", value: 90, fullMark: 100 },
  { subject: "Lógica", value: 72, fullMark: 100 },
  { subject: "Atualidades", value: 68, fullMark: 100 },
];

const difficultyBreakdown = [
  { name: "Fácil", value: 85, color: "hsl(var(--chart-2))" },
  { name: "Médio", value: 72, color: "hsl(var(--chart-4))" },
  { name: "Difícil", value: 58, color: "hsl(var(--chart-5))" },
];

const studyTimeData = [
  { day: "Seg", horas: 2.5 },
  { day: "Ter", horas: 3.0 },
  { day: "Qua", horas: 2.0 },
  { day: "Qui", horas: 3.5 },
  { day: "Sex", horas: 2.5 },
  { day: "Sáb", horas: 4.0 },
  { day: "Dom", horas: 3.0 },
];

export default function Stats() {
  const stats = [
    {
      title: "Taxa de Acertos Geral",
      value: "78%",
      change: "+5%",
      trend: "up",
      icon: Target,
    },
    {
      title: "Questões Respondidas",
      value: "1.247",
      change: "+142 esta semana",
      trend: "up",
      icon: BookOpen,
    },
    {
      title: "Tempo Total de Estudo",
      value: "87h",
      change: "+12h esta semana",
      trend: "up",
      icon: Clock,
    },
    {
      title: "Simulados Completos",
      value: "32",
      change: "+4 esta semana",
      trend: "up",
      icon: Award,
    },
  ];

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
        {stats.map((stat, index) => (
          <Card key={index} data-testid={`card-stat-${index}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-chart-2" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={`text-xs ${stat.trend === "up" ? "text-chart-2" : "text-destructive"}`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
          <TabsTrigger value="subjects">Por Área</TabsTrigger>
          <TabsTrigger value="time">Tempo de Estudo</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card data-testid="card-evolution-chart">
              <CardHeader>
                <CardTitle className="text-base">Evolução ao Longo do Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceOverTime}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" className="text-xs" />
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
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-radar-chart">
              <CardHeader>
                <CardTitle className="text-base">Perfil de Conhecimento</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            <Card className="lg:col-span-2" data-testid="card-difficulty-breakdown">
              <CardHeader>
                <CardTitle className="text-base">Desempenho por Dificuldade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  {difficultyBreakdown.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-2xl font-bold" style={{ color: item.color }}>
                          {item.value}%
                        </span>
                      </div>
                      <Progress value={item.value} className="h-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subjects" className="mt-6">
          <Card data-testid="card-subject-performance">
            <CardHeader>
              <CardTitle className="text-base">Desempenho por Área de Conhecimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {subjectPerformance.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{subject.subject}</span>
                        <Badge variant="secondary" className="text-xs">
                          {subject.total} questões
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{subject.score}%</span>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card data-testid="card-weekly-time">
              <CardHeader>
                <CardTitle className="text-base">Tempo de Estudo Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={studyTimeData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                        formatter={(value: number) => [`${value}h`, "Horas"]}
                      />
                      <Bar dataKey="horas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-time-summary">
              <CardHeader>
                <CardTitle className="text-base">Resumo do Tempo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 grid-cols-2">
                  <div className="p-4 rounded-lg border text-center">
                    <div className="text-3xl font-bold text-primary">20.5h</div>
                    <div className="text-sm text-muted-foreground">Esta semana</div>
                  </div>
                  <div className="p-4 rounded-lg border text-center">
                    <div className="text-3xl font-bold">2.9h</div>
                    <div className="text-sm text-muted-foreground">Média diária</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Distribuição Semanal
                  </h4>
                  <div className="space-y-2">
                    {studyTimeData.map((day, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-sm w-12">{day.day}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(day.horas / 4) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12">
                          {day.horas}h
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-medium">Meta semanal</span>
                  </div>
                  <Progress value={82} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    20.5h de 25h (82% completo)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
