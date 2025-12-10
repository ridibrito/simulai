'use client'

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import {
    Crown,
    Check,
    Sparkles,
    Zap,
    Shield,
    Clock,
    CreditCard,
    Loader2,
    ArrowRight,
    Star,
} from "lucide-react";
import { motion } from "framer-motion";

interface UserProfile {
    id: string;
    subscription_tier: string;
    subscription_status: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    subscription_current_period_end: string | null;
}

const plans = [
    {
        id: 'free',
        name: 'Gratuito',
        price: 0,
        period: '/mês',
        description: 'Perfeito para começar',
        features: [
            '1 simulado por mês',
            '10 questões por simulado',
            'Resumos básicos de materiais',
            'Estatísticas limitadas',
        ],
        limitations: [
            'Sem recomendações IA avançadas',
            'Sem suporte prioritário',
        ],
        buttonText: 'Plano Atual',
        popular: false,
    },
    {
        id: 'monthly',
        name: 'Pro Mensal',
        price: 39,
        period: '/mês',
        description: 'Ideal para estudos intensivos',
        features: [
            'Simulados ilimitados',
            'Até 50 questões por simulado',
            'Resumos avançados com IA',
            'Estatísticas completas',
            'Recomendações personalizadas',
            'Correção de discursivas',
            'Suporte prioritário',
        ],
        limitations: [],
        buttonText: 'Assinar Agora',
        popular: true,
    },
    {
        id: 'annual',
        name: 'Pro Anual',
        price: 19,
        period: '/mês',
        priceTotal: 228,
        description: 'Melhor custo-benefício',
        savings: 'Economia de R$ 240/ano',
        features: [
            'Tudo do plano Pro',
            'Simulados ilimitados',
            'Até 50 questões por simulado',
            'Resumos avançados com IA',
            'Estatísticas completas',
            'Recomendações personalizadas',
            'Correção de discursivas',
            'Suporte prioritário',
        ],
        limitations: [],
        buttonText: 'Assinar Anual',
        popular: false,
    },
];

export default function SubscriptionPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { toast } = useToast();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
        queryKey: ["/api/auth/user"],
        queryFn: async () => {
            const res = await fetch('/api/auth/user');
            if (!res.ok) throw new Error('Erro ao carregar perfil');
            return res.json();
        },
        enabled: !!user,
    });

    const currentPlan = profile?.subscription_tier || 'free';
    const isPro = currentPlan !== 'free';

    const handleSubscribe = async (planId: string) => {
        if (planId === 'free') return;

        setIsLoading(true);
        setSelectedPlan(planId);

        try {
            const res = await fetch('/api/subscription/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Erro ao iniciar checkout');
            }

            const { url } = await res.json();

            if (url) {
                window.location.href = url;
            }
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.message || "Não foi possível iniciar o checkout",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setSelectedPlan(null);
        }
    };

    const handleManageSubscription = async () => {
        setIsLoading(true);

        try {
            const res = await fetch('/api/subscription/portal', {
                method: 'POST',
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Erro ao abrir portal');
            }

            const { url } = await res.json();

            if (url) {
                window.location.href = url;
            }
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.message || "Não foi possível abrir o portal de assinatura",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    if (profileLoading || authLoading) {
        return (
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="h-64 bg-muted animate-pulse rounded" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">
                    {isPro ? 'Sua Assinatura' : 'Escolha seu Plano'}
                </h1>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    {isPro
                        ? 'Gerencie sua assinatura e aproveite todos os recursos'
                        : 'Desbloqueie todo o potencial do SimulAI com uma assinatura Pro'}
                </p>
            </div>

            {/* Current Subscription Banner (if Pro) */}
            {isPro && profile && (
                <Card className="border-primary bg-primary/5">
                    <CardContent className="py-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                                    <Crown className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">Plano Pro</h3>
                                        <Badge variant="default">{currentPlan === 'annual' ? 'Anual' : 'Mensal'}</Badge>
                                    </div>
                                    {profile.subscription_current_period_end && (
                                        <p className="text-sm text-muted-foreground">
                                            Renova em {formatDate(profile.subscription_current_period_end)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleManageSubscription}
                                disabled={isLoading}
                                className="gap-2"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CreditCard className="h-4 w-4" />
                                )}
                                Gerenciar Assinatura
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Plans Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {plans.map((plan, index) => {
                    const isCurrentPlan = plan.id === currentPlan;
                    const isPopular = plan.popular;

                    return (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={`relative h-full flex flex-col ${isPopular ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
                                {isPopular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <Badge className="gap-1 bg-primary">
                                            <Star className="h-3 w-3" />
                                            Mais Popular
                                        </Badge>
                                    </div>
                                )}

                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center justify-between">
                                        <span>{plan.name}</span>
                                        {isCurrentPlan && (
                                            <Badge variant="secondary">Atual</Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                </CardHeader>

                                <CardContent className="flex-1 flex flex-col">
                                    {/* Price */}
                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold">
                                                R$ {plan.price}
                                            </span>
                                            <span className="text-muted-foreground">{plan.period}</span>
                                        </div>
                                        {plan.priceTotal && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                R$ {plan.priceTotal} cobrados anualmente
                                            </p>
                                        )}
                                        {plan.savings && (
                                            <Badge variant="secondary" className="mt-2 gap-1">
                                                <Zap className="h-3 w-3" />
                                                {plan.savings}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-3 flex-1">
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                                <span className="text-sm">{feature}</span>
                                            </div>
                                        ))}
                                        {plan.limitations.map((limitation, i) => (
                                            <div key={i} className="flex items-start gap-2 text-muted-foreground">
                                                <span className="h-5 w-5 flex items-center justify-center shrink-0">−</span>
                                                <span className="text-sm">{limitation}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Button */}
                                    <div className="mt-6">
                                        {plan.id === 'free' ? (
                                            isCurrentPlan ? (
                                                <Button variant="outline" className="w-full" disabled>
                                                    Plano Atual
                                                </Button>
                                            ) : (
                                                <Button variant="ghost" className="w-full" disabled>
                                                    Plano Gratuito
                                                </Button>
                                            )
                                        ) : (
                                            <Button
                                                className={`w-full gap-2 ${isPopular ? 'bg-primary' : ''}`}
                                                variant={isPopular ? 'default' : 'outline'}
                                                onClick={() => handleSubscribe(plan.id)}
                                                disabled={isLoading || isCurrentPlan}
                                            >
                                                {isLoading && selectedPlan === plan.id ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Processando...
                                                    </>
                                                ) : isCurrentPlan ? (
                                                    'Plano Atual'
                                                ) : (
                                                    <>
                                                        {plan.buttonText}
                                                        <ArrowRight className="h-4 w-4" />
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* FAQ / Features */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Por que assinar o Pro?
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="flex gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Zap className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium">Simulados Ilimitados</h4>
                                <p className="text-sm text-muted-foreground">
                                    Crie quantos simulados quiser, sem limitações
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium">IA Avançada</h4>
                                <p className="text-sm text-muted-foreground">
                                    Questões mais precisas e correção de discursivas
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium">Suporte Dedicado</h4>
                                <p className="text-sm text-muted-foreground">
                                    Atendimento prioritário para suas dúvidas
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Note */}
            <div className="text-center text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Pagamento seguro processado pelo Stripe</span>
                </div>
                <p className="mt-1">Cancele a qualquer momento. Sem taxas de cancelamento.</p>
            </div>
        </div>
    );
}
