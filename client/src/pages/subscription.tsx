import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Crown,
  Sparkles,
  Zap,
  CreditCard,
  Shield,
  ArrowRight,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface PlanDetails {
  name: string;
  price: number;
  priceFormatted: string;
  simuladosLimit: number;
  priceId?: string;
  savings?: string;
  features: string[];
}

interface PlansResponse {
  free: PlanDetails;
  monthly: PlanDetails;
  annual: PlanDetails;
}

export default function Subscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const currentPlan = user?.subscriptionTier || "free";

  const { data: plans, isLoading: plansLoading } = useQuery<PlansResponse>({
    queryKey: ["/api/subscription/plans"],
  });

  const checkoutMutation = useMutation({
    mutationFn: async (planType: "monthly" | "annual") => {
      const response = await apiRequest("POST", "/api/subscription/create-checkout", { planType });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao iniciar o checkout. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/subscription/create-portal");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao acessar o portal. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("success") === "true") {
      toast({
        title: "Assinatura ativada",
        description: "Sua assinatura foi ativada com sucesso!",
      });
      window.history.replaceState({}, "", "/subscription");
    } else if (urlParams.get("canceled") === "true") {
      toast({
        title: "Checkout cancelado",
        description: "O processo de checkout foi cancelado.",
        variant: "destructive",
      });
      window.history.replaceState({}, "", "/subscription");
    }
  }, [location, toast]);

  const handleSubscribe = (planType: "monthly" | "annual") => {
    checkoutMutation.mutate(planType);
  };

  const handleManageSubscription = () => {
    portalMutation.mutate();
  };

  const plansList = [
    {
      id: "free",
      name: "Gratuito",
      price: "R$ 0",
      period: "",
      description: "Para experimentar a plataforma",
      features: plans?.free.features || [
        "1 simulado gratuito",
        "Acesso a questões de exemplo",
        "Estatísticas básicas",
      ],
      popular: false,
      isCurrent: currentPlan === "free",
    },
    {
      id: "monthly",
      name: "Mensal",
      price: "R$ 39",
      period: "/mês",
      description: "Acesso completo mensal",
      features: plans?.monthly.features || [
        "Simulados ilimitados",
        "Questões geradas por IA",
        "Avaliação de redações por IA",
        "Recomendações personalizadas",
        "Estatísticas avançadas",
      ],
      popular: false,
      isCurrent: currentPlan === "monthly",
    },
    {
      id: "annual",
      name: "Anual",
      price: "R$ 19",
      period: "/mês",
      description: "Cobrado anualmente (R$ 228/ano)",
      savings: "Economize R$ 240/ano",
      features: plans?.annual.features || [
        "Simulados ilimitados",
        "Questões geradas por IA",
        "Avaliação de redações por IA",
        "Recomendações personalizadas",
        "Estatísticas avançadas",
        "Suporte prioritário",
      ],
      popular: true,
      isCurrent: currentPlan === "annual",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-subscription-title">
          Minha Assinatura
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie sua assinatura e escolha o plano ideal para você.
        </p>
      </div>

      <Card data-testid="card-current-plan">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                {currentPlan === "free" ? (
                  <Zap className="h-6 w-6 text-primary" />
                ) : currentPlan === "monthly" ? (
                  <Sparkles className="h-6 w-6 text-primary" />
                ) : (
                  <Crown className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold capitalize">
                    {currentPlan === "free" ? "Gratuito" : currentPlan === "monthly" ? "Mensal" : "Anual"}
                  </h3>
                  <Badge variant="secondary">Plano Atual</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentPlan === "free"
                    ? "Você está usando o plano gratuito"
                    : "Sua assinatura está ativa"}
                </p>
              </div>
            </div>
            {currentPlan !== "free" && (
              <Button
                variant="outline"
                onClick={handleManageSubscription}
                disabled={portalMutation.isPending}
                data-testid="button-manage-subscription"
              >
                {portalMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Gerenciar Assinatura
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {plansLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {plansList.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${plan.popular ? "border-primary" : ""}`}
              data-testid={`card-plan-${plan.id}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    Melhor Valor
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {plan.id === "free" ? (
                    <Zap className="h-5 w-5 text-muted-foreground" />
                  ) : plan.id === "monthly" ? (
                    <Sparkles className="h-5 w-5 text-primary" />
                  ) : (
                    <Crown className="h-5 w-5 text-chart-4" />
                  )}
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {plan.isCurrent && (
                    <Badge variant="secondary">Atual</Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                {plan.savings && (
                  <Badge variant="secondary" className="mt-2 w-fit">
                    {plan.savings}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.id === "free" ? (
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled
                    data-testid={`button-plan-${plan.id}`}
                  >
                    {plan.isCurrent ? "Plano Atual" : "Gratuito"}
                  </Button>
                ) : (
                  <Button
                    variant={plan.isCurrent ? "secondary" : plan.popular ? "default" : "outline"}
                    className="w-full gap-2"
                    disabled={plan.isCurrent || checkoutMutation.isPending}
                    onClick={() => handleSubscribe(plan.id as "monthly" | "annual")}
                    data-testid={`button-plan-${plan.id}`}
                  >
                    {checkoutMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : plan.isCurrent ? (
                      "Plano Atual"
                    ) : (
                      <>
                        Assinar {plan.name}
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="card-payment-method">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base flex-wrap">
              <CreditCard className="h-5 w-5" />
              Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentPlan === "free" ? (
              <div className="text-center py-6">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Assine um plano para adicionar um método de pagamento
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Gerencie seu método de pagamento através do portal Stripe
                </p>
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={portalMutation.isPending}
                  data-testid="button-manage-payment"
                >
                  {portalMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Gerenciar Pagamento
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-billing-history">
          <CardHeader>
            <CardTitle className="text-base">Histórico de Cobrança</CardTitle>
          </CardHeader>
          <CardContent>
            {currentPlan === "free" ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">
                  Nenhuma cobrança realizada
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Acesse o portal Stripe para ver seu histórico de cobranças
                </p>
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={portalMutation.isPending}
                  data-testid="button-billing-history"
                >
                  {portalMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Ver Histórico
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5" data-testid="card-security-info">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Pagamento Seguro</h3>
              <p className="text-sm text-muted-foreground">
                Todos os pagamentos são processados de forma segura pelo Stripe.
                Seus dados de cartão nunca são armazenados em nossos servidores.
                Você pode cancelar sua assinatura a qualquer momento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
