import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
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
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

const mockPerformanceData = [
  { month: "Jan", acertos: 65, erros: 35 },
  { month: "Fev", acertos: 72, erros: 28 },
  { month: "Mar", acertos: 68, erros: 32 },
  { month: "Abr", acertos: 78, erros: 22 },
  { month: "Mai", acertos: 82, erros: 18 },
  { month: "Jun", acertos: 85, erros: 15 },
];

const mockSubjectData = [
  { name: "Português", value: 78, color: "hsl(var(--chart-1))" },
  { name: "Matemática", value: 65, color: "hsl(var(--chart-2))" },
  { name: "Direito", value: 82, color: "hsl(var(--chart-3))" },
  { name: "Informática", value: 90, color: "hsl(var(--chart-4))" },
  { name: "Atualidades", value: 70, color: "hsl(var(--chart-5))" },
];

const mockRecentExams = [
  { id: "1", title: "Simulado TRF 5ª Região", date: "2024-01-15", score: 78, status: "completed" },
  { id: "2", title: "Questões de Português", date: "2024-01-14", score: 85, status: "completed" },
  { id: "3", title: "Direito Administrativo", date: "2024-01-13", score: 72, status: "completed" },
  { id: "4", title: "Matemática Financeira", date: "2024-01-12", score: 68, status: "completed" },
];

const mockRecommendations = [
  { id: "1", title: "Reforçar Matemática", description: "Você teve dificuldades em questões de porcentagem", priority: "high" },
  { id: "2", title: "Revisar Direito Civil", description: "Conceitos de contratos precisam de atenção", priority: "medium" },
  { id: "3", title: "Praticar Português", description: "Continue praticando interpretação de texto", priority: "low" },
];

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { title: "Simulados Realizados", value: "24", icon: FileText, change: "+3 esta semana" },
    { title: "Taxa de Acertos", value: "78%", icon: Target, change: "+5% vs. mês passado" },
    { title: "Tempo de Estudo", value: "42h", icon: Clock, change: "Este mês" },
    { title: "Ranking", value: "#127", icon: TrendingUp, change: "Entre 15k+ usuários" },
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-dashboard-title">
            Olá, {user?.firstName || "Estudante"}!
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
        {stats.map((stat, index) => (
          <Card key={index} data-testid={`card-stat-${index}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold" data-testid={`stat-${index}-value`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="card-performance-chart">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">Desempenho ao Longo do Tempo</CardTitle>
            <Badge variant="secondary" className="text-xs">Últimos 6 meses</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
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
            <div className="space-y-4">
              {mockSubjectData.map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{subject.name}</span>
                    <span className="text-sm text-muted-foreground">{subject.value}%</span>
                  </div>
                  <Progress value={subject.value} className="h-2" />
                </div>
              ))}
            </div>
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
            <div className="space-y-3">
              {mockRecentExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover-elevate cursor-pointer"
                  data-testid={`exam-item-${exam.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{exam.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(exam.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={exam.score >= 70 ? "default" : "secondary"}>
                      {exam.score}%
                    </Badge>
                    {exam.score >= 70 ? (
                      <CheckCircle2 className="h-5 w-5 text-chart-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                </div>
              ))}
            </div>
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
            <div className="space-y-3">
              {mockRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-lg border space-y-2"
                  data-testid={`recommendation-${rec.id}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm">{rec.title}</span>
                    <Badge variant={getPriorityColor(rec.priority) as any} className="text-xs">
                      {getPriorityIcon(rec.priority)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{rec.description}</p>
                </div>
              ))}
            </div>
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
            <Link href="/materials/upload">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <BookOpen className="h-5 w-5" />
                <span>Enviar PDF</span>
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
