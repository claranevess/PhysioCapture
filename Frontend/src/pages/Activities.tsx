import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, TrendingUp, Users, Calendar, FileText, Clock, Search, Filter, Download, Eye, Camera, Mic, Smartphone } from "lucide-react";

export default function Activities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [timeFilter, setTimeFilter] = useState("today");

  const activities = [
    { 
      id: 1, 
      patient: "Maria Silva", 
      action: "Ficha digitalizada via PhysioCapture", 
      date: "2025-10-01 14:30", 
      type: "digitalizacao",
      details: "Avaliação inicial - Dor lombar",
      duration: "2 min",
      device: "Camera"
    },
    { 
      id: 2, 
      patient: "João Santos", 
      action: "Dados coletados do smartwatch", 
      date: "2025-10-01 13:15", 
      type: "dispositivo",
      details: "Exercícios em casa - 45min de atividade",
      duration: "Automático",
      device: "Apple Watch"
    },
    { 
      id: 3, 
      patient: "Ana Costa", 
      action: "Consulta transcrita automaticamente", 
      date: "2025-10-01 11:00", 
      type: "transcricao",
      details: "Sessão de fisioterapia - Progresso positivo",
      duration: "30 min",
      device: "Microfone"
    },
    { 
      id: 4, 
      patient: "Pedro Oliveira", 
      action: "Paciente cadastrado no sistema", 
      date: "2025-10-01 10:45", 
      type: "cadastro",
      details: "Novo paciente - Primeira consulta agendada",
      duration: "5 min",
      device: "Manual"
    },
    { 
      id: 5, 
      patient: "Juliana Lima", 
      action: "Equipamento de fisioterapia conectado", 
      date: "2025-10-01 09:30", 
      type: "equipamento",
      details: "Dados de exercício coletados - Esteira ergométrica",
      duration: "Automático",
      device: "Esteira Smart"
    },
    { 
      id: 6, 
      patient: "Carlos Mendes", 
      action: "Relatório de progresso gerado", 
      date: "2025-09-30 16:20", 
      type: "relatorio",
      details: "Análise mensal - Melhora de 85% na mobilidade",
      duration: "Automático",
      device: "Sistema"
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "digitalizacao":
        return <Camera className="h-5 w-5 text-blue-600" />;
      case "dispositivo":
        return <Smartphone className="h-5 w-5 text-green-600" />;
      case "transcricao":
        return <Mic className="h-5 w-5 text-purple-600" />;
      case "cadastro":
        return <Users className="h-5 w-5 text-primary" />;
      case "equipamento":
        return <Activity className="h-5 w-5 text-orange-600" />;
      case "relatorio":
        return <TrendingUp className="h-5 w-5 text-indigo-600" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "digitalizacao":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "dispositivo":
        return "bg-green-100 text-green-800 border-green-200";
      case "transcricao":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "cadastro":
        return "bg-primary/10 text-primary border-primary/20";
      case "equipamento":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "relatorio":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "digitalizacao":
        return "Digitalização";
      case "dispositivo":
        return "Dispositivo";
      case "transcricao":
        return "Transcrição";
      case "cadastro":
        return "Cadastro";
      case "equipamento":
        return "Equipamento";
      case "relatorio":
        return "Relatório";
      default:
        return "Atividade";
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || activity.type === filterType;
    
    // Filtro de tempo simplificado para demonstração
    const matchesTime = timeFilter === "all" || 
                       (timeFilter === "today" && activity.date.includes("2025-10-01")) ||
                       (timeFilter === "week" && activity.date.includes("2025-10")) ||
                       (timeFilter === "month" && activity.date.includes("2025"));
    
    return matchesSearch && matchesType && matchesTime;
  });

  const stats = [
    { label: "Fichas Digitalizadas", value: "127", color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "Dispositivos Conectados", value: "15", color: "text-green-600", bgColor: "bg-green-50" },
    { label: "Horas Transcritas", value: "48h", color: "text-purple-600", bgColor: "bg-purple-50" },
    { label: "Dados Coletados", value: "2.3GB", color: "text-orange-600", bgColor: "bg-orange-50" },
  ];

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Cabeçalho */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text-alt">
              PhysioCapture em Ação
            </h1>
            <p className="text-muted-foreground mt-2">
              Acompanhe como sua clínica está transformando dados em conhecimento
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button className="gap-2 bg-gradient-primary hover:opacity-90">
              <Eye className="h-4 w-4" />
              Relatório
            </Button>
          </div>
        </div>

        {/* Estatísticas do PhysioCapture */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="hover-lift transition-all duration-300 border-2 hover:border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Activity className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros e Busca */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filtros Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por paciente, ação ou detalhe..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Tipo de atividade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as atividades</SelectItem>
                  <SelectItem value="digitalizacao">📷 Digitalização</SelectItem>
                  <SelectItem value="dispositivo">📱 Dispositivos</SelectItem>
                  <SelectItem value="transcricao">🎤 Transcrições</SelectItem>
                  <SelectItem value="equipamento">⚡ Equipamentos</SelectItem>
                  <SelectItem value="relatorio">📊 Relatórios</SelectItem>
                  <SelectItem value="cadastro">👤 Cadastros</SelectItem>
                </SelectContent>
              </Select>

              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="all">Tudo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Atividades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Atividades Recentes ({filteredActivities.length})</span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Tempo real
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="group flex items-start gap-4 p-6 rounded-xl border-2 border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 hover-lift cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {getIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {activity.action}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">Paciente:</span> {activity.patient}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <Badge className={`${getTypeColor(activity.type)} border`}>
                          {getTypeName(activity.type)}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {activity.duration}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 bg-muted/50 p-3 rounded-lg">
                      {activity.details}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        Origem: {activity.device}
                      </span>
                      <span>
                        {new Date(activity.date).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredActivities.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">
                    Nenhuma atividade encontrada
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tente ajustar os filtros ou busca
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
