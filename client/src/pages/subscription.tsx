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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const plans = [
  {
    id: "free",
    name: "Gratuito",
    price: 0,
    description: "Para começar seus estudos",
    features: [
      "10 simulados por mês",
      "Banco com 1.000 questões",
      "Dashboard básico",
      "Correção automática",
    ],
    limitations: [
      "Sem resumos de IA",
      "Sem correção de dissertativas",
      "Estatísticas limitadas",
    ],
    cta: "Plano Atual",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    description: "Para estudantes dedicados",
    features: [
      "Simulados ilimitados",
      "Banco com 50.000+ questões",
      "IA Adaptativa completa",
      "Resumos automáticos de PDFs",
      "Correção de dissertativas com IA",
      "Estatísticas avançadas",
      "Suporte prioritário",
    ],
    limitations: [],
    cta: "Assinar Pro",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    description: "Máxima performance",
    features: [
      "Tudo do Pro",
      "Mentoria com IA avançada",
      "Cronograma personalizado",
      "Simulados exclusivos",
      "Acesso antecipado a novidades",
      "Suporte 24/7",
      "API para integrações",
    ],
    limitations: [],
    cta: "Falar com Vendas",
    popular: false,
  },
];

export default function Subscription() {
  const { user } = useAuth();
  const currentPlan = user?.subscriptionTier || "free";

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
                ) : currentPlan === "pro" ? (
                  <Sparkles className="h-6 w-6 text-primary" />
                ) : (
                  <Crown className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold capitalize">{currentPlan}</h3>
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
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Próxima cobrança</p>
                <p className="font-semibold">15 de Fevereiro, 2024</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${plan.popular ? "border-primary" : ""}`}
            data-testid={`card-plan-${plan.id}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Mais Popular
                </Badge>
              </div>
            )}
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-2">
                {plan.id === "free" ? (
                  <Zap className="h-5 w-5 text-muted-foreground" />
                ) : plan.id === "pro" ? (
                  <Sparkles className="h-5 w-5 text-primary" />
                ) : (
                  <Crown className="h-5 w-5 text-chart-4" />
                )}
                <CardTitle className="text-lg">{plan.name}</CardTitle>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">R${plan.price}</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="h-4 w-4 flex items-center justify-center mt-0.5 flex-shrink-0">
                      -
                    </span>
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.id === currentPlan ? "secondary" : plan.popular ? "default" : "outline"}
                className="w-full gap-2"
                disabled={plan.id === currentPlan}
                data-testid={`button-plan-${plan.id}`}
              >
                {plan.id === currentPlan ? (
                  "Plano Atual"
                ) : (
                  <>
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="card-payment-method">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-5 w-5" />
              Método de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentPlan === "free" ? (
              <div className="text-center py-6">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Nenhum método de pagamento cadastrado
                </p>
                <Button variant="outline">Adicionar Cartão</Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expira 12/2025</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Alterar</Button>
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
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Plano Pro - Janeiro 2024</p>
                    <p className="text-sm text-muted-foreground">15/01/2024</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ 29,00</p>
                    <Badge variant="secondary" className="text-xs">Pago</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">Plano Pro - Dezembro 2023</p>
                    <p className="text-sm text-muted-foreground">15/12/2023</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ 29,00</p>
                    <Badge variant="secondary" className="text-xs">Pago</Badge>
                  </div>
                </div>
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
