import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Target,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Brain,
  Lightbulb,
  Flame,
} from "lucide-react";
import { Link } from "wouter";

const weakAreas = [
  {
    id: "1",
    subject: "Matemática Financeira",
    score: 58,
    questionsAnswered: 45,
    suggestion: "Pratique mais questões de juros compostos e séries de pagamento.",
    priority: "high",
  },
  {
    id: "2",
    subject: "Direito Civil",
    score: 62,
    questionsAnswered: 38,
    suggestion: "Revise os conceitos de contratos e obrigações.",
    priority: "high",
  },
  {
    id: "3",
    subject: "Atualidades",
    score: 68,
    questionsAnswered: 52,
    suggestion: "Acompanhe mais notícias sobre economia e política.",
    priority: "medium",
  },
];

const studySuggestions = [
  {
    id: "1",
    type: "material",
    title: "Revisar Apostila de Matemática",
    description: "Baseado no seu desempenho, recomendamos revisar o capítulo sobre juros compostos.",
    icon: BookOpen,
    action: "Ver Material",
    link: "/materials",
  },
  {
    id: "2",
    type: "exam",
    title: "Simulado Focado em Pontos Fracos",
    description: "Um simulado personalizado com questões das áreas que você mais precisa praticar.",
    icon: Target,
    action: "Iniciar Simulado",
    link: "/exams/new",
  },
  {
    id: "3",
    type: "topic",
    title: "Estudo Direcionado: Contratos",
    description: "Questões específicas sobre teoria dos contratos no Direito Civil.",
    icon: Lightbulb,
    action: "Estudar Agora",
    link: "/exams",
  },
];

const dailyChallenges = [
  {
    id: "1",
    title: "10 questões de Português",
    progress: 7,
    total: 10,
    xp: 50,
    completed: false,
  },
  {
    id: "2",
    title: "Revisar 1 material",
    progress: 1,
    total: 1,
    xp: 30,
    completed: true,
  },
  {
    id: "3",
    title: "Completar 1 simulado",
    progress: 0,
    total: 1,
    xp: 100,
    completed: false,
  },
];

const insights = [
  {
    id: "1",
    icon: TrendingUp,
    title: "Seu desempenho melhorou 12%",
    description: "Nas últimas 2 semanas você teve uma melhora significativa em Direito Constitucional.",
    type: "positive",
  },
  {
    id: "2",
    icon: Clock,
    title: "Melhor horário de estudo",
    description: "Seus melhores resultados ocorrem entre 19h e 21h. Tente manter esse padrão.",
    type: "info",
  },
  {
    id: "3",
    icon: Flame,
    title: "Sequência de 7 dias!",
    description: "Você estudou por 7 dias consecutivos. Continue assim para alcançar sua meta!",
    type: "achievement",
  },
];

export default function Recommendations() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "positive":
        return "text-chart-2";
      case "achievement":
        return "text-chart-4";
      default:
        return "text-primary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-recommendations-title">
            Recomendações da IA
          </h1>
          <p className="text-muted-foreground">
            Sugestões personalizadas para otimizar seus estudos.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card data-testid="card-weak-areas">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Áreas que Precisam de Atenção
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {weakAreas.map((area) => (
                <div
                  key={area.id}
                  className="p-4 rounded-lg border space-y-3"
                  data-testid={`weak-area-${area.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{area.subject}</h4>
                        <Badge variant={getPriorityColor(area.priority) as any}>
                          {area.priority === "high" ? "Prioridade Alta" : "Prioridade Média"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {area.questionsAnswered} questões respondidas
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: area.score < 60 ? "hsl(var(--destructive))" : "hsl(var(--chart-4))" }}>
                        {area.score}%
                      </div>
                      <div className="text-xs text-muted-foreground">Acertos</div>
                    </div>
                  </div>
                  <Progress value={area.score} className="h-2" />
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{area.suggestion}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card data-testid="card-study-suggestions">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-5 w-5 text-primary" />
                Sugestões de Estudo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {studySuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover-elevate"
                  data-testid={`suggestion-${suggestion.id}`}
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <suggestion.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold">{suggestion.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {suggestion.description}
                    </p>
                  </div>
                  <Link href={suggestion.link}>
                    <Button className="gap-2 flex-shrink-0">
                      {suggestion.action}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card data-testid="card-insights">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-5 w-5 text-primary" />
                Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="flex items-start gap-3 p-4 rounded-lg border"
                  data-testid={`insight-${insight.id}`}
                >
                  <div className={`mt-0.5 ${getInsightColor(insight.type)}`}>
                    <insight.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card data-testid="card-daily-challenges">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-5 w-5 text-primary" />
                Desafios do Dia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dailyChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className={`p-4 rounded-lg border ${challenge.completed ? "bg-chart-2/5 border-chart-2/20" : ""}`}
                  data-testid={`challenge-${challenge.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {challenge.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-chart-2" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      <span className={`font-medium ${challenge.completed ? "line-through text-muted-foreground" : ""}`}>
                        {challenge.title}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      +{challenge.xp} XP
                    </Badge>
                  </div>
                  {!challenge.completed && (
                    <>
                      <Progress value={(challenge.progress / challenge.total) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {challenge.progress}/{challenge.total} completo
                      </p>
                    </>
                  )}
                </div>
              ))}

              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-sm font-medium">Complete todos os desafios</p>
                <p className="text-xs text-muted-foreground">e ganhe um bônus de 50 XP</p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-study-streak">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-chart-4/10 mb-4">
                <Flame className="h-8 w-8 text-chart-4" />
              </div>
              <h3 className="text-2xl font-bold">7 dias</h3>
              <p className="text-sm text-muted-foreground mb-4">
                de sequência de estudos
              </p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div
                    key={day}
                    className="h-8 w-8 rounded-full bg-chart-4 flex items-center justify-center"
                  >
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Continue estudando para manter sua sequência!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground" data-testid="card-ai-tip">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold">Dica da IA</span>
              </div>
              <p className="text-sm text-primary-foreground/90">
                Baseado no seu padrão de estudos, recomendo fazer pausas de 10 minutos 
                a cada 50 minutos de estudo para melhor retenção do conteúdo.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
