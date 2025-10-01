import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserPlus, Phone, Mail, Calendar, Filter, Camera, Smartphone, TrendingUp, Activity, FileText } from "lucide-react";

export default function PatientsNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dataSourceFilter, setDataSourceFilter] = useState("all");

  const patients = [
    { 
      id: 1, 
      name: "Maria Silva", 
      cpf: "123.456.789-00", 
      phone: "(11) 98765-4321", 
      email: "maria@email.com", 
      age: 35, 
      status: "Em tratamento",
      condition: "Dor lombar crônica",
      lastVisit: "Hoje",
      improvement: "+15%",
      dataSource: "ficha-digitalizada",
      deviceConnected: true,
      aiInsights: "Melhora significativa na mobilidade"
    },
    { 
      id: 2, 
      name: "João Santos", 
      cpf: "987.654.321-00", 
      phone: "(11) 98765-1234", 
      email: "joao@email.com", 
      age: 42, 
      status: "Recuperação",
      condition: "Lesão no joelho",
      lastVisit: "Ontem",
      improvement: "+32%",
      dataSource: "transcricao",
      deviceConnected: true,
      aiInsights: "Progresso excelente, alta em 2 semanas"
    },
    { 
      id: 3, 
      name: "Ana Costa", 
      cpf: "456.789.123-00", 
      phone: "(11) 98765-5678", 
      email: "ana@email.com", 
      age: 28, 
      status: "Em tratamento",
      condition: "Tendinite ombro",
      lastVisit: "2 dias atrás",
      improvement: "+8%",
      dataSource: "dispositivo",
      deviceConnected: true,
      aiInsights: "Necessário ajustar intensidade dos exercícios"
    },
    { 
      id: 4, 
      name: "Pedro Oliveira", 
      cpf: "321.654.987-00", 
      phone: "(11) 98765-8765", 
      email: "pedro@email.com", 
      age: 55, 
      status: "Avaliação",
      condition: "Hérnia de disco",
      lastVisit: "3 dias atrás",
      improvement: "Novo",
      dataSource: "manual",
      deviceConnected: false,
      aiInsights: "Avaliação inicial completa necessária"
    },
    { 
      id: 5, 
      name: "Juliana Lima", 
      cpf: "789.123.456-00", 
      phone: "(11) 98765-4567", 
      email: "juliana@email.com", 
      age: 31, 
      status: "Em tratamento",
      condition: "Fibromialgia",
      lastVisit: "1 semana atrás",
      improvement: "+22%",
      dataSource: "ficha-digitalizada",
      deviceConnected: true,
      aiInsights: "Respondendo bem ao tratamento multidisciplinar"
    },
    { 
      id: 6, 
      name: "Carlos Mendes", 
      cpf: "654.321.789-00", 
      phone: "(11) 98765-7890", 
      email: "carlos@email.com", 
      age: 48, 
      status: "Recuperação",
      condition: "Bursite",
      lastVisit: "4 dias atrás",
      improvement: "+28%",
      dataSource: "transcricao",
      deviceConnected: false,
      aiInsights: "Evolução dentro do esperado"
    },
  ];

  const getDataSourceIcon = (source: string) => {
    switch (source) {
      case "ficha-digitalizada":
        return <Camera className="h-4 w-4 text-blue-600" />;
      case "dispositivo":
        return <Smartphone className="h-4 w-4 text-green-600" />;
      case "transcricao":
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDataSourceLabel = (source: string) => {
    switch (source) {
      case "ficha-digitalizada":
        return "Ficha Digitalizada";
      case "dispositivo":
        return "Dispositivo IoT";
      case "transcricao":
        return "Transcrição IA";
      default:
        return "Manual";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Em tratamento":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Recuperação":
        return "bg-green-100 text-green-800 border-green-200";
      case "Avaliação":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.cpf.includes(searchQuery) ||
                         patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.condition.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
    const matchesDataSource = dataSourceFilter === "all" || patient.dataSource === dataSourceFilter;
    
    return matchesSearch && matchesStatus && matchesDataSource;
  });

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Cabeçalho */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text-alt">
              Pacientes PhysioCapture
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie pacientes com dados inteligentes e análises automáticas
            </p>
          </div>
          <Button
            onClick={() => navigate("/patients/new")}
            className="bg-gradient-primary hover:opacity-90 shadow-md"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Paciente
          </Button>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-700">{patients.filter(p => p.dataSource === 'ficha-digitalizada').length}</p>
                  <p className="text-sm text-blue-600">Fichas Digitalizadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-700">{patients.filter(p => p.deviceConnected).length}</p>
                  <p className="text-sm text-green-600">Dispositivos Conectados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-700">89%</p>
                  <p className="text-sm text-purple-600">Melhora Média</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-orange-700">{patients.filter(p => p.status === 'Em tratamento').length}</p>
                  <p className="text-sm text-orange-600">Em Tratamento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Busca e Filtros Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, CPF, email ou condição..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 focus:border-primary"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="Em tratamento">🔵 Em tratamento</SelectItem>
                  <SelectItem value="Recuperação">🟢 Recuperação</SelectItem>
                  <SelectItem value="Avaliação">🟡 Avaliação</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dataSourceFilter} onValueChange={setDataSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Fonte de dados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as fontes</SelectItem>
                  <SelectItem value="ficha-digitalizada">📷 Ficha digitalizada</SelectItem>
                  <SelectItem value="dispositivo">📱 Dispositivo IoT</SelectItem>
                  <SelectItem value="transcricao">🎤 Transcrição IA</SelectItem>
                  <SelectItem value="manual">✋ Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de pacientes */}
        <div className="grid gap-4">
          {filteredPatients.map((patient, index) => (
            <Card
              key={patient.id}
              className="hover-lift cursor-pointer border-2 hover:border-primary/30 transition-all duration-300 animate-fade-in group"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(`/patients/${patient.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Informações principais */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                      {patient.name.charAt(0)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                          {patient.name}
                        </h3>
                        <Badge className={`${getStatusColor(patient.status)} border text-xs`}>
                          {patient.status}
                        </Badge>
                        {patient.deviceConnected && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            🔗 Conectado
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid gap-1 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {patient.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {patient.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {patient.age} anos
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 p-3 rounded-lg mb-3">
                        <p className="text-sm font-medium text-foreground mb-1">
                          Condição: {patient.condition}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          💡 IA: {patient.aiInsights}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Métricas e indicadores */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                      {getDataSourceIcon(patient.dataSource)}
                      <span className="text-xs font-medium">
                        {getDataSourceLabel(patient.dataSource)}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {patient.improvement}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Melhora detectada
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Última visita: {patient.lastVisit}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nenhum paciente encontrado
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tente ajustar os filtros ou termo de busca
              </p>
              <Button onClick={() => navigate("/patients/new")} className="bg-gradient-primary">
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar Primeiro Paciente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Resumo dos resultados */}
        <div className="text-center text-sm text-muted-foreground">
          Mostrando {filteredPatients.length} de {patients.length} pacientes
        </div>
      </div>
    </Layout>
  );
}