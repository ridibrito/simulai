import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Upload,
  FileText,
  BookOpen,
  Sparkles,
  Trash2,
  Search,
  File,
  Eye,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const mockMaterials = [
  {
    id: "1",
    title: "Apostila Direito Constitucional",
    type: "pdf",
    fileName: "direito_constitucional.pdf",
    summary: "Este material aborda os princípios fundamentais da Constituição Federal, incluindo direitos e garantias fundamentais, organização do Estado e dos Poderes.",
    createdAt: "2024-01-15",
    hasSummary: true,
  },
  {
    id: "2",
    title: "Resumo de Português",
    type: "pdf",
    fileName: "portugues_resumo.pdf",
    summary: null,
    createdAt: "2024-01-14",
    hasSummary: false,
  },
  {
    id: "3",
    title: "Matemática Financeira - Slides",
    type: "pdf",
    fileName: "matematica_slides.pdf",
    summary: "Coletânea de slides sobre juros simples, juros compostos, descontos e séries de pagamentos.",
    createdAt: "2024-01-13",
    hasSummary: true,
  },
];

export default function Materials() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo PDF.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo PDF.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);
      setSelectedFile(null);
      setIsUploadDialogOpen(false);
      toast({
        title: "Upload concluído!",
        description: "Seu material foi enviado. A IA está gerando o resumo...",
      });
    }, 2500);
  };

  const generateSummaryMutation = useMutation({
    mutationFn: async (materialId: string) => {
      return apiRequest("POST", `/api/materials/${materialId}/summary`, {});
    },
    onSuccess: () => {
      toast({
        title: "Resumo gerado!",
        description: "O resumo do seu material está pronto.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
    },
    onError: () => {
      toast({
        title: "Erro ao gerar resumo",
        description: "Não foi possível gerar o resumo. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const filteredMaterials = mockMaterials.filter((material) =>
    material.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-materials-title">
            Materiais de Estudo
          </h1>
          <p className="text-muted-foreground mt-1">
            Envie seus PDFs e a IA gerará resumos automáticos.
          </p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-upload-material">
              <Upload className="h-4 w-4" />
              Enviar Material
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enviar Material</DialogTitle>
              <DialogDescription>
                Arraste um arquivo PDF ou clique para selecionar.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25"
                }`}
              >
                {selectedFile ? (
                  <div className="space-y-2">
                    <File className="h-12 w-12 mx-auto text-primary" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      className="gap-1"
                    >
                      <X className="h-4 w-4" />
                      Remover
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                      Arraste seu PDF aqui ou
                    </p>
                    <label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        data-testid="input-file-upload"
                      />
                      <Button variant="outline" asChild>
                        <span className="cursor-pointer">Selecionar arquivo</span>
                      </Button>
                    </label>
                  </>
                )}
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Enviando...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                  disabled={isUploading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="gap-2"
                  data-testid="button-confirm-upload"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar materiais..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
          data-testid="input-search-materials"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMaterials.map((material) => (
          <Card key={material.id} className="hover-elevate" data-testid={`card-material-${material.id}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{material.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {material.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(material.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              {material.hasSummary && material.summary && (
                <div className="p-3 rounded-lg bg-muted/50 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium">Resumo da IA</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {material.summary}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {material.hasSummary ? (
                  <Button variant="outline" className="flex-1 gap-2" data-testid={`button-view-summary-${material.id}`}>
                    <Eye className="h-4 w-4" />
                    Ver Resumo
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => generateSummaryMutation.mutate(material.id)}
                    disabled={generateSummaryMutation.isPending}
                    data-testid={`button-generate-summary-${material.id}`}
                  >
                    {generateSummaryMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Gerar Resumo
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  data-testid={`button-delete-material-${material.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <Card className="p-12" data-testid="empty-state-materials">
          <div className="text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum material encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Envie seus PDFs e a IA gerará resumos automáticos para facilitar seus estudos.
            </p>
            <Button
              className="gap-2"
              onClick={() => setIsUploadDialogOpen(true)}
            >
              <Upload className="h-4 w-4" />
              Enviar Material
            </Button>
          </div>
        </Card>
      )}

      <Card className="border-primary/20 bg-primary/5" data-testid="card-ai-info">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Resumos Inteligentes</h3>
              <p className="text-sm text-muted-foreground">
                Nossa IA analisa seus materiais e gera resumos claros e objetivos,
                destacando os pontos mais importantes para seus estudos. Ideal para
                revisões rápidas antes das provas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
