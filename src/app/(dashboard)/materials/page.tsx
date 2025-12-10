'use client'

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
    BookOpen,
    Plus,
    Search,
    MoreVertical,
    Trash2,
    Eye,
    FileText,
    Sparkles,
    Calendar,
    Loader2,
    AlertCircle,
    X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Material {
    id: string;
    title: string;
    content: string | null;
    summary: string | null;
    file_url: string | null;
    type: string;
    created_at: string;
}

export default function MaterialsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: materials, isLoading } = useQuery<Material[]>({
        queryKey: ["/api/materials"],
        queryFn: async () => {
            const res = await fetch('/api/materials');
            if (!res.ok) return [];
            return res.json();
        },
    });

    const createMaterialMutation = useMutation({
        mutationFn: async (data: { title: string; content: string }) => {
            const res = await fetch('/api/materials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Falha ao criar material');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
            toast({
                title: "Material criado!",
                description: "Seu material foi salvo e a IA gerou um resumo.",
            });
            setIsCreateOpen(false);
            setNewTitle("");
            setNewContent("");
        },
        onError: (error: Error) => {
            toast({
                title: "Erro ao criar material",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const deleteMaterialMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/materials/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Falha ao excluir material');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
            toast({
                title: "Material excluído",
                description: "O material foi removido com sucesso.",
            });
            setDeleteDialogOpen(false);
            setMaterialToDelete(null);
        },
        onError: (error: Error) => {
            toast({
                title: "Erro ao excluir",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const filteredMaterials = materials?.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleView = (material: Material) => {
        setSelectedMaterial(material);
        setIsViewOpen(true);
    };

    const handleDeleteClick = (material: Material) => {
        setMaterialToDelete(material);
        setDeleteDialogOpen(true);
    };

    const handleCreate = () => {
        if (!newTitle.trim()) {
            toast({
                title: "Título obrigatório",
                description: "Por favor, insira um título para o material.",
                variant: "destructive",
            });
            return;
        }
        if (!newContent.trim()) {
            toast({
                title: "Conteúdo obrigatório",
                description: "Por favor, insira o conteúdo do material.",
                variant: "destructive",
            });
            return;
        }
        createMaterialMutation.mutate({ title: newTitle, content: newContent });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getContentPreview = (content: string | null, maxLength: number = 150) => {
        if (!content) return "Sem conteúdo";
        return content.length > maxLength ? content.substring(0, maxLength) + "..." : content;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Materiais de Estudo</h1>
                    <p className="text-muted-foreground mt-1">
                        Adicione seus materiais e a IA gerará resumos automáticos
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Novo Material
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Adicionar Material de Estudo</DialogTitle>
                            <DialogDescription>
                                Cole o conteúdo do seu material. A IA irá gerar um resumo automaticamente.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título *</Label>
                                <Input
                                    id="title"
                                    placeholder="Ex: Direito Constitucional - Controle de Constitucionalidade"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">Conteúdo *</Label>
                                <Textarea
                                    id="content"
                                    placeholder="Cole aqui o conteúdo do seu material de estudo..."
                                    className="min-h-[300px] resize-none"
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {newContent.length} caracteres
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={createMaterialMutation.isPending}
                                className="gap-2"
                            >
                                {createMaterialMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4" />
                                        Salvar e Gerar Resumo
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar materiais..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Materials Grid */}
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredMaterials.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence>
                        {filteredMaterials.map((material, index) => (
                            <motion.div
                                key={material.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 h-full flex flex-col">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="space-y-1 flex-1">
                                                <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                                                    {material.title}
                                                </CardTitle>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleView(material)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Visualizar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteClick(material)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col">
                                        {/* Summary Badge */}
                                        {material.summary && (
                                            <div className="mb-3">
                                                <Badge variant="secondary" className="gap-1">
                                                    <Sparkles className="h-3 w-3" />
                                                    Resumo IA disponível
                                                </Badge>
                                            </div>
                                        )}

                                        {/* Content Preview */}
                                        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                                            {getContentPreview(material.summary || material.content)}
                                        </p>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(material.created_at)}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleView(material)}
                                                className="gap-1"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Ver
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <Card className="py-12">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                            {searchQuery ? "Nenhum material encontrado" : "Nenhum material adicionado"}
                        </h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            {searchQuery
                                ? "Tente buscar com outros termos."
                                : "Adicione seus materiais de estudo e a IA irá gerar resumos para facilitar sua revisão."}
                        </p>
                        {!searchQuery && (
                            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Adicionar Material
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* View Material Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedMaterial?.title}</DialogTitle>
                        <DialogDescription>
                            Adicionado em {selectedMaterial?.created_at ? formatDate(selectedMaterial.created_at) : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        {/* AI Summary */}
                        {selectedMaterial?.summary && (
                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    <span className="font-semibold text-primary">Resumo Gerado pela IA</span>
                                </div>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <p className="whitespace-pre-wrap">{selectedMaterial.summary}</p>
                                </div>
                            </div>
                        )}

                        {/* Original Content */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="h-5 w-5" />
                                <span className="font-semibold">Conteúdo Original</span>
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <p className="whitespace-pre-wrap text-muted-foreground">
                                    {selectedMaterial?.content || "Sem conteúdo"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            Excluir Material
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir o material <strong>{materialToDelete?.title}</strong>?
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => materialToDelete && deleteMaterialMutation.mutate(materialToDelete.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteMaterialMutation.isPending}
                        >
                            {deleteMaterialMutation.isPending ? "Excluindo..." : "Excluir"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
