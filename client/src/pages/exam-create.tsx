import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  FileText,
  Upload,
  BookOpen,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Lock,
  CreditCard,
} from "lucide-react";

const examSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  questionCount: z.number().min(5).max(100),
  timeLimit: z.number().min(10).max(300),
  difficulty: z.string(),
  subjectIds: z.array(z.string()).min(1, "Selecione pelo menos uma área"),
});

type ExamFormData = z.infer<typeof examSchema>;

const mockSubjects = [
  { id: "1", name: "Português", icon: "📝", color: "chart-1" },
  { id: "2", name: "Matemática", icon: "🔢", color: "chart-2" },
  { id: "3", name: "Direito Constitucional", icon: "⚖️", color: "chart-3" },
  { id: "4", name: "Direito Administrativo", icon: "📋", color: "chart-4" },
  { id: "5", name: "Informática", icon: "💻", color: "chart-5" },
  { id: "6", name: "Raciocínio Lógico", icon: "🧠", color: "chart-1" },
  { id: "7", name: "Atualidades", icon: "📰", color: "chart-2" },
  { id: "8", name: "Direito Penal", icon: "🔒", color: "chart-3" },
];

interface SubscriptionLimits {
  canCreate: boolean;
  remaining: number;
  limit: number;
  used: number;
}

export default function ExamCreate() {
  const [step, setStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: limits, isLoading: limitsLoading } = useQuery<SubscriptionLimits>({
    queryKey: ["/api/subscription/can-create-exam"],
  });

  const form = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      description: "",
      questionCount: 20,
      timeLimit: 60,
      difficulty: "medium",
      subjectIds: [],
    },
  });

  const createExamMutation = useMutation({
    mutationFn: async (data: ExamFormData) => {
      return apiRequest("POST", "/api/exams", data);
    },
    onSuccess: () => {
      toast({
        title: "Simulado criado!",
        description: "Seu simulado foi gerado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/subscription/can-create-exam"] });
      navigate("/exams");
    },
    onError: (error: any) => {
      const message = error?.message || "Não foi possível criar o simulado. Tente novamente.";
      if (message.includes("Limite")) {
        toast({
          title: "Limite atingido",
          description: "Você atingiu o limite do plano gratuito. Assine para criar mais simulados.",
          variant: "destructive",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/subscription/can-create-exam"] });
      } else {
        toast({
          title: "Erro ao criar",
          description: message,
          variant: "destructive",
        });
      }
    },
  });

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) => {
      const newSelection = prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId];
      form.setValue("subjectIds", newSelection);
      return newSelection;
    });
  };

  const nextStep = () => {
    if (step === 1 && selectedSubjects.length === 0) {
      toast({
        title: "Selecione as áreas",
        description: "Escolha pelo menos uma área de conhecimento.",
        variant: "destructive",
      });
      return;
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = (data: ExamFormData) => {
    createExamMutation.mutate(data);
  };

  if (limitsLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (limits && !limits.canCreate) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-create-exam-title">
            Criar Novo Simulado
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure seu simulado personalizado em poucos passos.
          </p>
        </div>

        <Card className="border-destructive/50" data-testid="card-limit-reached">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <Lock className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Limite de Simulados Atingido</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Voce ja criou {limits.used} de {limits.limit} simulado(s) permitido(s) no plano gratuito. 
              Assine um plano para criar simulados ilimitados.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/subscription">
                <Button className="gap-2" data-testid="button-upgrade">
                  <CreditCard className="h-4 w-4" />
                  Ver Planos
                </Button>
              </Link>
              <Link href="/exams">
                <Button variant="outline" data-testid="button-view-exams">
                  Ver Meus Simulados
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-create-exam-title">
          Criar Novo Simulado
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure seu simulado personalizado em poucos passos.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold transition-colors ${
                step >= s
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground/30 text-muted-foreground"
              }`}
            >
              {step > s ? <Check className="h-5 w-5" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`flex-1 h-1 mx-2 rounded ${
                  step > s ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {step === 1 && (
            <Card data-testid="card-step-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Selecione as Áreas
                </CardTitle>
                <CardDescription>
                  Escolha as áreas de conhecimento que deseja incluir no simulado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {mockSubjects.map((subject) => (
                    <div
                      key={subject.id}
                      onClick={() => handleSubjectToggle(subject.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover-elevate ${
                        selectedSubjects.includes(subject.id)
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                      data-testid={`subject-${subject.id}`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{subject.icon}</div>
                        <div className="text-sm font-medium">{subject.name}</div>
                        {selectedSubjects.includes(subject.id) && (
                          <Check className="h-4 w-4 text-primary mx-auto mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedSubjects.length > 0 && (
                  <div className="mt-6 p-4 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium mb-2">Áreas selecionadas:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubjects.map((id) => {
                        const subject = mockSubjects.find((s) => s.id === id);
                        return subject ? (
                          <Badge key={id} variant="secondary">
                            {subject.icon} {subject.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card data-testid="card-step-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Configure o Simulado
                </CardTitle>
                <CardDescription>
                  Defina as características do seu simulado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Simulado</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Simulado para TRF - Área Administrativa"
                          {...field}
                          data-testid="input-exam-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Adicione uma descrição para o simulado..."
                          className="resize-none"
                          {...field}
                          data-testid="textarea-exam-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="questionCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade de Questões: {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={5}
                          max={100}
                          step={5}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          data-testid="slider-question-count"
                        />
                      </FormControl>
                      <FormDescription>
                        Escolha entre 5 e 100 questões
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempo Limite: {field.value} minutos</FormLabel>
                      <FormControl>
                        <Slider
                          min={10}
                          max={300}
                          step={10}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          data-testid="slider-time-limit"
                        />
                      </FormControl>
                      <FormDescription>
                        Defina o tempo máximo para completar o simulado
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nível de Dificuldade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-difficulty">
                            <SelectValue placeholder="Selecione a dificuldade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="easy">Fácil</SelectItem>
                          <SelectItem value="medium">Médio</SelectItem>
                          <SelectItem value="hard">Difícil</SelectItem>
                          <SelectItem value="mixed">Misto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card data-testid="card-step-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Confirmar e Gerar
                </CardTitle>
                <CardDescription>
                  Revise as configurações e gere seu simulado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-3">Resumo do Simulado</h4>
                    <div className="grid gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Título:</span>
                        <span className="font-medium">{form.watch("title") || "Não definido"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Questões:</span>
                        <span className="font-medium">{form.watch("questionCount")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tempo:</span>
                        <span className="font-medium">{form.watch("timeLimit")} minutos</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dificuldade:</span>
                        <span className="font-medium capitalize">{form.watch("difficulty")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium mb-3">Áreas Selecionadas</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubjects.map((id) => {
                        const subject = mockSubjects.find((s) => s.id === id);
                        return subject ? (
                          <Badge key={id} variant="secondary">
                            {subject.icon} {subject.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">IA Adaptativa Ativada</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          As questões serão selecionadas com base no seu histórico de desempenho
                          para maximizar seu aprendizado.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
              className="gap-2"
              data-testid="button-prev-step"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>

            {step < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="gap-2"
                data-testid="button-next-step"
              >
                Próximo
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="gap-2"
                disabled={createExamMutation.isPending}
                data-testid="button-create-exam-submit"
              >
                {createExamMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Gerar Simulado
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
