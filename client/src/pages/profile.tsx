import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Camera, Save, User } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  studyArea: z.string().optional(),
  targetExam: z.string().optional(),
  studyGoal: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const studyAreas = [
  { value: "fiscal", label: "Área Fiscal" },
  { value: "tribunais", label: "Tribunais" },
  { value: "policial", label: "Área Policial" },
  { value: "bancaria", label: "Área Bancária" },
  { value: "administrativa", label: "Área Administrativa" },
  { value: "juridica", label: "Área Jurídica" },
  { value: "ti", label: "Tecnologia da Informação" },
  { value: "saude", label: "Área da Saúde" },
  { value: "educacao", label: "Educação" },
  { value: "outro", label: "Outro" },
];

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      studyArea: user?.studyArea || "",
      targetExam: user?.targetExam || "",
      studyGoal: user?.studyGoal || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return apiRequest("PATCH", "/api/users/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar seu perfil. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const getInitials = () => {
    if (!user) return "U";
    const first = user.firstName?.charAt(0) || "";
    const last = user.lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "U";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-profile-title">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas informações pessoais e preferências de estudo.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1" data-testid="card-profile-photo">
          <CardHeader>
            <CardTitle className="text-base">Foto do Perfil</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user?.profileImageUrl || undefined} alt="Foto do perfil" />
                <AvatarFallback className="text-3xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full"
                data-testid="button-change-photo"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Sua foto é obtida automaticamente da sua conta de login.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2" data-testid="card-profile-info">
          <CardHeader>
            <CardTitle className="text-base">Informações Pessoais</CardTitle>
            <CardDescription>
              Atualize suas informações de perfil e preferências de estudo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} data-testid="input-first-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sobrenome</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu sobrenome" {...field} data-testid="input-last-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="p-4 rounded-lg border bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid="text-user-email">
                    {user?.email || "Não informado"}
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="studyArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área de Estudo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-study-area">
                            <SelectValue placeholder="Selecione sua área de interesse" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {studyAreas.map((area) => (
                            <SelectItem key={area.value} value={area.value}>
                              {area.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Isso nos ajuda a personalizar suas recomendações de estudo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetExam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concurso Alvo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: TRF 5ª Região, INSS, Polícia Federal"
                          {...field}
                          data-testid="input-target-exam"
                        />
                      </FormControl>
                      <FormDescription>
                        Qual concurso você está se preparando?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="studyGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta de Estudos</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva sua meta de estudos e objetivos..."
                          className="resize-none"
                          {...field}
                          data-testid="textarea-study-goal"
                        />
                      </FormControl>
                      <FormDescription>
                        Compartilhe seus objetivos para personalizarmos sua experiência.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="gap-2"
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    <Save className="h-4 w-4" />
                    {updateProfileMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-account-stats">
        <CardHeader>
          <CardTitle className="text-base">Estatísticas da Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary">24</div>
              <div className="text-sm text-muted-foreground">Simulados Realizados</div>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-chart-2">78%</div>
              <div className="text-sm text-muted-foreground">Taxa de Acertos</div>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-chart-3">42h</div>
              <div className="text-sm text-muted-foreground">Tempo de Estudo</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
