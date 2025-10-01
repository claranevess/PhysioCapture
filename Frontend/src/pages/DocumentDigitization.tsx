import { useState, useRef } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Camera, 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  ScanLine,
  FolderOpen
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: 'ficha_avaliacao' | 'receituario' | 'exame' | 'evolucao' | 'outros';
  patientName: string;
  patientId: string;
  uploadDate: string;
  size: string;
  status: 'processando' | 'concluido' | 'erro';
  tags: string[];
  url?: string;
}

export default function DocumentDigitization() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Ficha de Avaliação - João Silva",
      type: "ficha_avaliacao",
      patientName: "João Silva",
      patientId: "PAC001",
      uploadDate: "2025-10-01T10:30:00",
      size: "2.3 MB",
      status: "concluido",
      tags: ["inicial", "lombalgia"]
    },
    {
      id: "2", 
      name: "Exame Radiológico - Maria Santos",
      type: "exame",
      patientName: "Maria Santos",
      patientId: "PAC002",
      uploadDate: "2025-10-01T09:15:00",
      size: "5.8 MB",
      status: "processando",
      tags: ["raio-x", "joelho"]
    },
    {
      id: "3",
      name: "Evolução Fisioterapêutica - Pedro Costa",
      type: "evolucao",
      patientName: "Pedro Costa", 
      patientId: "PAC003",
      uploadDate: "2025-09-30T16:45:00",
      size: "1.2 MB",
      status: "concluido",
      tags: ["sessao-5", "melhora"]
    }
  ]);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      setUploadProgress(0);

      // Simular upload com progresso
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            
            // Adicionar documento simulado
            const newDoc: Document = {
              id: Date.now().toString(),
              name: files[0].name,
              type: "outros",
              patientName: "Paciente Novo",
              patientId: "PAC" + (documents.length + 1).toString().padStart(3, '0'),
              uploadDate: new Date().toISOString(),
              size: `${(files[0].size / (1024 * 1024)).toFixed(1)} MB`,
              status: "processando",
              tags: ["novo"]
            };
            
            setDocuments(prev => [newDoc, ...prev]);
            
            // Simular processamento completo após 3 segundos
            setTimeout(() => {
              setDocuments(prev => 
                prev.map(doc => 
                  doc.id === newDoc.id 
                    ? { ...doc, status: "concluido" as const }
                    : doc
                )
              );
            }, 3000);
            
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const getTypeLabel = (type: string) => {
    const types = {
      ficha_avaliacao: "Ficha de Avaliação",
      receituario: "Receituário",
      exame: "Exame",
      evolucao: "Evolução",
      outros: "Outros"
    };
    return types[type as keyof typeof types] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido": return "bg-green-100 text-green-800";
      case "processando": return "bg-yellow-100 text-yellow-800";
      case "erro": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === "all" || doc.type === selectedType;
    const matchesStatus = selectedStatus === "all" || doc.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = [
    {
      title: "Documentos Digitalizados",
      value: documents.length.toString(),
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Processamentos Hoje",
      value: documents.filter(d => 
        new Date(d.uploadDate).toDateString() === new Date().toDateString()
      ).length.toString(),
      icon: ScanLine,
      color: "text-green-600"
    },
    {
      title: "Armazenamento Total",
      value: "24.7 GB",
      icon: FolderOpen,
      color: "text-purple-600"
    },
    {
      title: "Taxa de Sucesso",
      value: "98.5%",
      icon: CheckCircle,
      color: "text-emerald-600"
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text-alt">
              Digitalização de Documentos
            </h1>
            <p className="text-muted-foreground mt-2">
              Digitalize e armazene documentos físicos de forma simples e organizada
            </p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Upload de Documentos</h3>
                <p className="text-muted-foreground">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-sm text-muted-foreground">
                  Suporta: PDF, JPG, PNG, TIFF (máx. 10MB cada)
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Arquivos
                </Button>
                <Button variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Escanear com Câmera
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.tiff"
                onChange={handleFileUpload}
                className="hidden"
              />

              {isUploading && (
                <div className="w-full max-w-md space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processando...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filtros e Busca */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar documentos, pacientes ou tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="ficha_avaliacao">Ficha de Avaliação</SelectItem>
                    <SelectItem value="receituario">Receituário</SelectItem>
                    <SelectItem value="exame">Exame</SelectItem>
                    <SelectItem value="evolucao">Evolução</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="processando">Processando</SelectItem>
                    <SelectItem value="erro">Erro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Documentos */}
        <div className="grid gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="font-semibold">{doc.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>Paciente: {doc.patientName}</span>
                        <span>•</span>
                        <span>{new Date(doc.uploadDate).toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getTypeLabel(doc.type)}
                        </Badge>
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status === "concluido" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {doc.status === "processando" && <Clock className="h-3 w-3 mr-1" />}
                          {doc.status === "concluido" ? "Processado" : 
                           doc.status === "processando" ? "Processando" : "Erro"}
                        </Badge>
                        
                        {doc.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
              <p className="text-muted-foreground">
                Ajuste os filtros ou faça upload de novos documentos
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}