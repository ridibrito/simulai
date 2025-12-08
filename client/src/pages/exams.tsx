import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Plus,
  Search,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  Play,
  Eye,
  Filter,
  BookOpen,
} from "lucide-react";
import type { Exam, ExamAttempt } from "@shared/schema";

const mockExams = [
  {
    id: "1",
    title: "Simulado TRF 5ª Região - Completo",
    description: "Simulado com questões de todas as áreas",
    questionCount: 50,
    timeLimit: 180,
    difficulty: "medium",
    status: "ready",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Direito Administrativo - Básico",
    description: "Questões fundamentais de direito administrativo",
    questionCount: 20,
    timeLimit: 60,
    difficulty: "easy",
    status: "ready",
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    title: "Português para Concursos",
    description: "Foco em interpretação de texto e gramática",
    questionCount: 30,
    timeLimit: 90,
    difficulty: "medium",
    status: "ready",
    createdAt: "2024-01-13",
  },
  {
    id: "4",
    title: "Matemática Financeira Avançada",
    description: "Questões de nível avançado",
    questionCount: 25,
    timeLimit: 75,
    difficulty: "hard",
    status: "ready",
    createdAt: "2024-01-12",
  },
];

const mockAttempts = [
  {
    id: "1",
    examId: "1",
    examTitle: "Simulado TRF 5ª Região - Completo",
    completedAt: "2024-01-15T14:30:00",
    score: 78,
    correctCount: 39,
    incorrectCount: 11,
    timeSpent: 165,
    status: "completed",
  },
  {
    id: "2",
    examId: "2",
    examTitle: "Direito Administrativo - Básico",
    completedAt: "2024-01-14T10:00:00",
    score: 85,
    correctCount: 17,
    incorrectCount: 3,
    timeSpent: 45,
    status: "completed",
  },
  {
    id: "3",
    examId: "3",
    examTitle: "Português para Concursos",
    completedAt: "2024-01-13T16:45:00",
    score: 72,
    correctCount: 22,
    incorrectCount: 8,
    timeSpent: 80,
    status: "completed",
  },
];

export default function Exams() {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("available");

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 border-chart-2/20">Fácil</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-chart-4/10 text-chart-4 border-chart-4/20">Médio</Badge>;
      case "hard":
        return <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">Difícil</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const filteredExams = mockExams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || exam.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-exams-title">Simulados</h1>
          <p className="text-muted-foreground mt-1">
            Pratique com simulados personalizados e acompanhe seu progresso.
          </p>
        </div>
        <Link href="/exams/new">
          <Button className="gap-2" data-testid="button-create-exam">
            <Plus className="h-4 w-4" />
            Criar Simulado
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="available" data-testid="tab-available">
            Disponíveis
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            Histórico
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar simulados..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-exams"
            />
          </div>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full sm:w-48" data-testid="select-difficulty-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Dificuldade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="easy">Fácil</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="hard">Difícil</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="available" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredExams.map((exam) => (
              <Card key={exam.id} className="hover-elevate" data-testid={`card-exam-${exam.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{exam.title}</h3>
                        <p className="text-sm text-muted-foreground">{exam.description}</p>
                      </div>
                    </div>
                    {getDifficultyBadge(exam.difficulty)}
                  </div>

                  <div className="flex items-center gap-6 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{exam.questionCount} questões</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(exam.timeLimit)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/exams/${exam.id}/start`} className="flex-1">
                      <Button className="w-full gap-2" data-testid={`button-start-exam-${exam.id}`}>
                        <Play className="h-4 w-4" />
                        Iniciar
                      </Button>
                    </Link>
                    <Link href={`/exams/${exam.id}`}>
                      <Button variant="outline" size="icon" data-testid={`button-view-exam-${exam.id}`}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredExams.length === 0 && (
            <Card className="p-12" data-testid="empty-state-exams">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum simulado encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Não encontramos simulados com os filtros selecionados.
                </p>
                <Link href="/exams/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Criar Novo Simulado
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="space-y-4">
            {mockAttempts.map((attempt) => (
              <Card key={attempt.id} className="hover-elevate" data-testid={`card-attempt-${attempt.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {attempt.score >= 70 ? (
                          <CheckCircle2 className="h-5 w-5 text-chart-2" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{attempt.examTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(attempt.completedAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: attempt.score >= 70 ? "hsl(var(--chart-2))" : "hsl(var(--destructive))" }}>
                          {attempt.score}%
                        </div>
                        <div className="text-xs text-muted-foreground">Nota</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-chart-2">{attempt.correctCount}</div>
                        <div className="text-xs text-muted-foreground">Acertos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-destructive">{attempt.incorrectCount}</div>
                        <div className="text-xs text-muted-foreground">Erros</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{formatTime(attempt.timeSpent)}</div>
                        <div className="text-xs text-muted-foreground">Tempo</div>
                      </div>
                    </div>

                    <Link href={`/exams/${attempt.examId}/review/${attempt.id}`}>
                      <Button variant="outline" className="gap-2" data-testid={`button-review-${attempt.id}`}>
                        <Eye className="h-4 w-4" />
                        Revisar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {mockAttempts.length === 0 && (
            <Card className="p-12" data-testid="empty-state-history">
              <div className="text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum simulado realizado</h3>
                <p className="text-muted-foreground mb-4">
                  Você ainda não completou nenhum simulado. Que tal começar agora?
                </p>
                <Link href="/exams">
                  <Button className="gap-2">
                    <Play className="h-4 w-4" />
                    Ver Simulados Disponíveis
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
