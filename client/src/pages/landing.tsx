import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  FileText, 
  Target, 
  BarChart3, 
  Sparkles, 
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Zap,
  Shield
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: FileText,
      title: "Simulados Personalizados",
      description: "Crie simulados a partir de PDFs, anotações e questões reais de concursos, ENEM e vestibulares."
    },
    {
      icon: Brain,
      title: "IA Adaptativa",
      description: "Questões que se adaptam ao seu nível. A IA identifica suas dificuldades e sugere conteúdos específicos."
    },
    {
      icon: Sparkles,
      title: "Correção Inteligente",
      description: "Correção automática com explicações didáticas e feedback personalizado gerado por IA."
    },
    {
      icon: BookOpen,
      title: "Resumos Automáticos",
      description: "IA gera resumos claros e objetivos dos seus materiais de estudo, PDFs e anotações."
    },
    {
      icon: BarChart3,
      title: "Dashboard Completo",
      description: "Gráficos, estatísticas e relatórios de progresso em tempo real para acompanhar sua evolução."
    },
    {
      icon: Target,
      title: "Foco nos Pontos Fracos",
      description: "Identificamos suas áreas de dificuldade e direcionamos seu estudo para máxima eficiência."
    }
  ];

  const stats = [
    { value: "50k+", label: "Questões" },
    { value: "98%", label: "Satisfação" },
    { value: "15k+", label: "Aprovados" },
    { value: "200+", label: "Concursos" }
  ];

  const steps = [
    { number: "01", title: "Cadastre-se", description: "Crie sua conta gratuita em segundos" },
    { number: "02", title: "Envie seu Material", description: "Faça upload de PDFs ou escolha questões do banco" },
    { number: "03", title: "Estude com IA", description: "Receba simulados e resumos personalizados" },
    { number: "04", title: "Seja Aprovado", description: "Acompanhe seu progresso até a conquista" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold" data-testid="text-logo">ConcurseIA</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Como Funciona
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Planos
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a href="/api/login">
              <Button variant="ghost" data-testid="button-login">Entrar</Button>
            </a>
            <a href="/api/login">
              <Button data-testid="button-signup">Começar Grátis</Button>
            </a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              <Zap className="h-3 w-3 mr-1" />
              Potencializado por Inteligência Artificial
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6" data-testid="text-hero-title">
              Prepare-se para Concursos com{" "}
              <span className="text-primary">Inteligência Artificial</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Simulados personalizados, correção inteligente e resumos automáticos. 
              Tudo o que você precisa para conquistar sua aprovação.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/api/login">
                <Button size="lg" className="gap-2" data-testid="button-hero-cta">
                  Começar Grátis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
              <a href="#features">
                <Button size="lg" variant="outline" data-testid="button-hero-secondary">
                  Ver Recursos
                </Button>
              </a>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary" data-testid={`stat-value-${index}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para estudar
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ferramentas poderosas impulsionadas por IA para otimizar seus estudos e maximizar suas chances de aprovação.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover-elevate transition-all duration-200" data-testid={`card-feature-${index}`}>
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Como Funciona
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Em poucos passos você estará estudando de forma inteligente e eficiente.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative" data-testid={`step-${index}`}>
                <div className="text-6xl font-bold text-primary/10 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 right-0 w-full h-0.5 bg-gradient-to-r from-primary/20 to-transparent translate-x-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos que cabem no seu bolso
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Escolha o plano ideal para sua jornada de estudos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="relative" data-testid="card-plan-free">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Gratuito</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">R$0</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    <span className="text-sm">10 simulados por mês</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    <span className="text-sm">Banco com 1.000 questões</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    <span className="text-sm">Dashboard básico</span>
                  </li>
                </ul>
                <a href="/api/login">
                  <Button variant="outline" className="w-full">Começar Grátis</Button>
                </a>
              </CardContent>
            </Card>

            <Card className="relative border-primary" data-testid="card-plan-pro">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge>Mais Popular</Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Pro</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">R$29</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    <span className="text-sm">Simulados ilimitados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    <span className="text-sm">Banco com 50.000+ questões</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    <span className="text-sm">IA Adaptativa completa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    <span className="text-sm">Resumos automáticos de PDFs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    <span className="text-sm">Correção de dissertativas</span>
                  </li>
                </ul>
                <a href="/api/login">
                  <Button className="w-full">Assinar Pro</Button>
                </a>
              </CardContent>
            </Card>

            <Card className="relative" data-testid="card-plan-enterprise">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">R$99</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    <span className="text-sm">Tudo do Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    <span className="text-sm">Mentoria com IA avançada</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    <span className="text-sm">Cronograma personalizado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    <span className="text-sm">Suporte prioritário</span>
                  </li>
                </ul>
                <a href="/api/login">
                  <Button variant="outline" className="w-full">Falar com Vendas</Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground overflow-hidden">
            <CardContent className="p-8 md:p-12 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-chart-1/80" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Pronto para conquistar sua vaga?
                </h2>
                <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
                  Junte-se a milhares de estudantes que já estão usando IA para acelerar seus estudos.
                </p>
                <a href="/api/login">
                  <Button size="lg" variant="secondary" className="gap-2" data-testid="button-cta-final">
                    Começar Agora
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <Brain className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">ConcurseIA</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
              <a href="#" className="hover:text-foreground transition-colors">Contato</a>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Dados protegidos</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
