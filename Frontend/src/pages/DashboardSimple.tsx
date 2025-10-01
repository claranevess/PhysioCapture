import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Users, Activity, FileText, Heart } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/patients?search=${searchQuery}`);
  };

  const stats = [
    { 
      title: "Total de Pacientes", 
      value: "248", 
      icon: Users, 
      color: "text-primary",
      change: "+12 este mês"
    },
    { 
      title: "Documentos Digitalizados", 
      value: "127", 
      icon: FileText, 
      color: "text-blue-600",
      change: "+23 hoje"
    },
    { 
      title: "Atividades Hoje", 
      value: "15", 
      icon: Activity, 
      color: "text-green-600",
      change: "em andamento"
    },
    { 
      title: "Consultas Agendadas", 
      value: "8", 
      icon: Heart, 
      color: "text-purple-600",
      change: "para hoje"
    },
  ];

  const recentPatients = [
    { 
      id: 1, 
      name: "Maria Silva", 
      lastVisit: "Hoje", 
      status: "Em tratamento",
      lastActivity: "Ficha digitalizada"
    },
    { 
      id: 2, 
      name: "João Santos", 
      lastVisit: "Ontem", 
      status: "Recuperação",
      lastActivity: "Evolução registrada"
    },
    { 
      id: 3, 
      name: "Ana Costa", 
      lastVisit: "2 dias atrás", 
      status: "Avaliação",
      lastActivity: "Prontuário atualizado"
    },
    { 
      id: 4, 
      name: "Pedro Oliveira", 
      lastVisit: "3 dias atrás", 
      status: "Novo",
      lastActivity: "Cadastro inicial"
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header simples */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das atividades da clínica</p>
        </div>

        {/* Estatísticas básicas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Busca de pacientes */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Paciente</CardTitle>
            <CardDescription>
              Digite nome, CPF ou informações do paciente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                placeholder="Ex: Maria Silva, 123.456.789-00..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Ações rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button onClick={() => navigate("/patients/new")} className="h-16 flex-col gap-2">
                <UserPlus className="h-6 w-6" />
                <span>Novo Paciente</span>
              </Button>
              <Button onClick={() => navigate("/documents")} variant="outline" className="h-16 flex-col gap-2">
                <FileText className="h-6 w-6" />
                <span>Digitalizar Documento</span>
              </Button>
              <Button onClick={() => navigate("/activities")} variant="outline" className="h-16 flex-col gap-2">
                <Activity className="h-6 w-6" />
                <span>Ver Atividades</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pacientes recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Pacientes Recentes</CardTitle>
            <CardDescription>
              Últimos pacientes atendidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">Última visita: {patient.lastVisit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{patient.status}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">{patient.lastActivity}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}