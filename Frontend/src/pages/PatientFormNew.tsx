import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Camera, Smartphone, Mic, Upload, Zap, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PatientFormNew() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = Boolean(id && id !== "new");

  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    emergencyContact: "",
    emergencyPhone: "",
    allergies: "",
    conditions: "",
    medications: "",
    // Novos campos PhysioCapture
    mainCondition: "",
    painLevel: "5",
    mobilityLevel: "3",
    treatmentGoals: "",
    previousTreatments: "",
    devicePreference: "",
    enableSmartwatch: false,
    enableTranscription: false,
    enablePhotoCapture: false,
    privacyConsent: false,
  });

  const [uploadStatus, setUploadStatus] = useState({
    ficha: "pending", // pending, uploading, success, error
    device: "pending",
    photo: "pending"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoCapture = () => {
    setUploadStatus(prev => ({ ...prev, photo: "uploading" }));
    // Simular upload de foto
    setTimeout(() => {
      setUploadStatus(prev => ({ ...prev, photo: "success" }));
      toast({
        title: "Foto capturada!",
        description: "Foto do paciente salva com sucesso.",
      });
    }, 2000);
  };

  const handleFichaDigitalizacao = () => {
    setUploadStatus(prev => ({ ...prev, ficha: "uploading" }));
    // Simular digitalização
    setTimeout(() => {
      setUploadStatus(prev => ({ ...prev, ficha: "success" }));
      // Auto-preenchimento simulado
      setFormData(prev => ({
        ...prev,
        name: "Maria Silva (Auto-detectado)",
        cpf: "123.456.789-00",
        mainCondition: "Dor lombar crônica",
        painLevel: "7",
        mobilityLevel: "2"
      }));
      toast({
        title: "Ficha digitalizada com sucesso!",
        description: "Dados extraídos automaticamente e campos preenchidos.",
      });
    }, 3000);
  };

  const handleDeviceConnection = () => {
    setUploadStatus(prev => ({ ...prev, device: "uploading" }));
    // Simular conexão com dispositivo
    setTimeout(() => {
      setUploadStatus(prev => ({ ...prev, device: "success" }));
      toast({
        title: "Dispositivo conectado!",
        description: "Apple Watch conectado para coleta automática de dados.",
      });
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "uploading":
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.privacyConsent) {
      toast({
        title: "Consentimento necessário",
        description: "É necessário concordar com os termos de privacidade.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: isEditing ? "Paciente atualizado!" : "Paciente cadastrado!",
      description: "As informações foram salvas com sucesso no PhysioCapture.",
    });
    navigate(isEditing ? `/patients/${id}` : "/patients/1");
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-primary-light"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text-alt">
              {isEditing ? "Editar Paciente" : "PhysioCapture - Novo Paciente"}
            </h1>
            <p className="text-muted-foreground mt-2">
              Use nossa tecnologia para capturar dados automaticamente
            </p>
          </div>
        </div>

        {/* Ferramentas PhysioCapture */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-2 border-blue-200 bg-blue-50 hover-lift cursor-pointer" onClick={handleFichaDigitalizacao}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800">Digitalizar Ficha</h3>
                    <p className="text-sm text-blue-600">Fotografe e extraia dados</p>
                  </div>
                </div>
                {getStatusIcon(uploadStatus.ficha)}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-white border-blue-300 text-blue-700 hover:bg-blue-100"
                disabled={uploadStatus.ficha === "uploading"}
              >
                {uploadStatus.ficha === "uploading" ? "Digitalizando..." : "Iniciar Digitalização"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50 hover-lift cursor-pointer" onClick={handleDeviceConnection}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">Conectar Dispositivo</h3>
                    <p className="text-sm text-green-600">Smartwatch ou sensor</p>
                  </div>
                </div>
                {getStatusIcon(uploadStatus.device)}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-white border-green-300 text-green-700 hover:bg-green-100"
                disabled={uploadStatus.device === "uploading"}
              >
                {uploadStatus.device === "uploading" ? "Conectando..." : "Conectar Agora"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-purple-50 hover-lift cursor-pointer" onClick={handlePhotoCapture}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-800">Foto do Paciente</h3>
                    <p className="text-sm text-purple-600">Capturar imagem</p>
                  </div>
                </div>
                {getStatusIcon(uploadStatus.photo)}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-white border-purple-300 text-purple-700 hover:bg-purple-100"
                disabled={uploadStatus.photo === "uploading"}
              >
                {uploadStatus.photo === "uploading" ? "Capturando..." : "Tirar Foto"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Digite o nome completo"
                      required
                      className="border-2 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      placeholder="000.000.000-00"
                      required
                      className="border-2 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento *</Label>
                    <Input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleChange}
                      required
                      className="border-2 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                      required
                      className="border-2 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@exemplo.com"
                      className="border-2 focus:border-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Clínicas PhysioCapture */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Avaliação PhysioCapture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="mainCondition">Condição Principal *</Label>
                    <Input
                      id="mainCondition"
                      name="mainCondition"
                      value={formData.mainCondition}
                      onChange={handleChange}
                      placeholder="Ex: Dor lombar crônica, lesão no joelho..."
                      required
                      className="border-2 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="painLevel">Nível de Dor (0-10)</Label>
                    <Select value={formData.painLevel} onValueChange={(value) => handleSelectChange('painLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(11)].map((_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i} - {i === 0 ? "Sem dor" : i <= 3 ? "Leve" : i <= 6 ? "Moderada" : i <= 8 ? "Forte" : "Insuportável"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobilityLevel">Nível de Mobilidade (1-5)</Label>
                    <Select value={formData.mobilityLevel} onValueChange={(value) => handleSelectChange('mobilityLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Muito limitada</SelectItem>
                        <SelectItem value="2">2 - Limitada</SelectItem>
                        <SelectItem value="3">3 - Moderada</SelectItem>
                        <SelectItem value="4">4 - Boa</SelectItem>
                        <SelectItem value="5">5 - Excelente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="treatmentGoals">Objetivos do Tratamento</Label>
                    <Textarea
                      id="treatmentGoals"
                      name="treatmentGoals"
                      value={formData.treatmentGoals}
                      onChange={handleChange}
                      placeholder="Descreva os objetivos principais do tratamento..."
                      className="border-2 focus:border-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configurações PhysioCapture */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-green-600" />
                  Configurações de Coleta de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-green-200 bg-white">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium">Conectar Smartwatch</h4>
                        <p className="text-sm text-muted-foreground">Coleta automática de dados de atividade</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.enableSmartwatch}
                      onCheckedChange={(checked) => handleSwitchChange('enableSmartwatch', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-purple-200 bg-white">
                    <div className="flex items-center gap-3">
                      <Mic className="h-5 w-5 text-purple-600" />
                      <div>
                        <h4 className="font-medium">Transcrição de Consultas</h4>
                        <p className="text-sm text-muted-foreground">Gravação e transcrição automática das sessões</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.enableTranscription}
                      onCheckedChange={(checked) => handleSwitchChange('enableTranscription', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border border-blue-200 bg-white">
                    <div className="flex items-center gap-3">
                      <Camera className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Captura de Fotos/Documentos</h4>
                        <p className="text-sm text-muted-foreground">Digitalização automática de fichas e exames</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.enablePhotoCapture}
                      onCheckedChange={(checked) => handleSwitchChange('enablePhotoCapture', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Termos e Consentimento */}
            <Card className="border-2 border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  Consentimento e Privacidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-white">
                  <Switch
                    id="privacyConsent"
                    checked={formData.privacyConsent}
                    onCheckedChange={(checked) => handleSwitchChange('privacyConsent', checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="privacyConsent" className="font-medium cursor-pointer">
                      Concordo com os termos de uso do PhysioCapture *
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Autorizo a coleta, processamento e armazenamento de dados de saúde pelo sistema PhysioCapture para fins de tratamento médico. Os dados serão tratados com confidencialidade e segurança máxima, seguindo a LGPD.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-primary hover:opacity-90"
                disabled={!formData.privacyConsent}
              >
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Atualizar Paciente" : "Cadastrar Paciente"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}