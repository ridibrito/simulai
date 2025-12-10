"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Brain, BarChart3, Clock, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">SimulAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground/80">
            <Link href="#features" className="hover:text-primary transition-colors">Funcionalidades</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Planos</Link>
            <Link href="#about" className="hover:text-primary transition-colors">Sobre</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" passHref>
              <Button variant="ghost" className="font-semibold px-6 hover:bg-primary/5">Entrar</Button>
            </Link>
            <Link href="/auth/signup" passHref>
              <Button className="font-semibold shadow-lg shadow-primary/20 px-6 rounded-full bg-primary hover:bg-primary/90 text-white">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-40"></div>
          <div className="absolute top-1/4 left-0 -z-10 h-96 w-96 rounded-full bg-primary/20 blur-[100px] opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-blue-500/20 blur-[100px] opacity-20"></div>

          <div className="container mx-auto px-4 text-center sm:px-8 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              A Revolução nos Estudos para Concursos
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 mb-6 pb-2"
            >
              Estude de forma <br />
              <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">inteligente</span> com IA
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed"
            >
              SimulAI cria planos de estudo personalizados, gera simulados infinitos e usa inteligência artificial para identificar e preencher suas lacunas de conhecimento.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link href="/auth/signup">
                <Button size="lg" className="h-14 px-8 rounded-full text-base shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95">
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-base border-primary/20 hover:bg-primary/5 transition-all">
                  Já tenho conta
                </Button>
              </Link>
            </motion.div>

            {/* Stats / Trust */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-16 pt-8 border-t border-border/40 grid grid-cols-2 gap-8 md:grid-cols-4 max-w-3xl mx-auto"
            >
              {[
                { label: "Questões Geradas", value: "10k+" },
                { label: "Usuários Ativos", value: "500+" },
                { label: "Aprovações", value: "98%" },
                { label: "Simulados", value: "Unlimited" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/30 border-y border-border/40 relative">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                Tudo que você precisa para ser aprovado
              </h2>
              <p className="text-lg text-muted-foreground">
                Nossa plataforma combina tecnologia de ponta com metodologia comprovada de estudos.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: <Brain className="h-10 w-10 text-primary" />,
                  title: "IA Personalizada",
                  description: "O algoritmo aprende com seus erros e adapta o conteúdo para focar exatamente onde você precisa melhorar.",
                },
                {
                  icon: <Clock className="h-10 w-10 text-blue-500" />,
                  title: "Simulados Ilimitados",
                  description: "Gere simulados de qualquer matéria, banca ou cargo em segundos. Nunca mais repita a mesma prova.",
                },
                {
                  icon: <BarChart3 className="h-10 w-10 text-purple-500" />,
                  title: "Análise de Desempenho",
                  description: "Dashboards detalhados mostram sua evolução, tempo por questão e comparativos com outros estudantes.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted group-hover:bg-primary/10 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/50 to-background"></div>
          <div className="container mx-auto px-4 sm:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 shadow-2xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
              <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Pronto para transformar seus estudos?
                  <br />
                  Comece sua jornada hoje.
                </h2>
                <p className="mt-6 text-lg leading-8 text-blue-100">
                  Junte-se a milhares de estudantes que já estão usando IA para acelerar sua aprovação. Teste grátis por 7 dias.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                  <Link href="/auth/signup">
                    <Button size="lg" variant="secondary" className="h-12 px-8 rounded-full font-semibold tex-primary hover:bg-white/90">
                      Criar Conta Grátis
                    </Button>
                  </Link>
                  <Link href="/auth/login" className="text-sm font-semibold leading-6 text-white hover:text-blue-100 transition-colors">
                    Saber mais <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
              <div className="relative mt-16 h-80 lg:mt-8">
                {/* Abstract visual representation of the app */}
                <div className="absolute top-0 left-0 w-[57rem] max-w-none rounded-md bg-white/10 ring-1 ring-white/10 p-4 backdrop-blur-sm">
                  <div className="rounded bg-background/90 p-4 h-[600px] w-full shadow-2xl">
                    {/* Fake UI Placeholder */}
                    <div className="flex gap-4 mb-4">
                      <div className="h-32 w-full bg-muted rounded-lg animate-pulse"></div>
                      <div className="h-32 w-full bg-muted rounded-lg animate-pulse delay-75"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 w-3/4 bg-muted rounded animate-pulse delay-100"></div>
                      <div className="h-4 w-1/2 bg-muted rounded animate-pulse delay-150"></div>
                      <div className="h-4 w-full bg-muted rounded animate-pulse delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-muted/30 py-12">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">SimulAI</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs mb-6">
                A plataforma definitiva para estudantes de alto rendimento. Domine o conteúdo com inteligência artificial.
              </p>
            </div>
            {/* Links columns - placeholders */}
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Funcionalidades</Link></li>
                <li><Link href="#" className="hover:text-primary">Preços</Link></li>
                <li><Link href="#" className="hover:text-primary">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Sobre</Link></li>
                <li><Link href="#" className="hover:text-primary">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary">Carreiras</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Privacidade</Link></li>
                <li><Link href="#" className="hover:text-primary">Termos</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} SimulAI. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
