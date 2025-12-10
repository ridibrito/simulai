'use client'

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
    Sparkles,
    BookOpen,
    Target,
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    ChevronRight,
    RefreshCw,
    Lightbulb,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Recommendation {
    id: string;
    type: string;
    title: string;
    description: string;
    priority: string;
    is_read: boolean;
    created_at: string;
}

export default function RecommendationsPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: recommendations, isLoading, refetch, isFetching } = useQuery<Recommendation[]>({
        queryKey: ["/api/recommendations"],
        queryFn: async () => {
            const res = await fetch('/api/recommendations');
            if (!res.ok) return [];
            return res.json();
        },
    });

    const markAsReadMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/recommendations/${id}/read`, {
                method: 'PATCH',
            });
            if (!res.ok) throw new Error('Erro ao marcar como lida');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
        },
    });

    const generateRecommendationsMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/recommendations/generate', {
                method: 'POST',
            });
            if (!res.ok) throw new Error('Erro ao gerar recomendações');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
            toast({
                title: "Recomendações geradas!",
                description: "A IA analisou seu desempenho e criou novas sugestões.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Erro",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'study_focus': return BookOpen;
            case 'material': return FileText;
            case 'exam': return Target;
            default: return Lightbulb;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'study_focus': return 'Foco de Estudo';
            case 'material': return 'Material';
            case 'exam': return 'Simulado';
            default: return 'Sugestão';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'destructive';
            case 'medium': return 'secondary';
            default: return 'outline';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'high': return 'Alta Prioridade';
            case 'medium': return 'Média Prioridade';
            default: return 'Baixa Prioridade';
        }
    };

    const handleMarkAsRead = (id: string) => {
        markAsReadMutation.mutate(id);
    };

    const unreadRecommendations = recommendations?.filter(r => !r.is_read) || [];
    const readRecommendations = recommendations?.filter(r => r.is_read) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-primary" />
                        Recomendações da IA
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Sugestões personalizadas baseadas no seu desempenho
                    </p>
                </div>
                <Button
                    onClick={() => generateRecommendationsMutation.mutate()}
                    disabled={generateRecommendationsMutation.isPending}
                    className="gap-2"
                >
                    {generateRecommendationsMutation.isPending ? (
                        <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Gerando...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4" />
                            Gerar Novas Sugestões
                        </>
                    )}
                </Button>
            </div>

            {/* Info Card */}
            <Card className="border-primary/30 bg-primary/5">
                <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                            <p className="font-medium text-primary">Como funcionam as recomendações?</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Nossa IA analisa seu desempenho em simulados, identifica suas áreas mais fracas
                                e sugere ações específicas para melhorar sua preparação. Complete mais simulados
                                para receber sugestões mais precisas.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Loading State */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <Skeleton className="h-6 w-1/3 mb-4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3 mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <>
                    {/* Unread Recommendations */}
                    {unreadRecommendations.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-primary" />
                                Novas Recomendações ({unreadRecommendations.length})
                            </h2>
                            <div className="space-y-4">
                                {unreadRecommendations.map((rec, index) => {
                                    const TypeIcon = getTypeIcon(rec.type);
                                    return (
                                        <motion.div
                                            key={rec.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                                                <CardContent className="p-6">
                                                    <div className="flex items-start gap-4">
                                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                            <TypeIcon className="h-6 w-6 text-primary" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                                <div>
                                                                    <h3 className="font-semibold text-lg">{rec.title}</h3>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {getTypeLabel(rec.type)}
                                                                        </Badge>
                                                                        <Badge variant={getPriorityColor(rec.priority) as any} className="text-xs">
                                                                            {getPriorityLabel(rec.priority)}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleMarkAsRead(rec.id)}
                                                                    disabled={markAsReadMutation.isPending}
                                                                >
                                                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                                                    Marcar como lida
                                                                </Button>
                                                            </div>
                                                            <p className="text-muted-foreground">{rec.description}</p>

                                                            {/* Action buttons based on type */}
                                                            <div className="flex items-center gap-2 mt-4">
                                                                {rec.type === 'study_focus' && (
                                                                    <Link href="/materials">
                                                                        <Button variant="outline" size="sm" className="gap-1">
                                                                            Ver Materiais
                                                                            <ChevronRight className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                )}
                                                                {rec.type === 'exam' && (
                                                                    <Link href="/exams/new">
                                                                        <Button variant="outline" size="sm" className="gap-1">
                                                                            Criar Simulado
                                                                            <ChevronRight className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                )}
                                                                {rec.type === 'material' && (
                                                                    <Link href="/materials">
                                                                        <Button variant="outline" size="sm" className="gap-1">
                                                                            Adicionar Material
                                                                            <ChevronRight className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {recommendations?.length === 0 && (
                        <Card className="py-12">
                            <CardContent className="flex flex-col items-center justify-center text-center">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <Sparkles className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Nenhuma recomendação ainda</h3>
                                <p className="text-muted-foreground max-w-sm mb-6">
                                    Complete alguns simulados para que a IA possa analisar seu desempenho e gerar sugestões personalizadas.
                                </p>
                                <div className="flex gap-3">
                                    <Link href="/exams/new">
                                        <Button className="gap-2">
                                            <Target className="h-4 w-4" />
                                            Criar Simulado
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        onClick={() => generateRecommendationsMutation.mutate()}
                                        disabled={generateRecommendationsMutation.isPending}
                                        className="gap-2"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Gerar Sugestões
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Read Recommendations */}
                    {readRecommendations.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
                                <CheckCircle2 className="h-5 w-5" />
                                Já Visualizadas ({readRecommendations.length})
                            </h2>
                            <div className="space-y-3">
                                {readRecommendations.slice(0, 5).map((rec) => {
                                    const TypeIcon = getTypeIcon(rec.type);
                                    return (
                                        <Card key={rec.id} className="opacity-60">
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                        <TypeIcon className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium line-clamp-1">{rec.title}</h3>
                                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                                            {rec.description}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className="shrink-0 text-xs">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Lida
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
