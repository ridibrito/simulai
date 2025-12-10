'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
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
import { createClient } from "@/lib/supabase/client";
import {
    User,
    Mail,
    BookOpen,
    Target,
    Loader2,
    Save,
    LogOut,
    Shield,
    Camera,
} from "lucide-react";

const profileFormSchema = z.object({
    first_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(50),
    last_name: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres").max(50),
    study_area: z.string().optional(),
    target_exam: z.string().optional(),
    study_goal: z.string().max(500).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const studyAreas = [
    "Direito",
    "Administração",
    "Contabilidade",
    "Economia",
    "TI",
    "Engenharia",
    "Medicina",
    "Outros",
];

const targetExams = [
    "Concurso Federal",
    "Concurso Estadual",
    "Concurso Municipal",
    "OAB",
    "ENEM",
    "Vestibular",
    "Certificação TI",
    "Outros",
];

export default function ProfilePage() {
    const { user, isLoading: authLoading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            study_area: "",
            target_exam: "",
            study_goal: "",
        },
    });

    // Load profile data
    useEffect(() => {
        const loadProfile = async () => {
            if (!user) return;

            try {
                const { data: profile, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (profile) {
                    form.reset({
                        first_name: profile.first_name || user.user_metadata?.first_name || "",
                        last_name: profile.last_name || user.user_metadata?.last_name || "",
                        study_area: profile.study_area || "",
                        target_exam: profile.target_exam || "",
                        study_goal: profile.study_goal || "",
                    });
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (!authLoading) {
            loadProfile();
        }
    }, [user, authLoading, form, supabase]);

    const onSubmit = async (data: ProfileFormValues) => {
        if (!user) return;

        setIsSaving(true);
        try {
            // Update profile in database
            const { error: dbError } = await supabase
                .from('users')
                .update({
                    first_name: data.first_name,
                    last_name: data.last_name,
                    study_area: data.study_area,
                    target_exam: data.target_exam,
                    study_goal: data.study_goal,
                })
                .eq('id', user.id);

            if (dbError) throw dbError;

            // Update auth user metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    first_name: data.first_name,
                    last_name: data.last_name,
                },
            });

            if (authError) throw authError;

            toast({
                title: "Perfil atualizado!",
                description: "Suas informações foram salvas com sucesso.",
            });
        } catch (error) {
            console.error('Error saving profile:', error);
            toast({
                title: "Erro ao salvar",
                description: "Não foi possível atualizar seu perfil. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const getInitials = () => {
        const firstName = form.watch('first_name') || user?.user_metadata?.first_name || '';
        const lastName = form.watch('last_name') || user?.user_metadata?.last_name || '';
        const first = firstName.charAt(0) || '';
        const last = lastName.charAt(0) || '';
        return (first + last).toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';
    };

    if (authLoading || isLoading) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                    </div>
                </div>
                <Card>
                    <CardContent className="p-6 space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="space-y-2">
                                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                                <div className="h-10 w-full bg-muted animate-pulse rounded" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header with Avatar */}
            <div className="flex items-center gap-6">
                <div className="relative group">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-6 w-6 text-white" />
                    </button>
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Meu Perfil</h1>
                    <p className="text-muted-foreground">{user?.email}</p>
                </div>
            </div>

            {/* Profile Form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Informações Pessoais
                            </CardTitle>
                            <CardDescription>
                                Atualize suas informações de perfil
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Seu nome" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="last_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sobrenome</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Seu sobrenome" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="pt-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span>Email: {user?.email}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                Preferências de Estudo
                            </CardTitle>
                            <CardDescription>
                                Configure suas preferências para recomendações personalizadas
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="study_area"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Área de Estudo</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione sua área" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {studyAreas.map(area => (
                                                        <SelectItem key={area} value={area}>
                                                            {area}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="target_exam"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Objetivo</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione seu objetivo" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {targetExams.map(exam => (
                                                        <SelectItem key={exam} value={exam}>
                                                            {exam}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="study_goal"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Meta de Estudo</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Descreva seus objetivos de estudo, metas, concursos específicos que deseja prestar..."
                                                className="min-h-[100px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Essas informações ajudam a IA a gerar recomendações mais relevantes
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSaving} className="gap-2">
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Salvar Alterações
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>

            {/* Account Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Conta
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium">Alterar Senha</p>
                            <p className="text-sm text-muted-foreground">
                                Atualize sua senha de acesso
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <a href="/auth/reset-password">Alterar</a>
                        </Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium text-destructive">Sair da Conta</p>
                            <p className="text-sm text-muted-foreground">
                                Encerrar sua sessão neste dispositivo
                            </p>
                        </div>
                        <Button variant="destructive" onClick={handleLogout} className="gap-2">
                            <LogOut className="h-4 w-4" />
                            Sair
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
