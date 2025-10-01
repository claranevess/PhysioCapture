import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Edit, Phone, Mail, MapPin, AlertCircle, FileText, Upload, Eye, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PatientRecord() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    date: "",
    type: "",
  });

  const patient = {
    id: 1,
    name: "Maria Silva",
    age: 35,
    cpf: "123.456.789-00",
    phone: "(11) 98765-4321",
    email: "maria@email.com",
    address: "Rua das Flores, 123 - Centro, São Paulo - SP",
    emergencyContact: "João Silva",
    emergencyPhone: "(11) 98765-1234",
    allergies: "Nenhuma alergia conhecida",
    conditions: "Hipertensão controlada",
    medications: "Losartana 50mg - 1x ao dia",
  };

  const documents = [
    { id: 1, title: "Ficha de Avaliação Inicial", type: "Avaliação", date: "2025-01-15" },
    { id: 2, title: "Exame de Raio-X Coluna", type: "Exame", date: "2025-02-10" },
    { id: 3, title: "Relatório de Evolução", type: "Relatório", date: "2025-03-05" },
  ];

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Documento anexado!",
      description: "O documento foi adicionado ao prontuário.",
    });
    setIsUploadOpen(false);
    setUploadData({ title: "", date: "", type: "" });
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/patients")}
              className="hover:bg-primary-light flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-2xl">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
                  <p className="text-muted-foreground">{patient.age} anos • CPF: {patient.cpf}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4">
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {patient.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {patient.email}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {patient.address}
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={() => navigate(`/patients/${id}/edit`)}
            className="bg-gradient-accent hover:opacity-90"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>

        {/* Abas do Prontuário */}
        <Tabs defaultValue="resume" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resume">Resumo</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="resume" className="space-y-4 mt-6">
            {/* Informações Principais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
                  <p className="text-base font-medium">{patient.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CPF</p>
                  <p className="text-base font-medium">{patient.cpf}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                  <p className="text-base font-medium">{patient.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">E-mail</p>
                  <p className="text-base font-medium">{patient.email}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                  <p className="text-base font-medium">{patient.address}</p>
                </div>
              </CardContent>
            </Card>

            {/* Contato de Emergência */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  Contato de Emergência
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome</p>
                  <p className="text-base font-medium">{patient.emergencyContact}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                  <p className="text-base font-medium">{patient.emergencyPhone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Informações Clínicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Clínicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Alergias</p>
                  <p className="text-base">{patient.allergies}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Condições Pré-existentes</p>
                  <p className="text-base">{patient.conditions}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Medicamentos em Uso</p>
                  <p className="text-base">{patient.medications}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Documentos Anexados</h3>
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary hover:opacity-90">
                    <Upload className="mr-2 h-4 w-4" />
                    Adicionar Novo Documento
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-popover">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Documento</DialogTitle>
                    <DialogDescription>
                      Preencha as informações do documento que deseja anexar
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpload} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="doc-title">Título do Documento</Label>
                      <Input
                        id="doc-title"
                        value={uploadData.title}
                        onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-date">Data do Documento</Label>
                      <Input
                        id="doc-date"
                        type="date"
                        value={uploadData.date}
                        onChange={(e) => setUploadData({ ...uploadData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-type">Tipo de Documento</Label>
                      <Select value={uploadData.type} onValueChange={(value) => setUploadData({ ...uploadData, type: value })}>
                        <SelectTrigger id="doc-type">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="avaliacao">Avaliação</SelectItem>
                          <SelectItem value="exame">Exame</SelectItem>
                          <SelectItem value="relatorio">Relatório</SelectItem>
                          <SelectItem value="receita">Receita</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doc-file">Arquivo</Label>
                      <Input id="doc-file" type="file" required />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                        Anexar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 hover:bg-primary-light/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.type} • {new Date(doc.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="hover:bg-primary-light">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:bg-primary-light">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:bg-destructive/10 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
